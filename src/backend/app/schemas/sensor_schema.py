from pydantic import BaseModel
from typing import List, Optional

class SensorReadingSchema(BaseModel):
    cycle: int
    s2: Optional[float] = None
    s3: Optional[float] = None
    s4: Optional[float] = None
    s7: Optional[float] = None
    s8: Optional[float] = None
    s9: Optional[float] = None
    s11: Optional[float] = None
    s12: Optional[float] = None
    s14: Optional[float] = None
    s15: Optional[float] = None
    s17: Optional[float] = None
    s20: Optional[float] = None
    s21: Optional[float] = None

class SensorHistoryResponse(BaseModel):
    asset_id: str
    cycles_count: int
    readings: List[SensorReadingSchema]
