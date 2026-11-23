"""
Model Training and Comparison Pipeline.
Trains Historical Median, Time-of-Day baseline, Random Forest, and XGBoost models
using a strict chronological train-val-test split.
Saves serialized models and validation reports to backend/app/models/.
"""

import json
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb

from ..config import MODELS_DIR, ML_CONFIG
from ..data.gps_loader import generate_segment_dataset
from .feature_engineering import prepare_feature_dataframe, FEATURE_COLUMNS
from .evaluation import evaluate_model_predictions


def run_training_pipeline() -> Dict[str, Any]:
    """
    Executes end-to-end data generation, chronological train/val/test split,
    baseline calculation, XGBoost training, comparative evaluation, and artifact saving.
    """
    print("Step 1: Generating chronological Delhi bus segment traversal dataset...")
    records = generate_segment_dataset(num_days=14, seed=ML_CONFIG["random_state"])
    print(f"Total observations generated: {len(records)}")

    # Sort strictly chronologically by date and timestamp
    records.sort(key=lambda x: x["timestamp"])

    # Chronological Split: Days 1-10 Train (~71%), Days 11-12 Val (~14%), Days 13-14 Test (~14%)
    unique_dates = sorted(list(set(r["date"] for r in records)))
    train_dates = set(unique_dates[:10])
    val_dates = set(unique_dates[10:12])
    test_dates = set(unique_dates[12:])

    train_recs = [r for r in records if r["date"] in train_dates]
    val_recs = [r for r in records if r["date"] in val_dates]
    test_recs = [r for r in records if r["date"] in test_dates]

    print(f"Split sizes - Train: {len(train_recs)}, Val: {len(val_recs)}, Test: {len(test_recs)}")

    # 1. Historical Median Baseline (by segment_id)
    segment_medians: Dict[str, float] = {}
    seg_groups = {}
    for r in train_recs:
        seg_groups.setdefault(r["segment_id"], []).append(r["observed_segment_time_seconds"])
    for sid, vals in seg_groups.items():
        segment_medians[sid] = round(float(np.median(vals)), 1)
    global_median = round(float(np.median([r["observed_segment_time_seconds"] for r in train_recs])), 1)

    # 2. Time-of-Day Baseline (by segment_id + hour)
    tod_baselines: Dict[str, float] = {}
    tod_groups = {}
    for r in train_recs:
        key = f"{r['segment_id']}_{r['hour']}"
        tod_groups.setdefault(key, []).append(r["observed_segment_time_seconds"])
    for key, vals in tod_groups.items():
        tod_baselines[key] = round(float(np.mean(vals)), 1)

    # Prepare ML DataFrames
    X_train, y_train = prepare_feature_dataframe(train_recs)
    X_val, y_val = prepare_feature_dataframe(val_recs)
    X_test, y_test = prepare_feature_dataframe(test_recs)

    # 3. Random Forest Regressor
    print("Step 2: Training Random Forest Regressor...")
    rf_model = RandomForestRegressor(
        n_estimators=50,
        max_depth=8,
        random_state=ML_CONFIG["random_state"],
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)

    # 4. XGBoost Regressor
    print("Step 3: Training XGBoost Regressor...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=ML_CONFIG["n_estimators"],
        max_depth=ML_CONFIG["max_depth"],
        learning_rate=ML_CONFIG["learning_rate"],
        subsample=ML_CONFIG["subsample"],
        colsample_bytree=ML_CONFIG["colsample_bytree"],
        random_state=ML_CONFIG["random_state"],
        objective="reg:squarederror"
    )
    xgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )

    # Evaluate all 4 models on unseen Test set (Days 13-14)
    print("Step 4: Evaluating models on held-out test data...")
    test_y_true = list(y_test)

    # Predict Median Baseline
    pred_median = [segment_medians.get(r["segment_id"], global_median) for r in test_recs]
    metrics_median = evaluate_model_predictions(test_y_true, pred_median, "Historical Segment Median")

    # Predict Time-of-Day Baseline
    pred_tod = [
        tod_baselines.get(f"{r['segment_id']}_{r['hour']}", segment_medians.get(r["segment_id"], global_median))
        for r in test_recs
    ]
    metrics_tod = evaluate_model_predictions(test_y_true, pred_tod, "Time-of-Day Baseline (Hourly)")

    # Predict Random Forest
    pred_rf = list(rf_model.predict(X_test))
    metrics_rf = evaluate_model_predictions(test_y_true, pred_rf, "Random Forest Regressor")

    # Predict XGBoost
    pred_xgb = list(xgb_model.predict(X_test))
    # Enforce physical floor based on max speed
    min_physical_time = [
        (r["segment_distance_km"] / 70.0 * 3600.0) + 15.0 for r in test_recs
    ]
    pred_xgb_bounded = [max(p, floor) for p, floor in zip(pred_xgb, min_physical_time)]
    metrics_xgb = evaluate_model_predictions(test_y_true, pred_xgb_bounded, "XGBoost Regressor (Time-Dependent)")

    print("\n=== Validation Results on Held-Out Test Set ===")
    for m in [metrics_median, metrics_tod, metrics_rf, metrics_xgb]:
        print(f"{m['model_name']:<35} | MAE: {m['mae_seconds']}s | RMSE: {m['rmse_seconds']}s | MAPE: {m['mape_percent']}%")

    # Feature Importance from XGBoost
    importance_scores = xgb_model.feature_importances_
    feature_importance_dict = {
        col: round(float(score), 4)
        for col, score in zip(FEATURE_COLUMNS, importance_scores)
    }

    # Save artifacts to backend/app/models/
    print("\nStep 5: Serializing trained models and baselines...")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # Save XGBoost Model
    xgb_path = MODELS_DIR / "travel_time_xgb.json"
    xgb_model.save_model(str(xgb_path))

    # Save Baselines
    baselines_payload = {
        "global_median": global_median,
        "segment_medians": segment_medians,
        "tod_baselines": tod_baselines
    }
    with open(MODELS_DIR / "baselines.json", "w", encoding="utf-8") as f:
        json.dump(baselines_payload, f, indent=2)

    # Save Metadata and Validation Summary
    metadata = {
        "version": "1.0.0",
        "training_date": "2026-11-23",
        "target_variable": "observed_segment_time_seconds",
        "training_dataset_period": f"{unique_dates[0]} to {unique_dates[9]}",
        "validation_dataset_period": f"{unique_dates[10]} to {unique_dates[11]}",
        "test_dataset_period": f"{unique_dates[12]} to {unique_dates[-1]}",
        "total_observations": len(records),
        "feature_columns": FEATURE_COLUMNS,
        "feature_importance": feature_importance_dict,
        "models_comparison": [
            metrics_median,
            metrics_tod,
            metrics_rf,
            metrics_xgb
        ],
        "active_model": "XGBoost Regressor (Time-Dependent)"
    }
    with open(MODELS_DIR / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("Model training pipeline successfully completed.")
    return metadata


if __name__ == "__main__":
    run_training_pipeline()
