import sys
import os
sys.path.insert(0, os.path.abspath("."))

import pytest
from fastapi.testclient import TestClient
from src.backend.app.main import app

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_fleet_summary(client):
    response = client.get("/api/fleet/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_assets"] == 38
    assert "ready_count" in data
    assert "not_ready_count" in data

def test_get_assets(client):
    response = client.get("/api/assets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 38

def test_get_single_asset_details(client):
    response = client.get("/api/assets/AC-003")
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "AC-003"
    assert data["source_asset_id"] == 3

def test_get_sensor_telemetry(client):
    response = client.get("/api/assets/AC-003/sensors?recent_cycles=50")
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "AC-003"
    assert data["cycles_count"] == 50
    assert len(data["readings"]) == 50

def test_get_prediction_failure_risk(client):
    response = client.get("/api/assets/AC-003/prediction")
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "AC-003"
    assert data["predicted_rul"] == 18.4
    assert data["degradation_stage"] == "severe"

def test_get_readiness_evaluation(client):
    response = client.get("/api/assets/AC-003/readiness")
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "AC-003"
    assert data["readiness_category"] == "NOT READY"
    assert data["risk_level"] == "CRITICAL"
    assert len(data["evidence_reasons"]) > 0

def test_get_maintenance_queue(client):
    response = client.get("/api/maintenance/priorities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["priority"] == "P1"
    assert data[0]["knowledge_base_match"] is not None

def test_get_upcoming_missions(client):
    response = client.get("/api/missions/upcoming")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
