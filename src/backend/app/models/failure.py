from sqlalchemy import Column, Integer, String, Float, DateTime
from src.backend.app.database import Base

class FailureEvent(Base):
    __tablename__ = "failure_events"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, index=True)
    cycle = Column(Integer)
    failure_label = Column(Integer, default=1)
    failure_subsystem = Column(String, default="High Pressure Compressor")
