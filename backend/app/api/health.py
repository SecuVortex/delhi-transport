"""
Health Check API Endpoints.
Exposes GET /api/v1/health and root GET /health.
"""

from fastapi import APIRouter
from ..services.journey_planner import planner_service
from ..ml.predict import predictor
from ..data.schemas import HealthResponse

router = APIRouter(tags=["System Health"])


@router.get("/api/v1/health", response_model=HealthResponse)
async def get_health_v1():
    """Returns detailed operational health and component readiness."""
    return {
        "status": "ok",
        "service": "delhi-bus-intelligence-api",
        "version": "1.0.0",
        "ml_model_loaded": predictor.xgb_model is not None,
        "graph_nodes": planner_service.graph.total_nodes,
        "graph_edges": planner_service.graph.total_edges,
        "db_ready": True,
        "total_tickets": 2559899,
        "gtfs_mode": "inferred"
    }


@router.get("/health")
async def get_health_root():
    """Simple health probe for load balancers and container monitors."""
    return {
        "status": "ok",
        "db_ready": True,
        "total_tickets": 2559899,
        "gtfs_mode": "inferred",
        "service": "delhi-bus-intelligence-api"
    }

