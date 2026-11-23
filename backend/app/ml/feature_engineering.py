"""
Feature Engineering Module for Travel-Time Prediction.
Computes cyclical time features, peak-period flags, interaction variables,
and prepares feature vectors for ML models.
"""

import math
from typing import Dict, Any, List
import numpy as np
import pandas as pd


FEATURE_COLUMNS = [
    "segment_distance_km",
    "hour_sin",
    "hour_cos",
    "day_sin",
    "day_cos",
    "is_weekend",
    "is_peak",
    "is_morning_peak",
    "is_evening_peak",
    "scheduled_travel_time_seconds"
]


def extract_features_from_dict(obs: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts mathematical and cyclical features from a raw observation or query.
    """
    dist_km = float(obs.get("segment_distance_km", 1.5))
    hour = int(obs.get("hour", 12))
    minute = int(obs.get("minute", 0))
    weekday = int(obs.get("weekday", 0))
    is_weekend = int(obs.get("is_weekend", 1 if weekday >= 5 else 0))

    # Continuous hour including minute fraction
    time_float = hour + (minute / 60.0)

    # Cyclical hour: 24-hour cycle
    hour_sin = math.sin(2.0 * math.pi * time_float / 24.0)
    hour_cos = math.cos(2.0 * math.pi * time_float / 24.0)

    # Cyclical day: 7-day cycle
    day_sin = math.sin(2.0 * math.pi * weekday / 7.0)
    day_cos = math.cos(2.0 * math.pi * weekday / 7.0)

    # Peak period flags
    is_morning_peak = 1 if 8 <= hour <= 11 else 0
    is_evening_peak = 1 if 17 <= hour <= 20 else 0
    is_peak = 1 if (is_morning_peak or is_evening_peak) else 0

    scheduled_sec = float(obs.get("scheduled_travel_time_seconds", (dist_km / 22.0 * 3600.0) + 45.0))

    return {
        "segment_distance_km": dist_km,
        "hour_sin": round(hour_sin, 6),
        "hour_cos": round(hour_cos, 6),
        "day_sin": round(day_sin, 6),
        "day_cos": round(day_cos, 6),
        "is_weekend": is_weekend,
        "is_peak": is_peak,
        "is_morning_peak": is_morning_peak,
        "is_evening_peak": is_evening_peak,
        "scheduled_travel_time_seconds": round(scheduled_sec, 1)
    }


def prepare_feature_dataframe(records: List[Dict[str, Any]]) -> Tuple_DF:
    """
    Converts list of observations into feature matrix X and target y.
    """
    features_list = [extract_features_from_dict(r) for r in records]
    df_x = pd.DataFrame(features_list)[FEATURE_COLUMNS]

    targets = [float(r["observed_segment_time_seconds"]) for r in records]
    s_y = pd.Series(targets, name="observed_segment_time_seconds")

    return df_x, s_y


# Type alias helper
Tuple_DF = Any
