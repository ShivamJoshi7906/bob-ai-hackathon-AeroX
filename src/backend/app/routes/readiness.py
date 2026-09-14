from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.backend.app.database import get_db
from src.backend.app.schemas.readiness_schema import ReadinessResponse
from src.backend.app.services.readiness_service import evaluate_asset_readiness
from src.backend.app.services.asset_service import get_asset_by_id

router = APIRouter()

@router.get("/assets/{asset_id}/readiness", response_model=ReadinessResponse)
def get_asset_readiness(asset_id: str, db: Session = Depends(get_db)):
    asset = get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")

    res = evaluate_asset_readiness(db, asset_id)
    
    return ReadinessResponse(
        asset_id=res["asset_id"],
        readiness_score=res["readiness_score"],
        readiness_category=res["readiness_category"],
        mission_id=res.get("mission_id"),
        mission_window_start=res.get("mission_window_start"),
        mission_window_end=res.get("mission_window_end"),
        required_readiness_threshold=res["required_readiness_threshold"],
        mission_cycles_required=res["mission_cycles_required"],
        predicted_rul=res["predicted_rul"],
        buffer_cycles=res["buffer_cycles"],
        risk_level=res["risk_level"],
        evidence_reasons=res["evidence_reasons"],
        recommended_action=res["recommended_action"]
    )
