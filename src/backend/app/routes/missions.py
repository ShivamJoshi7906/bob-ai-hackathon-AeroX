from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.backend.app.database import get_db
from src.backend.app.schemas.mission_schema import MissionWindowSchema
from src.backend.app.services.mission_service import get_upcoming_missions
from src.backend.app.services.prediction_service import prediction_service
from src.backend.app.services.asset_service import get_asset_by_id

router = APIRouter()

@router.get("/missions/upcoming", response_model=List[MissionWindowSchema])
def list_missions(db: Session = Depends(get_db)):
    missions = get_upcoming_missions(db)
    result = []
    for m in missions:
        asset = get_asset_by_id(db, m.asset_id)
        asset_type = asset.asset_type if asset else "F-35A Lightning II"
        pred = prediction_service.predict_rul(db, m.asset_id)
        rul = pred["predicted_rul"]
        buffer = round(rul - m.required_cycles, 1)
        
        if buffer < 0:
            status = "MISSION THREAT"
        elif buffer < 15:
            status = "AT RISK"
        else:
            status = "SAFE"

        result.append(
            MissionWindowSchema(
                mission_id=m.mission_id,
                mission_name=m.mission_name,
                asset_id=m.asset_id,
                asset_type=asset_type,
                start_date=m.start_date,
                end_date=m.end_date,
                mission_priority=m.mission_priority.upper(),
                required_cycles=m.required_cycles,
                current_rul=rul,
                buffer_margin=buffer,
                status=status,
                data_origin=m.data_origin
            )
        )
    return result

