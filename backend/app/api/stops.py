"""
Stops API Endpoints.
Exposes stop catalog, autocomplete search, stop details, and geospatial nearest-stop lookups.
"""

from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException

from ..services.journey_planner import planner_service
from ..data.schemas import NearbyStopsResponse, StopInfo

router = APIRouter(prefix="/api/v1/stops", tags=["Bus Stops"])


@router.get("/nearby", response_model=NearbyStopsResponse)
async def get_nearby_stops(
    lat: float = Query(..., ge=28.0, le=29.5, description="Latitude of location"),
    lng: float = Query(..., ge=76.5, le=77.8, description="Longitude of location"),
    radius: float = Query(1200.0, ge=100.0, le=5000.0, description="Search radius in meters"),
    limit: int = Query(8, ge=1, le=25, description="Maximum number of stops to return")
):
    """
    Finds nearest Delhi transit stops within a geographic radius using a spatial KD-Tree index.
    Calculates walking distance with street network factor and pedestrian walking time.
    """
    stops = planner_service.spatial_index.find_nearest_stops(
        lat=lat,
        lng=lng,
        max_distance_meters=radius,
        limit=limit
    )
    formatted = [
        {
            "stop_id": s["stop_id"],
            "stop_name": s["stop_name"],
            "lat": s["lat"],
            "lng": s["lng"],
            "distance_meters": s["walking_distance_meters"]
        }
        for s in stops
    ]
    return {
        "lat": lat,
        "lng": lng,
        "radius_meters": radius,
        "stops": formatted
    }


@router.get("")
async def search_stops(
    q: Optional[str] = Query("", description="Autocomplete search query"),
    limit: int = Query(15, ge=1, le=50, description="Maximum results")
):
    """
    Search and autocomplete stops by name or substring.
    """
    all_stops = planner_service.loader.get_all_stops()
    query = (q or "").strip().lower()

    if not query:
        return {"stops": [s["stop_name"] for s in all_stops[:limit]]}

    matches = [s["stop_name"] for s in all_stops if query in s["stop_name"].lower()]
    return {"stops": matches[:limit]}


@router.get("/{stop_id}", response_model=StopInfo)
async def get_stop_by_id(stop_id: str):
    """
    Retrieves details for a specific stop ID.
    """
    stop = planner_service.loader.get_stop(stop_id)
    if not stop:
        raise HTTPException(status_code=404, detail=f"Stop with ID '{stop_id}' not found.")
    return {
        "stop_id": stop["stop_id"],
        "stop_name": stop["stop_name"],
        "lat": stop["lat"],
        "lng": stop["lng"],
        "distance_meters": None
    }
