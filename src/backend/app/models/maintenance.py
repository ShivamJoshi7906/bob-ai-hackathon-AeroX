from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from src.backend.app.database import Base

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String, unique=True, index=True)
    asset_id = Column(String, index=True)
    priority = Column(String, default="P1")             # P1, P2, P3
    priority_label = Column(String, default="CRITICAL") # CRITICAL, URGENT, SCHEDULED
    relevant_component = Column(String)
    action_type = Column(String)
    action_taken = Column(String)
    synthetic_asset_linkage = Column(Boolean, default=True)
    synthetic_linkage_note = Column(String, default="Derived from public aircraft maintenance knowledge base")
    created_at = Column(DateTime, default=datetime.utcnow)
