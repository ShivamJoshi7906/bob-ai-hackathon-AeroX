from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.backend.app.database import get_db
from src.backend.app.schemas.prediction_schema import PredictionResponse
from src.backend.app.services.prediction_service import prediction_service
from src.backend.app.services.asset_service import get_asset_by_id

router = APIRouter()

@router.get("/assets/{asset_id}/prediction", response_model=PredictionResponse)
def get_prediction(asset_id: str, db: Session = Depends(get_db)):
    asset = get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")

    pred = prediction_service.predict_rul(db, asset_id)
    
    return PredictionResponse(
        asset_id=pred["asset_id"],
        current_cycle=pred["current_cycle"],
        predicted_rul=pred["predicted_rul"],
        confidence_interval=pred["confidence_interval"],
        failure_within_30_prob=pred["failure_within_30_prob"],
        degradation_stage=pred["degradation_stage"],
        dominant_sensors=pred["dominant_sensors"]
    )
