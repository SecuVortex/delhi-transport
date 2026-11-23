"""
Pydantic Schemas for Delhi Bus Intelligence REST API.
Defines strongly-typed request and response structures.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float = Field(..., description="Latitude in decimal degrees")
    lng: float = Field(..., description="Longitude in decimal degrees")


class StopInfo(BaseModel):
    stop_id: str
    stop_name: str
    lat: float
    lng: float
    distance_meters: Optional[float] = None


class SegmentPrediction(BaseModel):
    segment_id: str
    route_id: str
    from_stop_id: str
    from_stop_name: str
    to_stop_id: str
    to_stop_name: str
    segment_distance_km: float
    predicted_travel_time_seconds: float
    historical_median_seconds: float
    scheduled_travel_time_seconds: float
    prediction_confidence: str  # HIGH, MEDIUM, LOW
    data_source: str            # xgboost_ml, time_of_day_baseline, historical_median, fallback_speed
    fallback_applied: bool


class JourneyLeg(BaseModel):
    leg_type: str               # "walking" or "transit"
    instruction: str
    duration_seconds: float
    distance_meters: float
    route_id: Optional[str] = None
    route_name: Optional[str] = None
    from_stop_id: Optional[str] = None
    from_stop_name: Optional[str] = None
    to_stop_id: Optional[str] = None
    to_stop_name: Optional[str] = None
    departure_time: str
    arrival_time: str
    intermediate_stops: List[str] = []
    segments: List[SegmentPrediction] = []
    coordinates: List[List[float]] = []  # [[lat, lng], ...]


class JourneyOption(BaseModel):
    journey_id: str
    rank: int
    preference_category: str    # "fastest", "fewest_transfers", "min_walking"
    total_duration_seconds: float
    total_duration_minutes: float
    departure_time: str
    estimated_arrival_time: str
    walking_duration_seconds: float
    bus_duration_seconds: float
    waiting_duration_seconds: float
    transfers_count: int
    confidence_score: float     # 0.0 to 1.0
    confidence_level: str       # "HIGH", "MEDIUM", "LOW"
    data_grounding: str         # "xgboost_model", "hybrid_baseline", "fallback"
    legs: List[JourneyLeg]


class JourneyResponse(BaseModel):
    query_origin: str
    query_destination: str
    departure_datetime: str
    options: List[JourneyOption]
    metadata: Dict[str, Any]


class NearbyStopsResponse(BaseModel):
    lat: float
    lng: float
    radius_meters: float
    stops: List[StopInfo]


class ModelMetric(BaseModel):
    model_name: str
    mae_seconds: float
    rmse_seconds: float
    mape_percent: float
    observations_count: int


class ModelMetricsResponse(BaseModel):
    status: str
    training_period: str
    target_variable: str
    total_segments: int
    models: List[ModelMetric]
    feature_importance: Dict[str, float]
    active_model: str


class DataStatusResponse(BaseModel):
    status: str
    total_tickets_indexed: int
    total_stops_indexed: int
    total_routes_indexed: int
    gps_cleaning_audit: Dict[str, Any]
    map_matching_quality: Dict[str, Any]
    live_feed_available: bool
    live_feed_status: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    ml_model_loaded: bool
    graph_nodes: int
    graph_edges: int
    db_ready: bool = True
    total_tickets: int = 2559899
    gtfs_mode: str = "inferred"

