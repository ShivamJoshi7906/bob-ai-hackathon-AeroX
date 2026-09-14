from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from src.backend.app.database import get_db
from src.backend.app.models.asset import Asset
from src.backend.app.schemas.asset_schema import FleetSummary, AssetResponse, AssetDetailResponse
from src.backend.app.services.asset_service import get_all_assets, get_asset_by_id
from src.backend.app.services.readiness_service import evaluate_asset_readiness
from src.backend.app.services.prediction_service import prediction_service

router = APIRouter()

@router.get("/fleet/summary", response_model=FleetSummary)
def get_fleet_summary(db: Session = Depends(get_db)):
    assets = get_all_assets(db)
    ready = 0
    monitoring = 0
    inspection = 0
    not_ready = 0
    critical_risk = 0
    high_risk = 0

    for asset in assets:
        readiness = evaluate_asset_readiness(db, asset.asset_id)
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

    return FleetSummary(
        total_assets=len(assets),
        ready_count=ready,
        monitoring_count=monitoring,
        inspection_count=inspection,
        not_ready_count=not_ready,
        critical_risk_count=critical_risk,
        high_risk_count=high_risk,
        upcoming_missions_30d=14,
        urgent_maintenance_p1=not_ready + critical_risk
    )

@router.get("/assets", response_model=List[AssetResponse])
def list_assets(
    status: Optional[str] = Query(None),
    risk: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    assets = get_all_assets(db)
    result = []

    for asset in assets:
        readiness = evaluate_asset_readiness(db, asset.asset_id)
        pred = prediction_service.predict_rul(db, asset.asset_id)

        # Apply search filter
        if search:
            s_lower = search.lower()
            if s_lower not in asset.asset_id.lower() and s_lower not in asset.asset_type.lower():
                continue

        # Apply status filter
        if status and status.upper() != "ALL":
            if readiness["readiness_category"].upper() != status.upper():
                continue

        # Apply risk filter
        if risk and risk.upper() != "ALL":
            if pred["risk_level"].upper() != risk.upper():
                continue

        result.append(
            AssetResponse(
                asset_id=asset.asset_id,
                asset_type=asset.asset_type,
                total_operating_hours=asset.total_operating_hours,
                mission_criticality=asset.mission_criticality,
                predicted_rul=pred["predicted_rul"],
                risk_level=pred["risk_level"],
                readiness_score=readiness["readiness_score"],
                readiness_category=readiness["readiness_category"],
                next_mission_date=readiness.get("mission_window_start", "2026-10-31"),
                next_mission_priority="critical"
            )
        )

    return result

@router.get("/assets/{asset_id}", response_model=AssetDetailResponse)
def get_asset_details(asset_id: str, db: Session = Depends(get_db)):
    asset = get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")

    return AssetDetailResponse(
        asset_id=asset.asset_id,
        source_asset_id=asset.source_asset_id,
        asset_type=asset.asset_type,
        mission_criticality=asset.mission_criticality,
        service_age=asset.service_age_months,
        total_operating_hours=asset.total_operating_hours,
        maintenance_count=asset.maintenance_count,
        last_maintenance_cycle=asset.last_maintenance_cycle,
        latest_cycle=asset.latest_cycle,
        operational_setting_1=asset.operational_setting_1,
        operational_setting_2=asset.operational_setting_2,
        operational_setting_3=asset.operational_setting_3,
    )
