"""
Unit and Integration Tests for Real-Time GPS Ingestion and Blending.
Verifies live ping recording, exponential decay calculation, simulated fleet injection,
and integration with the time-dependent Dijkstra journey router.
"""

import pytest
import time
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.live_data_service import LiveDataService, live_service

client = TestClient(app)


def test_live_data_service_decay():
    service = LiveDataService(half_life_seconds=60.0)

    # 1. Initially no live observations
    blend_none = service.blend_prediction(
        segment_id="SEG-TEST-01",
        segment_distance_km=2.0,
        historical_pred_seconds=300.0
    )
    assert not blend_none["is_live_blended"]
    assert blend_none["blended_seconds"] == 300.0

    # 2. Inject fresh observation (current time)
    service.update_live_observation("SEG-TEST-01", speed_kmh=20.0, vehicle_id="DL1PC-9999")
    blend_fresh = service.blend_prediction(
        segment_id="SEG-TEST-01",
        segment_distance_km=2.0,
        historical_pred_seconds=300.0
    )
    assert blend_fresh["is_live_blended"]
    assert blend_fresh["live_weight"] > 0.7  # close to max 0.75 weight
    assert blend_fresh["blended_seconds"] > 0

    # 3. Old observation (> 15 minutes) should be discarded
    service.live_observations["SEG-TEST-01"]["timestamp"] = time.time() - 1000.0
    blend_expired = service.blend_prediction(
        segment_id="SEG-TEST-01",
        segment_distance_km=2.0,
        historical_pred_seconds=300.0
    )
    assert not blend_expired["is_live_blended"]
    assert blend_expired["blended_seconds"] == 300.0


def test_live_api_endpoints():
    # 1. Test status
    res = client.get("/api/v1/live/status")
    assert res.status_code == 200
    assert "is_connected" in res.json()

    # 2. Test single ping
    res_ping = client.post("/api/v1/live/ping", json={
        "segment_id": "SEG-ST-AV01-ST-MD01",
        "speed_kmh": 15.0,
        "vehicle_id": "DL1PC-1234"
    })
    assert res_ping.status_code == 200
    assert res_ping.json()["status"] == "recorded"

    # 3. Test simulate
    res_sim = client.post("/api/v1/live/simulate")
    assert res_sim.status_code == 200
    assert res_sim.json()["status"] == "simulation_active"
    assert res_sim.json()["injected_count"] > 0

    # 4. Test journey reflects live blending
    res_j = client.get("/api/v1/journeys?origin=Anand%20Vihar&destination=Connaught%20Place&departure_datetime=18:00")
    assert res_j.status_code == 200
    j_data = res_j.json()
    assert len(j_data["options"]) > 0
    first_opt = j_data["options"][0]
    # Check that at least one segment has live data source
    sources = [
        seg["data_source"]
        for leg in first_opt["legs"] if leg["leg_type"] == "transit"
        for seg in leg.get("segments", [])
    ]
    assert any("live_gps_blended" in s for s in sources)

    # 5. Test reset
    res_reset = client.post("/api/v1/live/reset")
    assert res_reset.status_code == 200
    assert res_reset.json()["status"] == "reset"
