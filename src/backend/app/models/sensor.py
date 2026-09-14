from sqlalchemy import Column, Integer, String, Float, ForeignKey
from src.backend.app.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.asset_id"), index=True, nullable=False)
    cycle = Column(Integer, index=True, nullable=False)

    s2 = Column(Float, nullable=True)  # HPC Outlet Temp (K)
    s3 = Column(Float, nullable=True)  # Combustor Outlet Temp (K)
    s4 = Column(Float, nullable=True)  # LPT Outlet Temp (K)
    s7 = Column(Float, nullable=True)  # HPC Pressure (psia)
    s8 = Column(Float, nullable=True)  # Fan Speed (rpm)
    s9 = Column(Float, nullable=True)  # Core Speed (rpm)
    s11 = Column(Float, nullable=True) # Static Pressure (psia)
    s12 = Column(Float, nullable=True) # Fuel Ratio
    s14 = Column(Float, nullable=True) # Bypass Ratio
    s15 = Column(Float, nullable=True) # Bleed Enthalpy
    s17 = Column(Float, nullable=True) # HP Turbine Speed
    s20 = Column(Float, nullable=True) # HPT Coolant (lbf)
    s21 = Column(Float, nullable=True) # LPT Coolant (lbf)
