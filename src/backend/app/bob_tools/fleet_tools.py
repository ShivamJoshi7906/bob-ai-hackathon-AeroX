"""
MissionGuard AI - Fleet-Level Decision Tools for IBM Bob
Implements get_fleet_summary and get_not_ready_assets.
"""
from typing import Dict, Any, List
from .data_adapter import MissionGuardDataAdapter


def get_fleet_summary() -> Dict[str, Any]:
    """
    Retrieve operational fleet-level readiness metrics, risk distribution,
    and urgent maintenance counts across all assets.
    """
    adapter = MissionGuardDataAdapter()
    assets = adapter.assets_df["asset_id"].tolist()

    ready = 0
    monitoring = 0
    inspection = 0
    not_ready = 0
    critical_risk = 0
    high_risk = 0

    for aid in assets:
        readiness = adapter.get_asset_readiness_data(aid)
        if readiness:
            cat = readiness["readiness_category"]
            risk = readiness["risk_level"]
            if cat == "READY":
                ready += 1
            elif cat == "READY WITH MONITORING":
                monitoring += 1
            elif cat == "NEEDS INSPECTION":
                inspection += 1
            elif cat == "NOT READY":
                not_ready += 1

            if risk == "CRITICAL":
                critical_risk += 1
            elif risk == "HIGH":
                high_risk += 1

    return {
        "total_assets": len(assets),
        "ready_count": ready,
        "monitoring_count": monitoring,
        "inspection_count": inspection,
        "not_ready_count": not_ready,
        "critical_risk_count": critical_risk,
        "high_risk_count": high_risk,
        "upcoming_missions_count": len(adapter.windows_df),
        "urgent_maintenance_p1": not_ready,
        "fleet_readiness_rate_percent": round(((ready + monitoring) / len(assets)) * 100, 1) if assets else 0.0
    }


def get_not_ready_assets() -> List[Dict[str, Any]]:
    """
    Retrieve all assets currently classified as NOT READY or NEEDS INSPECTION,
    along with their predicted RUL, mission requirements, and negative buffer shortfalls.
    """
    adapter = MissionGuardDataAdapter()
    assets = adapter.assets_df["asset_id"].tolist()
    non_ready_list = []

    for aid in assets:
        readiness = adapter.get_asset_readiness_data(aid)
        if readiness and readiness["readiness_category"] in ["NOT READY", "NEEDS INSPECTION"]:
            non_ready_list.append({
                "asset_id": aid,
                "readiness_category": readiness["readiness_category"],
                "readiness_score": readiness["readiness_score"],
                "risk_level": readiness["risk_level"],
                "predicted_rul": readiness["predicted_rul"],
                "mission_cycles_required": readiness["mission_cycles_required"],
                "buffer_cycles": readiness["buffer_cycles"],
                "mission_id": readiness["mission_id"],
                "mission_window_start": readiness["mission_window_start"],
                "recommended_action": readiness["recommended_action"]
            })

    # Sort primarily by buffer deficit (worst buffer first), then readiness score
    non_ready_list.sort(key=lambda x: (x["buffer_cycles"], x["readiness_score"]))
    return non_ready_list
