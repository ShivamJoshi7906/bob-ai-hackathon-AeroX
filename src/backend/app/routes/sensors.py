from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.backend.app.database import get_db
from src.backend.app.schemas.sensor_schema import SensorHistoryResponse, SensorReadingSchema
from src.backend.app.services.sensor_service import get_sensor_readings
from src.backend.app.services.asset_service import get_asset_by_id

router = APIRouter()

@router.get("/assets/{asset_id}/sensors", response_model=SensorHistoryResponse)
def get_asset_sensors(
    asset_id: str,
    recent_cycles: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    asset = get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")

    readings = get_sensor_readings(db, asset_id, recent_cycles)
    
    schema_readings = [
        SensorReadingSchema(
            cycle=r.cycle,
            s2=r.s2,
            s3=r.s3,
            s4=r.s4,
            s7=r.s7,
            s8=r.s8,
            s9=r.s9,
            s11=r.s11,
            s12=r.s12,
            s14=r.s14,
            s15=r.s15,
            s17=r.s17,
            s20=r.s20,
            s21=r.s21,
        )
        for r in reversed(readings)
    ]

    return SensorHistoryResponse(
        asset_id=asset_id,
        cycles_count=len(schema_readings),
        readings=schema_readings
    )
