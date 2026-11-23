"""
Live GTFS-RT Telemetry and GPS Ingestion API.
Allows external vehicle trackers or demonstration simulators to stream
live GPS speeds and blend them into the time-dependent journey planner.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter

from ..services.live_data_service import live_service
from ..data.gtfs_loader import GTFSLoader

router = APIRouter(prefix="/api/v1/live", tags=["Live GPS Telemetry"])


class LivePingRequest(BaseModel):
    segment_id: str = Field(..., description="Corridor segment identifier (e.g. SEG-ST-AV01-ST-MD01)")
    speed_kmh: float = Field(..., ge=1.0, le=120.0, description="Observed bus speed in km/h")
    vehicle_id: str = Field(..., description="Vehicle registration or bus identifier")


class LivePingBatchRequest(BaseModel):
    observations: List[LivePingRequest]


@router.get("/status")
async def get_live_status():
    """Returns current live feed connectivity status, freshness, and active segment count."""
    return live_service.get_status()


@router.post("/ping")
async def record_live_ping(ping: LivePingRequest):
    """
    Ingests a single live GPS vehicle observation on a corridor segment.
    Updates the exponential decay freshness model.
    """
    live_service.update_live_observation(
        segment_id=ping.segment_id,
        speed_kmh=ping.speed_kmh,
        vehicle_id=ping.vehicle_id
    )
    return {
        "status": "recorded",
        "segment_id": ping.segment_id,
        "speed_kmh": ping.speed_kmh,
        "vehicle_id": ping.vehicle_id,
        "active_segments": len(live_service.live_observations)
    }


@router.post("/simulate")
async def simulate_live_fleet():
    """
    Simulates real-time telemetry from Delhi active bus fleet.
    Injects 10 live GPS pings across Line 101, Line 204, and Ring Road corridors.
    """
    loader = GTFSLoader()
    segments = loader.get_all_segments()

    # Sample realistic telemetry
    sample_pings = [
        ("DL1PC-4021", 18.5),  # Congested urban corridor
        ("DL1PC-7782", 14.2),  # Slow traffic
        ("DL1PC-1193", 26.0),  # Moderate moving
        ("DL1PC-5504", 32.5),  # Free flow
        ("DL1PC-3319", 12.0),  # Severe congestion
        ("DL1PC-9081", 28.0),  # Express corridor
        ("DL1PC-6214", 22.0),
        ("DL1PC-8431", 16.5)
    ]

    injected = []
    for i, seg in enumerate(segments[:len(sample_pings)]):
        veh_id, speed = sample_pings[i]
        live_service.update_live_observation(
            segment_id=seg["segment_id"],
            speed_kmh=speed,
            vehicle_id=veh_id
        )
        injected.append({
            "segment_id": seg["segment_id"],
            "route_id": seg["route_id"],
            "from_stop": seg["from_stop_id"],
            "to_stop": seg["to_stop_id"],
            "speed_kmh": speed,
            "vehicle_id": veh_id
        })

    return {
        "status": "simulation_active",
        "injected_count": len(injected),
        "injected_observations": injected,
        "message": "Live GTFS-RT feed simulated successfully. Subsequent journey queries will blend these observations."
    }


@router.post("/reset")
async def reset_live_telemetry():
    """Clears all live observations and resets to October 2026 ground truth."""
    live_service.live_observations.clear()
    live_service.is_live_feed_connected = False
    live_service.feed_status_message = "Historical Model Mode (Real-time feed not connected; using October 2026 ground truth)"
    return {
        "status": "reset",
        "message": "Live observations cleared. System reverted to historical model mode."
    }
