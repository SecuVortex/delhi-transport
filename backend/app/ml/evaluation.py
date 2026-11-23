"""
Model Evaluation and Metrics Module.
Calculates MAE, RMSE, and MAPE across segment travel-time predictions.
Generates comprehensive comparative validation reports.
"""

import math
from typing import List, Dict, Any
import numpy as np


def mean_absolute_error(y_true: List[float], y_pred: List[float]) -> float:
    """Computes Mean Absolute Error in seconds."""
    errors = [abs(t - p) for t, p in zip(y_true, y_pred)]
    return float(np.mean(errors)) if errors else 0.0


def root_mean_squared_error(y_true: List[float], y_pred: List[float]) -> float:
    """Computes Root Mean Squared Error in seconds."""
    sq_errors = [(t - p) ** 2 for t, p in zip(y_true, y_pred)]
    return float(math.sqrt(np.mean(sq_errors))) if sq_errors else 0.0


def mean_absolute_percentage_error(y_true: List[float], y_pred: List[float], epsilon: float = 1.0) -> float:
    """
    Computes MAPE (Mean Absolute Percentage Error) in percent.
    Epsilon prevents division by zero.
    """
    pct_errors = [abs((t - p) / max(t, epsilon)) * 100.0 for t, p in zip(y_true, y_pred)]
    return float(np.mean(pct_errors)) if pct_errors else 0.0


def evaluate_model_predictions(
    y_true: List[float],
    y_pred: List[float],
    model_name: str = "Model"
) -> Dict[str, Any]:
    """
    Generates structured metric dictionary for a given model.
    """
    mae = mean_absolute_error(y_true, y_pred)
    rmse = root_mean_squared_error(y_true, y_pred)
    mape = mean_absolute_percentage_error(y_true, y_pred)

    return {
        "model_name": model_name,
        "mae_seconds": round(mae, 2),
        "rmse_seconds": round(rmse, 2),
        "mape_percent": round(mape, 2),
        "observations_count": len(y_true)
    }
