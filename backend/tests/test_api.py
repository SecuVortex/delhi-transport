"""
API Endpoint Integration Tests using FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoints():
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "ok"

    r2 = client.get("/api/v1/health")
    assert r2.status_code == 200
    data = r2.json()
    assert data["service"] == "delhi-bus-intelligence-api"
    assert data["ml_model_loaded"] is True
    assert data["graph_nodes"] > 10


def test_journeys_endpoint():
    resp = client.get("/api/v1/journeys?origin=Anand%20Vihar&destination=Connaught%20Place&departure_datetime=18:00")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["options"]) >= 1

    opt = data["options"][0]
    assert opt["total_duration_minutes"] > 10.0
    assert "legs" in opt
    assert opt["confidence_level"] in ["HIGH", "MEDIUM", "LOW"]


def test_nearby_stops_endpoint():
    # Near Connaught Place (28.6313, 77.2144)
    resp = client.get("/api/v1/stops/nearby?lat=28.6313&lng=77.2144&radius=1500")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["stops"]) > 0
    assert data["stops"][0]["stop_name"] == "Connaught Place (Regal / Palika)"


def test_routes_endpoint():
    resp = client.get("/api/v1/routes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_routes"] >= 6


def test_model_metrics_endpoint():
    resp = client.get("/api/v1/model/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["models"]) == 4
    assert "feature_importance" in data


def test_data_status_endpoint():
    resp = client.get("/api/v1/data-status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_tickets_indexed"] == 2559899
    assert "gps_cleaning_audit" in data
    assert "map_matching_quality" in data
