from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.backend.app.database import get_db
from src.backend.app.schemas.mission_schema import MissionWindowSchema
from src.backend.app.services.mission_service import get_upcoming_missions

router = APIRouter()

@router.get("/missions/upcoming", response_model=List[MissionWindowSchema])
def list_missions(db: Session = Depends(get_db)):
    missions = get_upcoming_missions(db)
    return [
        MissionWindowSchema(
            mission_id=m.mission_id,
            mission_name=m.mission_name,
            asset_id=m.asset_id,
            start_date=m.start_date,
            end_date=m.end_date,
            mission_priority=m.mission_priority,
            required_cycles=m.required_cycles,
            data_origin=m.data_origin
        )
        for m in missions
    ]
