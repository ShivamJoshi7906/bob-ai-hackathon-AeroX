from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from src.backend.app.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, unique=True, index=True, nullable=False) # e.g. AC-003
    source_asset_id = Column(Integer, nullable=False)                # e.g. 3
    asset_type = Column(String, default="F-35A Lightning II")
    mission_criticality = Column(String, default="high")             # high, medium, low
    service_age_months = Column(Integer, default=24)
    total_operating_hours = Column(Float, default=1200.0)
    maintenance_count = Column(Integer, default=1)
    last_maintenance_cycle = Column(Integer, default=100)
    latest_cycle = Column(Integer, default=150)
    operational_setting_1 = Column(Float, default=0.0008)
    operational_setting_2 = Column(Float, default=0.0005)
    operational_setting_3 = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)
