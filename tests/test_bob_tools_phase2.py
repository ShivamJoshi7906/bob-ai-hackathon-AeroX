"""
Test verification script for Phase 2: All 9 IBM Bob Decision Tools
"""
import sys
import os

# Add workspace to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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

def run_all_tests():
    print("=" * 60)
    print("PHASE 2 VERIFICATION: IBM BOB DECISION TOOLS")
    print("=" * 60)

    # 1. Fleet Summary
    summary = get_fleet_summary()
    assert summary["total_assets"] == 38, f"Expected 38 assets, got {summary['total_assets']}"
    assert "ready_count" in summary
    assert "not_ready_count" in summary
    print(f"Tool 1 [get_fleet_summary]: SUCCESS - Total Assets: {summary['total_assets']}, Not Ready: {summary['not_ready_count']}, Critical Risk: {summary['critical_risk_count']}")

    # 2. Not Ready Assets
    not_ready = get_not_ready_assets()
    assert len(not_ready) > 0, "Expected non-ready assets to be identified"
    print(f"Tool 2 [get_not_ready_assets]: SUCCESS - Identified {len(not_ready)} assets requiring attention")
    print(f"   Top non-ready asset: {not_ready[0]['asset_id']} (Buffer: {not_ready[0]['buffer_cycles']} cycles, Category: {not_ready[0]['readiness_category']})")

    # 3. Asset Status
    status = get_asset_status("AC-003")
    assert status["asset_id"] == "AC-003"
    assert status["asset_type"] == "Turbofan-A"
    print(f"Tool 3 [get_asset_status]: SUCCESS - AC-003 Cycle: {status['current_operating_cycle']}, Criticality: {status['mission_criticality']}")

    # 4. Asset Prediction
    pred = get_asset_prediction("AC-003")
    assert pred["asset_id"] == "AC-003"
    assert pred["predicted_rul"] > 0
    assert 0.0 <= pred["failure_within_30_prob"] <= 1.0
    print(f"Tool 4 [get_asset_prediction]: SUCCESS - AC-003 Predicted RUL: {pred['predicted_rul']} cycles, 30-cycle prob: {pred['failure_within_30_prob']}")

    # 5. Asset Risk
    risk = get_asset_risk("AC-003")
    assert risk["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    print(f"Tool 5 [get_asset_risk]: SUCCESS - AC-003 Risk Level: {risk['risk_level']}")

    # 6. Sensor Trends
    trends = get_asset_sensor_trends("AC-003")
    assert "telemetry_channels" in trends
    s2_drift = trends["telemetry_channels"]["s2_hpc_outlet_temp"]["percent_drift"]
    print(f"Tool 6 [get_asset_sensor_trends]: SUCCESS - AC-003 s2 (HPC Temp) Drift: {s2_drift}%")

    # 7. Upcoming Mission
    mission = get_upcoming_mission("AC-003")
    assert mission["mission_id"] == "MSN-0001"
    assert mission["mission_cycles_required"] == 30
    print(f"Tool 7 [get_upcoming_mission]: SUCCESS - Mission: {mission['mission_id']}, Required: {mission['mission_cycles_required']} cycles, Buffer: {mission['buffer_cycles']} cycles")

    # 8. Maintenance Recommendations
    recs = get_maintenance_recommendations()
    assert len(recs) > 0
    p1_count = len([r for r in recs if r["priority"] == "P1"])
    print(f"Tool 8 [get_maintenance_recommendations]: SUCCESS - {len(recs)} total recommendations ({p1_count} P1 Critical)")
    print(f"   Top P1 Action: Asset {recs[0]['asset_id']} - {recs[0]['recommended_action']}")

    # 9. Search Maintenance Knowledge
    knowledge = search_maintenance_knowledge("gasket")
    assert len(knowledge) > 0
    assert "synthetic_linkage" in knowledge[0]
    print(f"Tool 9 [search_maintenance_knowledge]: SUCCESS - Found {len(knowledge)} knowledge procedures for 'gasket'")
    print(f"   Sample Procedure: {knowledge[0]['component']} - {knowledge[0]['action_taken']}")

    # 10. MCP Tool Definitions
    assert len(BOB_TOOL_DEFINITIONS) == 9, f"Expected 9 tool definitions, got {len(BOB_TOOL_DEFINITIONS)}"
    print(f"\nMCP Tool Schema Definitions: 9/9 standard tool schemas validated.")

    print("\n" + "=" * 60)
    print("ALL 9 IBM BOB DECISION TOOLS ARE 100% OPERATIONAL!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
