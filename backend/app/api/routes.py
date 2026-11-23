"""
Routes API Endpoints.
Exposes corridor catalog, route alignments, and stop sequence inspection.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

from ..services.journey_planner import planner_service

router = APIRouter(prefix="/api/v1/routes", tags=["Bus Routes"])


@router.get("")
async def get_all_routes():
    """
    Returns list of monitored bus routes across Delhi NCR.
    """
    routes = planner_service.loader.get_all_routes()
    result = []
    for r in routes:
        stop_names = [planner_service.loader.get_stop(sid)["stop_name"] for sid in r["stops"] if planner_service.loader.get_stop(sid)]
        origin_name = stop_names[0] if stop_names else "Origin"
        dest_name = stop_names[-1] if stop_names else "Destination"

        result.append({
            "route_id": r["route_id"],
            "route_name": r["route_name"],
            "corridor": r["corridor"],
            "origin": origin_name,
            "destination": dest_name,
            "stops_count": len(r["stops"]),
            "operating_hours": "05:30 - 23:00",
            "frequency": "Every 10-15 min",
            "status": "Active"
        })
    return {"total_routes": len(result), "routes": result}


@router.get("/{route_id}")
async def get_route_details(route_id: str):
    """
    Returns detailed stop progression sequence and corridor alignment for a specific route.
    """
    routes = planner_service.loader.get_all_routes()
    match = next((r for r in routes if r["route_id"].lower() == route_id.lower()), None)

    if not match:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found.")

    stops_data = []
    for idx, sid in enumerate(match["stops"]):
        s_info = planner_service.loader.get_stop(sid)
        if s_info:
            stops_data.append({
                "sequence": idx + 1,
                "stop_id": s_info["stop_id"],
                "stop_name": s_info["stop_name"],
                "lat": s_info["lat"],
                "lng": s_info["lng"]
            })

    return {
        "route_id": match["route_id"],
        "route_name": match["route_name"],
        "corridor": match["corridor"],
        "stops": stops_data
    }
