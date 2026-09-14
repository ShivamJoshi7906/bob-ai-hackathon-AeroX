from sqlalchemy import Column, Integer, String, Float, DateTime
from src.backend.app.database import Base

class MissionWindow(Base):
    __tablename__ = "mission_windows"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(String, unique=True, index=True)
    mission_name = Column(String)
    asset_id = Column(String, index=True)
    start_date = Column(String)
    end_date = Column(String)
    mission_priority = Column(String, default="critical") # critical, high, routine
    required_cycles = Column(Integer, default=30)
    data_origin = Column(String, default="synthetic")
