from sqlalchemy.orm import Session
from src.backend.app.models.mission import MissionWindow

def get_upcoming_missions(db: Session) -> list[MissionWindow]:
    return db.query(MissionWindow).all()
