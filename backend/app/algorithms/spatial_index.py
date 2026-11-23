"""
Spatial Index and Walking Service Module.
Uses SciPy KDTree for O(log N) nearest stop lookups in Delhi NCR.
Applies Haversine calculations and urban street network curvature factors.
"""

import math
from typing import List, Dict, Any, Tuple
import numpy as np
from scipy.spatial import KDTree
from .gps_cleaning import haversine_distance_meters
from ..config import WALKING_CONFIG


class SpatialIndex:
    def __init__(self, stops: List[Dict[str, Any]]):
        """
        stops: list of dicts with keys: stop_id, stop_name, lat, lng
        """
        self.stops = stops
        self.stop_map = {s["stop_id"]: s for s in stops}
        self.coordinates = []
        self.valid_stops = []

        for s in stops:
            try:
                lat = float(s["lat"])
                lng = float(s["lng"])
                self.coordinates.append([lat, lng])
                self.valid_stops.append(s)
            except (ValueError, KeyError):
                continue

        if self.coordinates:
            self.kdtree = KDTree(np.array(self.coordinates))
        else:
            self.kdtree = None

    def find_nearest_stops(
        self,
        lat: float,
        lng: float,
        max_distance_meters: float = None,
        limit: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Finds the closest stops to a given coordinate within max_distance_meters.
        """
        if not self.kdtree or not self.valid_stops:
            return []

        max_dist = max_distance_meters or WALKING_CONFIG["max_walk_radius_meters"]
        # Approximate degree conversion for KDTree query (1 degree lat ~= 111,000m)
        degree_radius = (max_dist / 111000.0) * 1.5

        indices = self.kdtree.query_ball_point([lat, lng], r=degree_radius)

        results = []
        for idx in indices:
            s = self.valid_stops[idx]
            dist_m = haversine_distance_meters(lat, lng, float(s["lat"]), float(s["lng"]))
            if dist_m <= max_dist:
                results.append({
                    **s,
                    "straight_distance_meters": round(dist_m, 1),
                    "walking_distance_meters": round(dist_m * WALKING_CONFIG["walking_network_factor"], 1),
                    "walking_duration_seconds": round(self.calculate_walking_time(dist_m), 1)
                })

        # Sort by actual walking distance
        results.sort(key=lambda x: x["walking_distance_meters"])
        return results[:limit]

    def calculate_walking_time(self, distance_meters: float, walking_speed_kmh: float = None) -> float:
        """
        Calculates pedestrian travel time in seconds accounting for street network factor.
        """
        speed_kmh = walking_speed_kmh or WALKING_CONFIG["walking_speed_kmh"]
        speed_mps = (speed_kmh * 1000.0) / 3600.0
        effective_dist = distance_meters * WALKING_CONFIG["walking_network_factor"]
        return effective_dist / speed_mps

    def get_stop(self, stop_id: str) -> Dict[str, Any]:
        return self.stop_map.get(stop_id)
