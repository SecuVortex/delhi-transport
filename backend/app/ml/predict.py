"""
Travel-Time Prediction and Fallback Inference Engine.
Loads trained XGBoost model and precomputed baselines.
Enforces non-negativity bounds and implements a multi-tiered fallback ladder.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import xgboost as xgb

from ..config import MODELS_DIR, ROUTING_CONFIG
from .feature_engineering import extract_features_from_dict, FEATURE_COLUMNS


class TravelTimePredictor:
    def __init__(self):
        self.xgb_model: Optional[xgb.XGBRegressor] = None
        self.baselines: Dict[str, Any] = {}
        self.metadata: Dict[str, Any] = {}
        self._load_artifacts()

    def _load_artifacts(self):
        """Loads serialized XGBoost model, baselines, and metadata from disk."""
        xgb_path = MODELS_DIR / "travel_time_xgb.json"
        baselines_path = MODELS_DIR / "baselines.json"
        metadata_path = MODELS_DIR / "model_metadata.json"

        if baselines_path.exists():
            with open(baselines_path, "r", encoding="utf-8") as f:
                self.baselines = json.load(f)

        if metadata_path.exists():
            with open(metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

        if xgb_path.exists():
            try:
                self.xgb_model = xgb.XGBRegressor()
                self.xgb_model.load_model(str(xgb_path))
            except Exception as e:
                print(f"Warning: Could not load XGBoost model: {e}")
                self.xgb_model = None

    def predict_segment_travel_time(
        self,
        segment_id: str,
        segment_distance_km: float,
        hour: int = 18,
        minute: int = 0,
        weekday: int = 2,
        route_id: str = "R-101",
        scheduled_seconds: float = None
    ) -> Dict[str, Any]:
        """
        Predicts travel time in seconds for a single segment traversal.
        Returns predicted duration, confidence, data source, and fallback status.
        """
        dist_km = max(0.2, float(segment_distance_km))
        sched_sec = scheduled_seconds or ((dist_km / 22.0 * 3600.0) + 45.0)

        # Baseline queries
        tod_key = f"{segment_id}_{hour}"
        tod_estimate = self.baselines.get("tod_baselines", {}).get(tod_key)
        seg_median = self.baselines.get("segment_medians", {}).get(segment_id)
        global_median = self.baselines.get("global_median", 350.0)

        # Tier 1: XGBoost Regressor
        if self.xgb_model is not None:
            try:
                query_dict = {
                    "segment_distance_km": dist_km,
                    "hour": hour,
                    "minute": minute,
                    "weekday": weekday,
                    "scheduled_travel_time_seconds": sched_sec
                }
                feat_dict = extract_features_from_dict(query_dict)
                df_x = pd.DataFrame([feat_dict])[FEATURE_COLUMNS]

                raw_pred = float(self.xgb_model.predict(df_x)[0])

                # Physical floor: maximum speed 75 km/h + minimum 20s stop dwell
                physical_floor = (dist_km / 75.0 * 3600.0) + 20.0
                predicted_time = max(raw_pred, physical_floor)

                confidence = "HIGH" if tod_estimate is not None else "MEDIUM"

                return {
                    "predicted_travel_time_seconds": round(predicted_time, 1),
                    "historical_median_seconds": seg_median or global_median,
                    "scheduled_travel_time_seconds": round(sched_sec, 1),
                    "prediction_confidence": confidence,
                    "data_source": "xgboost_ml",
                    "fallback_applied": False
                }
            except Exception:
                pass

        # Tier 2: Time-of-Day Baseline (Hourly)
        if tod_estimate is not None:
            return {
                "predicted_travel_time_seconds": round(float(tod_estimate), 1),
                "historical_median_seconds": seg_median or global_median,
                "scheduled_travel_time_seconds": round(sched_sec, 1),
                "prediction_confidence": "MEDIUM",
                "data_source": "time_of_day_baseline",
                "fallback_applied": True
            }

        # Tier 3: Historical Segment Median
        if seg_median is not None:
            return {
                "predicted_travel_time_seconds": round(float(seg_median), 1),
                "historical_median_seconds": round(float(seg_median), 1),
                "scheduled_travel_time_seconds": round(sched_sec, 1),
                "prediction_confidence": "LOW",
                "data_source": "historical_median",
                "fallback_applied": True
            }

        # Tier 4: Global Conservative Speed Fallback (18 km/h)
        fallback_speed_kmh = ROUTING_CONFIG["default_bus_speed_kmh"]
        fallback_time = (dist_km / fallback_speed_kmh * 3600.0) + 45.0
        return {
            "predicted_travel_time_seconds": round(fallback_time, 1),
            "historical_median_seconds": global_median,
            "scheduled_travel_time_seconds": round(sched_sec, 1),
            "prediction_confidence": "LOW",
            "data_source": "fallback_speed",
            "fallback_applied": True
        }


# Global singleton instance
predictor = TravelTimePredictor()
