from sqlalchemy.orm import Session
from src.backend.app.models.sensor import SensorReading

def get_sensor_readings(db: Session, asset_id: str, recent_cycles: int = 50) -> list[SensorReading]:
    return (
        db.query(SensorReading)
        .filter(SensorReading.asset_id == asset_id)
        .order_by(SensorReading.cycle.desc())
        .limit(recent_cycles)
        .all()
    )
