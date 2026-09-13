"""
Automated Pytest Suite for IBM Bob Copilot & Decision Tools
Verifies:
1. Tool execution & schema validity for all 9 MCP tools
2. The 3 Mandatory Hackathon Questions
3. FastAPI endpoint integration via TestClient
"""
import pytest
import sys
import os
from fastapi.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.backend.app.main import app
from src.backend.app.services.bob_service import BobCopilotService
from src.backend.app.bob_tools import (
    get_fleet_summary,
    get_not_ready_assets,
    get_asset_status,
    get_asset_prediction,
    get_asset_risk,
    get_asset_sensor_trends,
    get_upcoming_mission,
    get_maintenance_recommendations,
    search_maintenance_knowledge,
    BOB_TOOL_DEFINITIONS
)

client = TestClient(app)
bob_service = BobCopilotService()


def test_health_check_endpoint():
    """Verify backend health check returns status 200 and operational status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ibm_bob_copilot"] == "operational"


def test_bob_tools_exist_and_return_data():
    """Asserts that each of the 9 tools executes and returns valid types."""
    # 1. Fleet summary
    summary = get_fleet_summary()
    assert isinstance(summary, dict)
    assert summary["total_assets"] == 38

    # 2. Not ready assets
    non_ready = get_not_ready_assets()
    assert isinstance(non_ready, list)
    assert len(non_ready) > 0

    # 3. Asset status
    status = get_asset_status("AC-003")
    assert isinstance(status, dict)
    assert status["asset_id"] == "AC-003"

    # 4. Asset prediction
    pred = get_asset_prediction("AC-003")
    assert isinstance(pred, dict)
    assert pred["predicted_rul"] > 0

    # 5. Asset risk
    risk = get_asset_risk("AC-003")
    assert isinstance(risk, dict)
    assert risk["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    # 6. Sensor trends
    trends = get_asset_sensor_trends("AC-003")
    assert isinstance(trends, dict)
    assert "telemetry_channels" in trends

    # 7. Upcoming mission
    mission = get_upcoming_mission("AC-003")
    assert isinstance(mission, dict)
    assert mission["mission_id"] == "MSN-0001"

    # 8. Maintenance recommendations
    recs = get_maintenance_recommendations()
    assert isinstance(recs, list)
    assert len(recs) > 0

    # 9. Maintenance knowledge search
    knowledge = search_maintenance_knowledge("compressor")
    assert isinstance(knowledge, list)
    assert len(knowledge) > 0


def test_bob_query_question_1_not_ready_assets():
    """Tests Mandatory Question 1: 'Which assets are not ready?'"""
    res = bob_service.query("Which assets are not ready?")
    assert res["intent"] == "GET_NOT_READY_ASSETS"
    assert "get_not_ready_assets" in res["tools_called"]
    assert "AC-" in res["answer"]
    assert res["evidence"]["total_non_ready"] > 0
    assert len(res["evidence"]["not_ready_assets"]) > 0


def test_bob_query_question_2_why_asset_not_ready():
    """Tests Mandatory Question 2: 'Why is AC-003 not ready?'"""
    res = bob_service.query("Why is AC-003 not ready?", explicit_asset_id="AC-003")
    assert res["intent"] == "WHY_ASSET_NOT_READY"
    assert "get_asset_prediction" in res["tools_called"]
    assert "get_upcoming_mission" in res["tools_called"]
    assert "AC-003" in res["answer"]
    assert "Mission Window Shortfall" in res["answer"]
    assert "Physical Telemetry Evidence" in res["answer"]
    assert res["evidence"]["asset_id"] == "AC-003"
    assert "predicted_rul" in res["evidence"]
    assert "buffer_cycles" in res["evidence"]


def test_bob_query_question_3_what_maintenance_first():
    """Tests Mandatory Question 3: 'What should maintenance do first?'"""
    res = bob_service.query("What should maintenance do first?")
    assert res["intent"] == "MAINTENANCE_PRIORITIZATION"
    assert "get_maintenance_recommendations" in res["tools_called"]
    assert "TOP PRIORITY" in res["answer"]
    assert "P1" in res["answer"]
    assert res["evidence"]["p1_total_count"] > 0


def test_fastapi_bob_endpoint_query():
    """Verify POST /api/bob/query via TestClient."""
    payload = {
        "query": "Why is AC-003 not ready?",
        "asset_id": "AC-003"
    }
    response = client.post("/api/bob/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "WHY_ASSET_NOT_READY"
    assert "AC-003" in data["answer"]
    assert data["evidence"]["asset_id"] == "AC-003"
    assert "get_asset_prediction" in data["tools_called"]


def test_fastapi_bob_tools_endpoint():
    """Verify GET /api/bob/tools returns all 9 MCP tool declarations."""
    response = client.get("/api/bob/tools")
    assert response.status_code == 200
    data = response.json()
    assert data["tools_count"] == 9
    assert len(data["tools"]) == 9
    names = [t["name"] for t in data["tools"]]
    assert "get_fleet_summary" in names
    assert "get_not_ready_assets" in names
    assert "get_asset_prediction" in names
    assert "get_maintenance_recommendations" in names
