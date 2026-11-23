"""
Unit Tests for Public Transit Graph, Spatial Index, and Dijkstra Routing.
"""

from datetime import datetime
import pytest
from backend.app.algorithms.graph import TransitGraph
from backend.app.algorithms.dijkstra import DijkstraRouter
from backend.app.algorithms.spatial_index import SpatialIndex
from backend.app.services.journey_planner import planner_service


def test_transit_graph_construction():
    graph = TransitGraph()
    assert graph.total_nodes > 15
    assert graph.total_edges > 25

    # Check outgoing edges from Anand Vihar (ST-AV01)
    av_edges = graph.get_outgoing_edges("ST-AV01")
    assert len(av_edges) >= 2


def test_spatial_index_nearest_stops():
    index = planner_service.spatial_index
    # Query near Connaught Place (28.6313, 77.2144)
    nearby = index.find_nearest_stops(28.6313, 77.2144, max_distance_meters=1500)
    assert len(nearby) > 0
    # First stop should be Connaught Place (ST-CP01)
    assert nearby[0]["stop_id"] == "ST-CP01"
    assert nearby[0]["walking_distance_meters"] < 200.0


def test_time_dependent_dijkstra_search():
    graph = TransitGraph()
    router = DijkstraRouter(graph)
    dep_dt = datetime(2026, 11, 23, 18, 0, 0)

    # Search Anand Vihar (ST-AV01) to Connaught Place (ST-CP01)
    res = router.find_shortest_path(
        origin_stop_id="ST-AV01",
        destination_stop_id="ST-CP01",
        departure_dt=dep_dt
    )

    assert res is not None
    assert res["total_duration_seconds"] > 0
    assert len(res["segments"]) >= 3
    # Check that segment departure time advances chronologically
    first_seg = res["segments"][0]
    last_seg = res["segments"][-1]
    assert first_seg["step_departure_time"] <= last_seg["step_arrival_time"]


def test_journey_planner_multimodal():
    dep_dt = datetime(2026, 11, 23, 8, 30, 0)
    options = planner_service.plan_journey(
        origin_query="Anand Vihar",
        destination_query="Connaught Place",
        departure_dt=dep_dt
    )

    assert len(options) >= 1
    opt = options[0]
    assert opt["total_duration_minutes"] > 15.0
    assert opt["confidence_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert len(opt["legs"]) >= 1
