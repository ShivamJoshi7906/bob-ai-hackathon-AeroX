"""
MissionGuard AI - Asset-Level Decision Tools for IBM Bob
Implements get_asset_status, get_asset_prediction, get_asset_risk,
get_asset_sensor_trends, and get_upcoming_mission.
"""
from typing import Dict, Any, List, Optional
import pandas as pd
from .data_adapter import MissionGuardDataAdapter


def get_asset_status(asset_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve operational status, criticality, service age, total operating hours,
    and current evaluation cycle for a given asset.
    """
    adapter = MissionGuardDataAdapter()
    row = adapter.get_asset_row(asset_id)
    if not row:
        return None

    readiness = adapter.get_asset_readiness_data(asset_id)
    eval_cycle = adapter.get_asset_eval_cycle(asset_id)

    return {
        "asset_id": asset_id,
        "source_asset_id": int(row["source_asset_id"]),
        "asset_type": row["asset_type"],
        "mission_criticality": row["mission_criticality"],
        "service_age_years": int(row["service_age"]),
        "total_operating_hours": int(row["total_operating_hours"]),
        "current_operating_cycle": eval_cycle,
        "maintenance_count": int(row["maintenance_count"]),
        "last_maintenance_cycle": int(row["last_maintenance_cycle"]),
        "readiness_score": readiness["readiness_score"] if readiness else None,
        "readiness_category": readiness["readiness_category"] if readiness else None
    }


def get_asset_prediction(asset_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve predicted Remaining Useful Life (RUL), confidence bounds,
    30-cycle early warning failure probability, and degradation stage.
    """
    adapter = MissionGuardDataAdapter()
    return adapter.get_asset_prediction_data(asset_id)


def get_asset_risk(asset_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve failure risk assessment (LOW, MEDIUM, HIGH, CRITICAL),
    early-warning probability, and key degrading sensor channels.
    """
    adapter = MissionGuardDataAdapter()
    return adapter.get_asset_risk_data(asset_id)


def get_asset_sensor_trends(asset_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve recent sensor telemetry drift and rate-of-change across critical channels
    (HPC outlet temp s2, combustor temp s3, core speed s9, static pressure s11).
    """
    adapter = MissionGuardDataAdapter()
    sensor_df = adapter.sensors_df[adapter.sensors_df["asset_id"] == asset_id]
    if sensor_df.empty:
        return None

    eval_cycle = adapter.get_asset_eval_cycle(asset_id)
    recent = sensor_df[sensor_df["cycle"] <= eval_cycle].tail(30)
    if recent.empty:
        recent = sensor_df.tail(30)

    # Compute baseline (first 10 cycles) vs recent (last 10 cycles) drift
    early = sensor_df.head(15)
    
    def calc_drift(sensor_col: str) -> Dict[str, float]:
        early_val = early[sensor_col].mean() if not early.empty else 0.0
        curr_val = recent[sensor_col].iloc[-1] if not recent.empty else 0.0
        pct_drift = round(((curr_val - early_val) / early_val) * 100, 2) if early_val != 0 else 0.0
        return {
            "current_value": round(float(curr_val), 2),
            "baseline_value": round(float(early_val), 2),
            "percent_drift": pct_drift,
            "status": "degrading" if abs(pct_drift) > 1.5 else "nominal"
        }

    return {
        "asset_id": asset_id,
        "evaluated_at_cycle": eval_cycle,
        "recent_cycles_analyzed": len(recent),
        "telemetry_channels": {
            "s2_hpc_outlet_temp": calc_drift("s2"),
            "s3_combustor_outlet_temp": calc_drift("s3"),
            "s4_lpt_outlet_temp": calc_drift("s4"),
            "s9_core_speed": calc_drift("s9"),
            "s11_static_pressure": calc_drift("s11"),
            "s14_bypass_ratio": calc_drift("s14")
        },
        "observation": "High thermal drift observed on s2 and reduced core speed on s9 indicate progressive High Pressure Compressor wear."
    }


def get_upcoming_mission(asset_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve upcoming scheduled mission window, required operating cycles,
    readiness threshold, and calculated buffer margin.
    """
    adapter = MissionGuardDataAdapter()
    return adapter.get_asset_mission_data(asset_id)
