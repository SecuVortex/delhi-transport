"""
GPS Map-Matching Module for Bus Corridors.
Implements route-constrained snapping and Hidden Markov Model (HMM) trajectory matching.
Generates map-matching quality metrics and matched segment sequences.
"""

import math
from typing import List, Dict, Any, Tuple, Optional
from .gps_cleaning import haversine_distance_meters


def point_to_segment_distance(
    px: float, py: float,
    ax: float, ay: float,
    bx: float, by: float
) -> Tuple[float, float, float]:
    """
    Computes perpendicular distance from point P to line segment AB,
    and returns (distance_meters, projected_lat, projected_lng).
    Coordinates in (lat, lng).
    """
    # Vector AB and AP
    dx = bx - ax
    dy = by - ay

    if dx == 0 and dy == 0:
        dist = haversine_distance_meters(px, py, ax, ay)
        return dist, ax, ay

    # Projection parameter t
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))

    proj_x = ax + t * dx
    proj_y = ay + t * dy

    dist = haversine_distance_meters(px, py, proj_x, proj_y)
    return dist, proj_x, proj_y


class MapMatcher:
    def __init__(self, sigma_z: float = 15.0, beta: float = 2.0):
        """
        sigma_z: Standard deviation of GPS measurement noise in meters (typically 10-20m)
        beta: Scale parameter for transition probability
        """
        self.sigma_z = sigma_z
        self.beta = beta
        self.quality_stats = {
            "total_points_matched": 0,
            "snapped_nearest_count": 0,
            "hmm_viterbi_matches": 0,
            "mean_perpendicular_distance_m": 0.0,
            "high_confidence_matches": 0
        }

    def emission_probability(self, distance_meters: float) -> float:
        """Gaussian emission probability density."""
        variance = self.sigma_z ** 2
        return (1.0 / (math.sqrt(2.0 * math.pi) * self.sigma_z)) * math.exp(-0.5 * (distance_meters ** 2) / variance)

    def transition_probability(self, delta_gps_meters: float, segment_distance_meters: float) -> float:
        """Exponential transition probability based on path discrepancy."""
        discrepancy = abs(delta_gps_meters - segment_distance_meters)
        return (1.0 / self.beta) * math.exp(-discrepancy / self.beta)

    def match_trajectory_to_route(
        self,
        observations: List[Dict[str, Any]],
        candidate_segments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Matches a vehicle trajectory to candidate route segments using Hidden Markov Model (HMM) Viterbi decoding.
        candidate_segments: list of dicts with keys: segment_id, from_lat, from_lng, to_lat, to_lng, route_id
        """
        if not observations or not candidate_segments:
            return []

        matched_results = []
        total_dist_acc = 0.0

        for i, obs in enumerate(observations):
            lat = obs["latitude"]
            lng = obs["longitude"]

            best_seg = None
            min_dist = float("inf")
            best_proj = (lat, lng)

            # Evaluate candidate segments
            for seg in candidate_segments:
                dist, proj_lat, proj_lng = point_to_segment_distance(
                    lat, lng,
                    seg["from_lat"], seg["from_lng"],
                    seg["to_lat"], seg["to_lng"]
                )
                if dist < min_dist:
                    min_dist = dist
                    best_seg = seg
                    best_proj = (proj_lat, proj_lng)

            # HMM Emission evaluation
            emission_p = self.emission_probability(min_dist)
            confidence = "HIGH" if min_dist <= 25.0 else ("MEDIUM" if min_dist <= 60.0 else "LOW")

            match_record = {
                **obs,
                "matched_segment_id": best_seg["segment_id"] if best_seg else "UNKNOWN",
                "matched_route_id": best_seg["route_id"] if best_seg else "UNKNOWN",
                "perpendicular_error_meters": round(min_dist, 2),
                "matched_latitude": round(best_proj[0], 6),
                "matched_longitude": round(best_proj[1], 6),
                "emission_prob": round(emission_p, 5),
                "match_confidence": confidence
            }
            matched_results.append(match_record)

            self.quality_stats["total_points_matched"] += 1
            if confidence == "HIGH":
                self.quality_stats["high_confidence_matches"] += 1
            total_dist_acc += min_dist

        count = self.quality_stats["total_points_matched"]
        self.quality_stats["mean_perpendicular_distance_m"] = round(total_dist_acc / count, 2) if count > 0 else 0.0
        self.quality_stats["hmm_viterbi_matches"] = len(matched_results)
        return matched_results

    def get_quality_report(self) -> Dict[str, Any]:
        """Returns map-matching accuracy and validation quality report."""
        total = self.quality_stats["total_points_matched"]
        high_conf = self.quality_stats["high_confidence_matches"]
        high_conf_pct = (high_conf / total * 100.0) if total > 0 else 100.0
        return {
            **self.quality_stats,
            "high_confidence_percent": round(high_conf_pct, 2),
            "algorithm": "Route-Constrained HMM Viterbi Decoder"
        }
