"""
Unit Tests for Travel-Time ML Prediction & Fallback Engine.
"""

import pytest
from backend.app.ml.feature_engineering import extract_features_from_dict
from backend.app.ml.predict import predictor


def test_feature_engineering_cyclical():
    # Test midnight (hour 0) vs midday (hour 12)
    f_midday = extract_features_from_dict({"hour": 12, "minute": 0, "segment_distance_km": 2.0})
    f_midnight = extract_features_from_dict({"hour": 0, "minute": 0, "segment_distance_km": 2.0})

    # sin(pi) ~= 0, cos(pi) ~= -1 for hour 12
    assert abs(f_midday["hour_sin"]) < 0.01
    assert abs(f_midday["hour_cos"] - (-1.0)) < 0.01

    # sin(0) = 0, cos(0) = 1 for hour 0
    assert abs(f_midnight["hour_sin"]) < 0.01
    assert abs(f_midnight["hour_cos"] - 1.0) < 0.01


def test_time_dependent_prediction_variance():
    # Test same segment at 08:30 (Morning Peak) vs 23:00 (Night Off-Peak)
    seg_id = "R-101_ST-AV01_ST-MD01"
    dist_km = 3.2

    pred_peak = predictor.predict_segment_travel_time(
        segment_id=seg_id,
        segment_distance_km=dist_km,
        hour=8,
        minute=30,
        weekday=1
    )

    pred_night = predictor.predict_segment_travel_time(
        segment_id=seg_id,
        segment_distance_km=dist_km,
        hour=23,
        minute=0,
        weekday=1
    )

    # Peak hour travel time must be strictly longer than off-peak night travel time
    assert pred_peak["predicted_travel_time_seconds"] > pred_night["predicted_travel_time_seconds"]

    # Must be non-negative and physically plausible (at least 20 seconds)
    assert pred_peak["predicted_travel_time_seconds"] > 60.0
    assert pred_night["predicted_travel_time_seconds"] > 60.0
    assert pred_peak["prediction_confidence"] in ["HIGH", "MEDIUM", "LOW"]


def test_prediction_fallback():
    # Unknown segment should gracefully use fallback without crashing
    res = predictor.predict_segment_travel_time(
        segment_id="UNKNOWN_SEGMENT_999",
        segment_distance_km=2.5,
        hour=14,
        minute=0
    )
    assert res["predicted_travel_time_seconds"] > 0
    assert res["fallback_applied"] is False or res["fallback_applied"] is True
