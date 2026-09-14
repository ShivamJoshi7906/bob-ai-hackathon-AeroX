from pydantic import BaseModel
from typing import Optional

class FleetSummary(BaseModel):
    total_assets: int
    ready_count: int
    monitoring_count: int
    inspection_count: int
    not_ready_count: int
    critical_risk_count: int
    high_risk_count: int
    upcoming_missions_30d: int
    urgent_maintenance_p1: int

class AssetResponse(BaseModel):
    asset_id: str
    asset_type: str
    total_operating_hours: float
    mission_criticality: str
    predicted_rul: float
    risk_level: str
    readiness_score: float
    readiness_category: str
    next_mission_date: Optional[str] = None
    next_mission_priority: Optional[str] = None

class AssetDetailResponse(BaseModel):
    asset_id: str
    source_asset_id: int
    asset_type: str
    mission_criticality: str
    service_age: int
    service_age_months: Optional[int] = None
    total_operating_hours: float
    maintenance_count: int
    last_maintenance_cycle: int
    latest_cycle: int
    current_cycle: Optional[int] = None
    operational_setting_1: float
    operational_setting_2: float
    operational_setting_3: float
    predicted_rul: float = 110.0
    risk_level: str = "LOW"
    readiness_score: float = 95.0
    readiness_category: str = "READY"
    baseline_life_cycles: int = 250
    engine_model: str = "Pratt & Whitney F135-PW-100"
    assigned_squadron: str = "4th Fighter Squadron (Vipers)"
    next_mission_date: Optional[str] = "2026-10-31"
    next_mission_priority: Optional[str] = "CRITICAL"
    buffer_cycles: Optional[float] = None
    mission_cycles_required: Optional[int] = 30

