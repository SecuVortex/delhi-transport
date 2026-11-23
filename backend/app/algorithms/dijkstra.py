"""
Time-Dependent Dijkstra Shortest Path Routing Engine.
Computes optimal transit paths using a min-priority queue where edge traversal weights
are evaluated dynamically at simulated passenger arrival time.
Accounts for transfer waiting friction, transfer constraints, and path reconstruction.
"""

import heapq
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

from .graph import TransitGraph, TransitEdge
from ..ml.predict import predictor
from ..services.live_data_service import live_service
from ..config import ROUTING_CONFIG


class DijkstraRouter:
    def __init__(self, graph: TransitGraph):
        self.graph = graph

    def find_shortest_path(
        self,
        origin_stop_id: str,
        destination_stop_id: str,
        departure_dt: datetime,
        max_transfers: int = None,
        transfer_penalty_seconds: float = None,
        excluded_routes: Optional[List[str]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Executes time-dependent Dijkstra search between two transit stops.
        Edge weights are calculated dynamically using the ML prediction model at edge arrival time.
        """
        if origin_stop_id == destination_stop_id:
            return {
                "total_duration_seconds": 0.0,
                "transfers_count": 0,
                "departure_dt": departure_dt,
                "arrival_dt": departure_dt,
                "segments": []
            }

        max_xfer = max_transfers if max_transfers is not None else ROUTING_CONFIG["max_transfers"]
        xfer_penalty = transfer_penalty_seconds if transfer_penalty_seconds is not None else ROUTING_CONFIG["transfer_penalty_seconds"]
        excluded = set(excluded_routes or [])

        # Min-heap priority queue: (cost_seconds, entry_count, current_stop, current_route, current_dt, xfer_count, edge_history)
        heap: List[Tuple[float, int, str, Optional[str], datetime, int, List[Dict[str, Any]]]] = []
        entry_count = 0
        heapq.heappush(heap, (0.0, entry_count, origin_stop_id, None, departure_dt, 0, []))

        # Best cost tracker: (stop_id, route_id, xfer_count) -> min_cost
        best_costs: Dict[Tuple[str, Optional[str], int], float] = {}

        while heap:
            total_time, _, cur_stop, cur_route, cur_dt, xfer_count, history = heapq.heappop(heap)

            if cur_stop == destination_stop_id:
                return {
                    "total_duration_seconds": round(total_time, 1),
                    "transfers_count": xfer_count,
                    "departure_dt": departure_dt,
                    "arrival_dt": cur_dt,
                    "segments": history
                }

            state_key = (cur_stop, cur_route, xfer_count)
            if state_key in best_costs and best_costs[state_key] <= total_time:
                continue
            best_costs[state_key] = total_time

            # Explore outgoing edges
            edges = self.graph.get_outgoing_edges(cur_stop)
            for edge in edges:
                if edge.route_id in excluded:
                    continue

                # Transfer check
                is_transfer = (cur_route is not None) and (cur_route != edge.route_id)
                new_xfer_count = xfer_count + (1 if is_transfer else 0)

                if new_xfer_count > max_xfer:
                    continue


                # Transfer waiting buffer
                transfer_wait_sec = xfer_penalty if is_transfer else 0.0
                effective_departure_dt = cur_dt + timedelta(seconds=transfer_wait_sec)

                # Query ML prediction model at passenger arrival time at this segment!
                pred_result = predictor.predict_segment_travel_time(
                    segment_id=edge.segment_id,
                    segment_distance_km=edge.segment_distance_km,
                    hour=effective_departure_dt.hour,
                    minute=effective_departure_dt.minute,
                    weekday=effective_departure_dt.weekday(),
                    route_id=edge.route_id,
                    scheduled_seconds=edge.scheduled_seconds
                )

                edge_travel_sec = pred_result["predicted_travel_time_seconds"]

                # Optional real-time GPS blending with exponential freshness decay
                blend = live_service.blend_prediction(
                    segment_id=edge.segment_id,
                    segment_distance_km=edge.segment_distance_km,
                    historical_pred_seconds=edge_travel_sec
                )
                if blend["is_live_blended"]:
                    edge_travel_sec = blend["blended_seconds"]
                    pred_result["data_source"] = f"live_gps_blended ({blend['freshness_seconds']}s ago)"
                    pred_result["prediction_confidence"] = "HIGH"

                step_total_sec = transfer_wait_sec + edge_travel_sec
                new_arrival_dt = effective_departure_dt + timedelta(seconds=edge_travel_sec)

                from_stop_info = self.graph.get_stop_info(edge.from_stop_id)
                to_stop_info = self.graph.get_stop_info(edge.to_stop_id)

                segment_record = {
                    "segment_id": edge.segment_id,
                    "route_id": edge.route_id,
                    "route_name": edge.route_name,
                    "from_stop_id": edge.from_stop_id,
                    "from_stop_name": from_stop_info["stop_name"] if from_stop_info else edge.from_stop_id,
                    "to_stop_id": edge.to_stop_id,
                    "to_stop_name": to_stop_info["stop_name"] if to_stop_info else edge.to_stop_id,
                    "segment_distance_km": edge.segment_distance_km,
                    "predicted_travel_time_seconds": edge_travel_sec,
                    "historical_median_seconds": pred_result["historical_median_seconds"],
                    "scheduled_travel_time_seconds": pred_result["scheduled_travel_time_seconds"],
                    "prediction_confidence": pred_result["prediction_confidence"],
                    "data_source": pred_result["data_source"],
                    "fallback_applied": pred_result["fallback_applied"],
                    "is_transfer": is_transfer,
                    "transfer_wait_seconds": transfer_wait_sec,
                    "step_departure_time": effective_departure_dt.strftime("%H:%M"),
                    "step_arrival_time": new_arrival_dt.strftime("%H:%M")
                }

                new_total_time = total_time + step_total_sec
                new_history = history + [segment_record]
                entry_count += 1

                heapq.heappush(
                    heap,
                    (new_total_time, entry_count, edge.to_stop_id, edge.route_id, new_arrival_dt, new_xfer_count, new_history)
                )

        return None
