"""
Real-Time GPS Live Update and Blending Service.
Handles GTFS-Realtime vehicle pings, calculates observation freshness,
and blends live speeds with historical ML predictions using exponential decay.
"""

import time
import math
from typing import Dict, Any, Optional
from ..config import GPS_CONFIG


class LiveDataService:
    def __init__(self, half_life_seconds: float = 180.0):
        """
        half_life_seconds: Time after which a live observation weight halves (default: 3 minutes)
        """
        self.half_life_seconds = half_life_seconds
        self.live_observations: Dict[str, Dict[str, Any]] = {}
        self.is_live_feed_connected = False
        self.feed_status_message = "Historical Model Mode (Real-time feed not connected; using October 2026 ground truth)"

    def update_live_observation(self, segment_id: str, speed_kmh: float, vehicle_id: str):
        """Records a new live GPS observation for a segment."""
        now = time.time()
        self.live_observations[segment_id] = {
            "speed_kmh": max(5.0, min(80.0, speed_kmh)),
            "vehicle_id": vehicle_id,
            "timestamp": now
        }
        self.is_live_feed_connected = True
        self.feed_status_message = "Live GTFS-RT Feed Active"

    def blend_prediction(
        self,
        segment_id: str,
        segment_distance_km: float,
        historical_pred_seconds: float
    ) -> Dict[str, Any]:
        """
        Blends historical ML prediction with fresh live observations if available.
        w_live = exp(-delta_t / tau)
        """
        live_obs = self.live_observations.get(segment_id)
        if not live_obs:
            return {
                "blended_seconds": historical_pred_seconds,
                "is_live_blended": False,
                "live_weight": 0.0,
                "freshness_seconds": None
            }

        delta_t = time.time() - live_obs["timestamp"]
        # If observation is older than 15 minutes, discard
        if delta_t > 900.0:
            return {
                "blended_seconds": historical_pred_seconds,
                "is_live_blended": False,
                "live_weight": 0.0,
                "freshness_seconds": round(delta_t, 1)
            }

        # Exponential decay factor: tau = half_life / ln(2)
        tau = self.half_life_seconds / math.log(2)
        live_weight = math.exp(-delta_t / tau) * 0.75  # max 75% weight to live observation
        hist_weight = 1.0 - live_weight

        live_speed = live_obs["speed_kmh"]
        live_time_sec = (segment_distance_km / live_speed * 3600.0) + 40.0

        blended = (historical_pred_seconds * hist_weight) + (live_time_sec * live_weight)

        return {
            "blended_seconds": round(blended, 1),
            "is_live_blended": True,
            "live_weight": round(live_weight, 3),
            "freshness_seconds": round(delta_t, 1)
        }

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_connected": self.is_live_feed_connected,
            "status_message": self.feed_status_message,
            "active_live_segments": len(self.live_observations)
        }


# Global live service singleton
live_service = LiveDataService()
