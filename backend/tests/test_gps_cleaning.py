"""
Unit Tests for GPS Data Cleaning & Trajectory Reconstruction.
"""

import pytest
from backend.app.algorithms.gps_cleaning import GPSCleaner, haversine_distance_meters


def test_haversine_distance():
    # Distance between Connaught Place (28.6313, 77.2144) and Anand Vihar (28.6488, 77.2871)
    dist = haversine_distance_meters(28.6313, 77.2144, 28.6488, 77.2871)
    # Approx 7.3 km
    assert 6800.0 < dist < 7800.0


def test_gps_cleaner_filtering():
    cleaner = GPSCleaner()

    raw_data = [
        # 1. Valid observation
        {"vehicle_id": "DL-01-1234", "timestamp": 1700000000, "latitude": 28.6313, "longitude": 77.2144},
        # 2. Missing coordinate
        {"vehicle_id": "DL-01-1234", "timestamp": 1700000010, "latitude": None, "longitude": 77.2144},
        # 3. Out of bounds (e.g. Mumbai lat 19.07)
        {"vehicle_id": "DL-01-1234", "timestamp": 1700000020, "latitude": 19.0760, "longitude": 72.8777},
        # 4. Duplicate observation
        {"vehicle_id": "DL-01-1234", "timestamp": 1700000000, "latitude": 28.6313, "longitude": 77.2144},
        # 5. Teleportation jump (5000 meters in 10 seconds -> 1800 km/h)
        {"vehicle_id": "DL-01-1234", "timestamp": 1700000010, "latitude": 28.6800, "longitude": 77.2800},
        # 6. Valid step progression (150 meters in 15 seconds -> 36 km/h)
        {"vehicle_id": "DL-01-1234", "timestamp": 1700000015, "latitude": 28.6322, "longitude": 77.2155}
    ]

    cleaned = cleaner.clean_records(raw_data)
    audit = cleaner.get_audit_report()

    assert audit["missing_fields"] == 1
    assert audit["out_of_bounds"] == 1
    assert audit["duplicate_records"] >= 1
    assert audit["teleportation_jumps"] >= 1
    assert len(cleaned) == 2  # Only record 1 and record 6
    assert cleaned[0]["latitude"] == 28.6313
    assert cleaned[1]["latitude"] == 28.6322
