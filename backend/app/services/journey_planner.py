"""
Multi-Modal Journey Planner Orchestrator.
Combines walking links, public transit graph, time-dependent Dijkstra search,
and Pareto alternatives ranking into commuter journey options.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from ..algorithms.graph import TransitGraph
from ..algorithms.dijkstra import DijkstraRouter
from ..algorithms.spatial_index import SpatialIndex
from ..data.gtfs_loader import GTFSLoader
from ..data.schemas import JourneyOption, JourneyLeg, SegmentPrediction


class JourneyPlannerService:
    def __init__(self):
        self.loader = GTFSLoader()
        self.graph = TransitGraph(self.loader)
        self.router = DijkstraRouter(self.graph)
        self.spatial_index = SpatialIndex(self.loader.get_all_stops())

    def resolve_location(self, query: str, default_lat: float = 28.6488, default_lng: float = 77.2871) -> Dict[str, Any]:
        """Resolves location query (either stop name or coordinate string) to lat, lng, and stop match."""
        q_lower = query.strip().lower()

        # Check exact or partial match in stop catalog
        for stop in self.loader.get_all_stops():
            s_name = stop["stop_name"].lower()
            if q_lower in s_name or s_name in q_lower:
                return {
                    "name": stop["stop_name"],
                    "lat": stop["lat"],
                    "lng": stop["lng"],
                    "matched_stop_id": stop["stop_id"]
                }

        # Check comma-separated lat,lng
        if "," in query:
            parts = query.split(",")
            try:
                lat = float(parts[0].strip())
                lng = float(parts[1].strip())
                return {"name": f"Location ({lat:.4f}, {lng:.4f})", "lat": lat, "lng": lng, "matched_stop_id": None}
            except Exception:
                pass

        # Fallback to Delhi center / default
        return {"name": query, "lat": default_lat, "lng": default_lng, "matched_stop_id": None}

    def plan_journey(
        self,
        origin_query: str,
        destination_query: str,
        departure_dt: datetime,
        max_transfers: int = 2,
        preference: str = "fastest"
    ) -> List[Dict[str, Any]]:
        """
        Plans multi-modal transit itineraries between origin and destination.
        Returns ranked JourneyOption representations.
        """
        origin_loc = self.resolve_location(origin_query, 28.6488, 77.2871)
        dest_loc = self.resolve_location(destination_query, 28.6313, 77.2144)

        # 1. Candidate boarding stops (nearby origin)
        boarding_stops = []
        if origin_loc.get("matched_stop_id"):
            primary_b = self.spatial_index.get_stop(origin_loc["matched_stop_id"])
            if primary_b:
                b_copy = dict(primary_b)
                b_copy["walking_duration_seconds"] = 0.0
                b_copy["walking_distance_meters"] = 0.0
                boarding_stops.append(b_copy)

        for s in self.spatial_index.find_nearest_stops(origin_loc["lat"], origin_loc["lng"], limit=3):
            if not any(b["stop_id"] == s["stop_id"] for b in boarding_stops):
                boarding_stops.append(s)

        if not boarding_stops:
            boarding_stops = [dict(self.loader.get_all_stops()[0])]
            boarding_stops[0]["walking_duration_seconds"] = 180.0
            boarding_stops[0]["walking_distance_meters"] = 200.0

        # 2. Candidate alighting stops (nearby destination)
        alighting_stops = []
        if dest_loc.get("matched_stop_id"):
            primary_a = self.spatial_index.get_stop(dest_loc["matched_stop_id"])
            if primary_a:
                a_copy = dict(primary_a)
                a_copy["walking_duration_seconds"] = 0.0
                a_copy["walking_distance_meters"] = 0.0
                alighting_stops.append(a_copy)

        for s in self.spatial_index.find_nearest_stops(dest_loc["lat"], dest_loc["lng"], limit=3):
            if not any(a["stop_id"] == s["stop_id"] for a in alighting_stops):
                alighting_stops.append(s)

        if not alighting_stops:
            alighting_stops = [dict(self.loader.get_all_stops()[1])]
            alighting_stops[0]["walking_duration_seconds"] = 180.0
            alighting_stops[0]["walking_distance_meters"] = 200.0

        raw_options = []

        def _record_path(p_res, b_st, a_st):
            if not p_res or not p_res.get("segments"):
                return
            b_w_sec = b_st.get("walking_duration_seconds", 120.0)
            b_w_dist = b_st.get("walking_distance_meters", 150.0)
            a_w_sec = a_st.get("walking_duration_seconds", 120.0)
            a_w_dist = a_st.get("walking_distance_meters", 150.0)
            tot_sec = b_w_sec + p_res["total_duration_seconds"] + a_w_sec
            arr_dt = p_res["arrival_dt"] + timedelta(seconds=a_w_sec)
            raw_options.append({
                "b_stop": b_st,
                "a_stop": a_st,
                "b_walk_sec": b_w_sec,
                "b_walk_dist": b_w_dist,
                "a_walk_sec": a_w_sec,
                "a_walk_dist": a_w_dist,
                "transit_res": p_res,
                "total_journey_sec": tot_sec,
                "final_arrival_dt": arr_dt
            })

        # 3. Explore combinations of candidate stops
        for b_stop in boarding_stops:
            b_walk_sec = b_stop.get("walking_duration_seconds", 120.0)
            transit_departure_dt = departure_dt + timedelta(seconds=b_walk_sec)

            for a_stop in alighting_stops:
                if b_stop["stop_id"] == a_stop["stop_id"]:
                    continue

                # Search primary shortest path
                path_res = self.router.find_shortest_path(
                    origin_stop_id=b_stop["stop_id"],
                    destination_stop_id=a_stop["stop_id"],
                    departure_dt=transit_departure_dt,
                    max_transfers=max_transfers
                )
                if path_res and path_res["segments"]:
                    _record_path(path_res, b_stop, a_stop)

                    # Also search alternative route excluding the primary route
                    primary_routes = list({s["route_id"] for s in path_res["segments"]})
                    alt_res = self.router.find_shortest_path(
                        origin_stop_id=b_stop["stop_id"],
                        destination_stop_id=a_stop["stop_id"],
                        departure_dt=transit_departure_dt,
                        max_transfers=max_transfers,
                        excluded_routes=primary_routes
                    )
                    if alt_res and alt_res["segments"]:
                        _record_path(alt_res, b_stop, a_stop)

        if not raw_options:
            return []

        # Sort based on preference
        if preference == "fewest_transfers":
            raw_options.sort(key=lambda o: (o["transit_res"]["transfers_count"], o["total_journey_sec"]))
        elif preference == "min_walking":
            raw_options.sort(key=lambda o: (o["b_walk_dist"] + o["a_walk_dist"], o["total_journey_sec"]))
        else:  # fastest (default)
            raw_options.sort(key=lambda o: o["total_journey_sec"])

        # Deduplicate paths that share identical transit segments
        unique_options = []
        seen_signatures = set()
        for opt in raw_options:
            sig = tuple(s["segment_id"] for s in opt["transit_res"]["segments"])
            if sig not in seen_signatures:
                seen_signatures.add(sig)
                unique_options.append(opt)
            if len(unique_options) >= 3:
                break

        formatted_options = []
        for rank_idx, opt in enumerate(unique_options):
            b_stop = opt["b_stop"]
            a_stop = opt["a_stop"]
            t_res = opt["transit_res"]
            segments = t_res["segments"]

            legs = []
            cur_leg_dt = departure_dt

            # Leg 1: Walk to Boarding Stop (if applicable)
            if opt["b_walk_sec"] > 10.0:
                walk_arr_dt = cur_leg_dt + timedelta(seconds=opt["b_walk_sec"])
                legs.append({
                    "leg_type": "walking",
                    "instruction": f"Walk to {b_stop['stop_name']}",
                    "duration_seconds": round(opt["b_walk_sec"], 1),
                    "distance_meters": round(opt["b_walk_dist"], 1),
                    "departure_time": cur_leg_dt.strftime("%H:%M"),
                    "arrival_time": walk_arr_dt.strftime("%H:%M"),
                    "coordinates": [
                        [origin_loc["lat"], origin_loc["lng"]],
                        [b_stop["lat"], b_stop["lng"]]
                    ]
                })
                cur_leg_dt = walk_arr_dt

            # Leg 2..N: Transit Legs grouped by continuous route
            grouped_transit_legs = []
            current_leg_segs = []
            for seg in segments:
                if seg.get("is_transfer") and current_leg_segs:
                    grouped_transit_legs.append(current_leg_segs)
                    current_leg_segs = [seg]
                else:
                    current_leg_segs.append(seg)
            if current_leg_segs:
                grouped_transit_legs.append(current_leg_segs)

            for t_idx, leg_segs in enumerate(grouped_transit_legs):
                first_seg = leg_segs[0]
                last_seg = leg_segs[-1]
                leg_dist_m = sum(s["segment_distance_km"] * 1000.0 for s in leg_segs)
                leg_dur_s = sum(s["predicted_travel_time_seconds"] for s in leg_segs)
                leg_dep_str = first_seg["step_departure_time"]
                leg_arr_str = last_seg["step_arrival_time"]

                # Extract coordinates
                coords = []
                for s in leg_segs:
                    f_info = self.loader.get_stop(s["from_stop_id"])
                    t_info = self.loader.get_stop(s["to_stop_id"])
                    if f_info:
                        coords.append([f_info["lat"], f_info["lng"]])
                    if t_info:
                        coords.append([t_info["lat"], t_info["lng"]])

                inter_stops = [s["to_stop_name"] for s in leg_segs[:-1]]

                legs.append({
                    "leg_type": "transit",
                    "instruction": f"Board {first_seg['route_name']} from {first_seg['from_stop_name']} to {last_seg['to_stop_name']}",
                    "route_id": first_seg["route_id"],
                    "route_name": first_seg["route_name"],
                    "from_stop_id": first_seg["from_stop_id"],
                    "from_stop_name": first_seg["from_stop_name"],
                    "to_stop_id": last_seg["to_stop_id"],
                    "to_stop_name": last_seg["to_stop_name"],
                    "duration_seconds": round(leg_dur_s, 1),
                    "distance_meters": round(leg_dist_m, 1),
                    "departure_time": leg_dep_str,
                    "arrival_time": leg_arr_str,
                    "intermediate_stops": inter_stops,
                    "segments": leg_segs,
                    "coordinates": coords
                })

            # Leg Final: Walk to Destination (if applicable)
            if opt["a_walk_sec"] > 10.0:
                final_dep_dt = t_res["arrival_dt"]
                final_arr_dt = opt["final_arrival_dt"]
                legs.append({
                    "leg_type": "walking",
                    "instruction": f"Walk from {a_stop['stop_name']} to {dest_loc['name']}",
                    "duration_seconds": round(opt["a_walk_sec"], 1),
                    "distance_meters": round(opt["a_walk_dist"], 1),
                    "departure_time": final_dep_dt.strftime("%H:%M"),
                    "arrival_time": final_arr_dt.strftime("%H:%M"),
                    "coordinates": [
                        [a_stop["lat"], a_stop["lng"]],
                        [dest_loc["lat"], dest_loc["lng"]]
                    ]
                })

            # Confidence calculation based on segment confidences
            conf_scores = {"HIGH": 0.95, "MEDIUM": 0.80, "LOW": 0.60}
            all_confs = [conf_scores.get(s["prediction_confidence"], 0.8) for s in segments]
            avg_conf = sum(all_confs) / len(all_confs) if all_confs else 0.85
            conf_level = "HIGH" if avg_conf >= 0.88 else ("MEDIUM" if avg_conf >= 0.72 else "LOW")

            cat_label = "fastest" if rank_idx == 0 else ("fewest_transfers" if t_res["transfers_count"] == 0 else "alternative")

            formatted_options.append({
                "journey_id": f"journey_opt_{rank_idx + 1}",
                "rank": rank_idx + 1,
                "preference_category": cat_label,
                "total_duration_seconds": round(opt["total_journey_sec"], 1),
                "total_duration_minutes": round(opt["total_journey_sec"] / 60.0, 1),
                "departure_time": departure_dt.strftime("%H:%M"),
                "estimated_arrival_time": opt["final_arrival_dt"].strftime("%H:%M"),
                "walking_duration_seconds": round(opt["b_walk_sec"] + opt["a_walk_sec"], 1),
                "bus_duration_seconds": round(t_res["total_duration_seconds"], 1),
                "waiting_duration_seconds": round(t_res["transfers_count"] * 180.0, 1),
                "transfers_count": t_res["transfers_count"],
                "confidence_score": round(avg_conf, 2),
                "confidence_level": conf_level,
                "data_grounding": "xgboost_time_dependent_model",
                "legs": legs
            })

        return formatted_options


# Global planner singleton
planner_service = JourneyPlannerService()
