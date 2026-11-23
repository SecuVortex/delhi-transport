"""
Public Transit Graph Representation.
Represents bus stops as vertices and multi-route connections as directed edges.
Separates walking links from public transit routes.
"""

from typing import List, Dict, Any, Optional
from ..data.gtfs_loader import GTFSLoader


class TransitEdge:
    def __init__(
        self,
        edge_id: str,
        from_stop_id: str,
        to_stop_id: str,
        route_id: str,
        route_name: str,
        segment_id: str,
        segment_distance_km: float,
        scheduled_seconds: float
    ):
        self.edge_id = edge_id
        self.from_stop_id = from_stop_id
        self.to_stop_id = to_stop_id
        self.route_id = route_id
        self.route_name = route_name
        self.segment_id = segment_id
        self.segment_distance_km = segment_distance_km
        self.scheduled_seconds = scheduled_seconds


class TransitGraph:
    def __init__(self, gtfs_loader: Optional[GTFSLoader] = None):
        self.loader = gtfs_loader or GTFSLoader()
        self.stops = {s["stop_id"]: s for s in self.loader.get_all_stops()}
        # Adjacency list: from_stop_id -> List[TransitEdge]
        self.adjacency: Dict[str, List[TransitEdge]] = {s_id: [] for s_id in self.stops}
        self._build_graph()

    def _build_graph(self):
        """Builds directed multi-route edges between consecutive stops."""
        segments = self.loader.get_all_segments()
        for seg in segments:
            edge = TransitEdge(
                edge_id=f"e_{seg['segment_id']}",
                from_stop_id=seg["from_stop_id"],
                to_stop_id=seg["to_stop_id"],
                route_id=seg["route_id"],
                route_name=seg["route_name"],
                segment_id=seg["segment_id"],
                segment_distance_km=seg["segment_distance_km"],
                scheduled_seconds=seg["scheduled_travel_time_seconds"]
            )
            self.adjacency.setdefault(seg["from_stop_id"], []).append(edge)

    def get_outgoing_edges(self, stop_id: str) -> List[TransitEdge]:
        """Returns all outbound transit edges from a stop."""
        return self.adjacency.get(stop_id, [])

    def get_stop_info(self, stop_id: str) -> Optional[Dict[str, Any]]:
        return self.stops.get(stop_id)

    @property
    def total_nodes(self) -> int:
        return len(self.stops)

    @property
    def total_edges(self) -> int:
        return sum(len(edges) for edges in self.adjacency.values())
