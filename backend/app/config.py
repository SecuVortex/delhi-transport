"""
Configuration settings for Delhi Bus Intelligence & Time-Dependent Journey Planner.
All constants, geospatial boundaries, algorithm parameters, and fallback thresholds are defined here.
"""

from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = BASE_DIR / "app"
DATA_DIR = APP_DIR / "data"
MODELS_DIR = APP_DIR / "models"
DOCS_DIR = BASE_DIR.parent / "docs"

MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Delhi NCR Geospatial Bounding Box
DELHI_BOUNDS = {
    "min_lat": 28.30,
    "max_lat": 28.95,
    "min_lng": 76.80,
    "max_lng": 77.45
}

# GPS Cleaning Thresholds
GPS_CONFIG = {
    "min_lat": DELHI_BOUNDS["min_lat"],
    "max_lat": DELHI_BOUNDS["max_lat"],
    "min_lng": DELHI_BOUNDS["min_lng"],
    "max_lng": DELHI_BOUNDS["max_lng"],
    "max_speed_kmh": 85.0,         # Maximum plausible urban bus speed in km/h
    "max_acceleration_ms2": 3.5,   # Maximum plausible bus acceleration in m/s^2
    "max_jump_distance_m": 800.0,  # Single-interval coordinate jump threshold
    "min_interval_seconds": 1.0,
    "max_interval_seconds": 300.0  # Threshold beyond which trajectory is split
}

# Walking and Spatial Parameters
WALKING_CONFIG = {
    "walking_speed_kmh": 4.5,      # Standard commuter walking pace (4.5 km/h)
    "walking_network_factor": 1.25,# Curvature factor (straight-line distance to street network)
    "max_walk_radius_meters": 1200 # Maximum search radius to boarding/destination stops
}

# Routing & Transfer Parameters
ROUTING_CONFIG = {
    "max_transfers": 2,            # Maximum allowed transfers per journey
    "transfer_wait_buffer_min": 4.0, # Minimum transfer connection buffer in minutes
    "transfer_penalty_seconds": 180.0, # Transfer friction penalty in seconds
    "default_bus_speed_kmh": 18.0  # Conservative global urban Delhi bus speed fallback
}

# ML Model Parameters
ML_CONFIG = {
    "random_state": 42,
    "n_estimators": 100,
    "max_depth": 6,
    "learning_rate": 0.08,
    "subsample": 0.85,
    "colsample_bytree": 0.85,
    "early_stopping_rounds": 10
}
