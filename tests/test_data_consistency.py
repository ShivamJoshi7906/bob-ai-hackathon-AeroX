import pytest
from fastapi.testclient import TestClient
from src.backend.app.main import app
from src.backend.app.bob_tools import (
    get_fleet_summary,
    get_not_ready_assets,
    get_asset_prediction,
    get_maintenance_recommendations,
)

client = TestClient(app)

def test_fleet_summary_sum_equals_38():
    """Verify fleet readiness partition adds up to exactly 38 total assets without overlap."""
    response = client.get("/api/fleet/summary")
    assert response.status_code == 200
    data = response.json()
    
    total = data["total_assets"]
    ready = data["ready_count"]
    monitoring = data["monitoring_count"]
    inspection = data["inspection_count"]
    not_ready = data["not_ready_count"]
    
    assert total == 38, f"Expected 38 total assets, got {total}"
    assert ready + monitoring + inspection + not_ready == total, (
        f"Readiness counts must sum to {total}: "
        f"ready({ready}) + mon({monitoring}) + insp({inspection}) + not_ready({not_ready}) != {total}"
    )
    assert not_ready == 3, f"Expected 3 not_ready assets (AC-003, AC-014, AC-028), got {not_ready}"
    assert ready == 26, f"Expected 26 ready assets, got {ready}"
    assert monitoring == 6, f"Expected 6 monitoring assets, got {monitoring}"
    assert inspection == 3, f"Expected 3 inspection assets, got {inspection}"

def test_ac003_rul_consistency_across_all_endpoints():
    """Verify AC-003 has canonical RUL = 18.4 across all routes and adapters."""
    # 1. Asset detail
    res_asset = client.get("/api/assets/AC-003")
    assert res_asset.status_code == 200
    assert res_asset.json()["predicted_rul"] == 18.4

    # 2. Prediction route
    res_pred = client.get("/api/assets/AC-003/prediction")
    assert res_pred.status_code == 200
    assert res_pred.json()["predicted_rul"] == 18.4

    # 3. Readiness route
    res_ready = client.get("/api/assets/AC-003/readiness")
    assert res_ready.status_code == 200
    data_ready = res_ready.json()
    assert data_ready["predicted_rul"] == 18.4
    assert data_ready["readiness_category"] == "NOT READY"
    assert data_ready["mission_cycles_required"] == 30
    assert data_ready["mission_buffer_cycles"] == -11.6

    # 4. Maintenance route
    res_maint = client.get("/api/maintenance/priorities")
    assert res_maint.status_code == 200
    maint_items = res_maint.json()
    ac003_maint = next((item for item in maint_items if item["asset_id"] == "AC-003"), None)
    assert ac003_maint is not None
    assert ac003_maint["predicted_rul"] == 18.4
    assert ac003_maint["affected_subsystem"] != ""
    assert ac003_maint["identified_issue"] != ""
    assert "High Pressure Compressor" in ac003_maint["affected_subsystem"]

    # 5. Missions route
    res_msn = client.get("/api/missions/upcoming")
    assert res_msn.status_code == 200
    missions = res_msn.json()
    ac003_msn = next((m for m in missions if m["asset_id"] == "AC-003"), None)
    assert ac003_msn is not None
    assert ac003_msn["current_rul"] == 18.4
    assert ac003_msn["required_cycles"] == 30
    assert ac003_msn["buffer_margin"] == -11.6
    assert ac003_msn["status"] == "MISSION THREAT"

    # 6. Bob tool
    bob_pred = get_asset_prediction("AC-003")
    assert bob_pred is not None
    assert bob_pred["predicted_rul"] == 18.4

def test_buffer_formula_invariant():
    """Verify that buffer == round(rul - required, 1) across all missions."""
    res = client.get("/api/missions/upcoming")
    assert res.status_code == 200
    missions = res.json()
    for m in missions:
        expected_buffer = round(m["current_rul"] - m["required_cycles"], 1)
        assert m["buffer_margin"] == expected_buffer, (
            f"Mission {m['mission_id']}: expected buffer {expected_buffer}, got {m['buffer_margin']}"
        )

def test_sensor_telemetry_schema():
    """Verify sensor endpoint returns valid readings list with sensor keys."""
    res = client.get("/api/assets/AC-003/sensors?recent_cycles=10")
    assert res.status_code == 200
    data = res.json()
    assert "readings" in data
    readings = data["readings"]
    assert len(readings) == 10
    for r in readings:
        assert "cycle" in r
        assert "s2" in r
        assert "s3" in r
        assert "s4" in r
        assert "s7" in r

def test_bob_not_ready_query_answer():
    """Verify Bob natural language query on not ready assets returns AC-003 with 18.4 cycles."""
    res = client.post("/api/bob/query", json={"query": "Which assets are not ready?"})
    assert res.status_code == 200
    data = res.json()
    assert "AC-003" in data["answer"]
    assert "18.4" in data["answer"]
    assert "get_not_ready_assets" in data["tools_called"]

def test_bob_why_ac003_query_answer():
    """Verify Bob query explaining AC-003 gives exact 18.4 RUL and -11.6 buffer."""
    res = client.post("/api/bob/query", json={"query": "Why is AC-003 not ready?", "asset_id": "AC-003"})
    assert res.status_code == 200
    data = res.json()
    assert "18.4" in data["answer"]
    assert "-11.6" in data["answer"]
    assert "AC-003" in data["answer"]
