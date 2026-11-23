"""
Journeys API Endpoint.
Exposes GET /api/v1/journeys for multimodal time-dependent itinerary queries.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Query, HTTPException

from ..services.journey_planner import planner_service
from ..data.schemas import JourneyResponse, JourneyOption

router = APIRouter(prefix="/api/v1/journeys", tags=["Journey Planning"])


@router.get("", response_model=JourneyResponse)
async def plan_journey(
    origin: str = Query(..., description="Origin stop name or lat,lng string"),
    destination: str = Query(..., description="Destination stop name or lat,lng string"),
    departure_datetime: Optional[str] = Query(None, description="ISO format departure timestamp or HH:MM (defaults to 18:00 today)"),
    max_transfers: int = Query(2, ge=0, le=4, description="Maximum transit transfers allowed"),
    preference: str = Query("fastest", pattern="^(fastest|fewest_transfers|min_walking)$", description="Ranking preference")
):
    """
    Computes time-dependent multimodal bus journey options using XGBoost segment travel-time predictions
    and Dijkstra shortest-path routing over the Delhi transit network.
    """
    if not origin or not destination:
        raise HTTPException(status_code=400, detail="Origin and destination parameters are required.")

    # Parse departure datetime
    dep_dt = datetime.now()
    if departure_datetime:
        try:
            dep_dt = datetime.fromisoformat(departure_datetime.replace("Z", "+00:00"))
        except Exception:
            try:
                # If only HH:MM was provided
                parts = departure_datetime.split(":")
                dep_dt = dep_dt.replace(hour=int(parts[0]), minute=int(parts[1]), second=0)
            except Exception:
                pass

    options = planner_service.plan_journey(
        origin_query=origin,
        destination_query=destination,
        departure_dt=dep_dt,
        max_transfers=max_transfers,
        preference=preference
    )

    if not options:
        raise HTTPException(status_code=404, detail=f"No transit paths found between '{origin}' and '{destination}' within transfer limits.")

    return {
        "query_origin": origin,
        "query_destination": destination,
        "departure_datetime": dep_dt.isoformat(),
        "options": options,
        "metadata": {
            "algorithm": "Time-Dependent Dijkstra with Min-Heap",
            "model": "XGBoost Regressor v1.0.0",
            "transfers_constrained": max_transfers,
            "preference": preference,
            "grounding": "October 2026 Delhi Transport Stack"
        }
    }
