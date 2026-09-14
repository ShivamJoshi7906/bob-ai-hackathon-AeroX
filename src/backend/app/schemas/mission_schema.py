from pydantic import BaseModel

class MissionWindowSchema(BaseModel):
    mission_id: str
    mission_name: str
    asset_id: str
    asset_type: str = "F-35A Lightning II"
    start_date: str
    end_date: str
    mission_priority: str
    required_cycles: int
    current_rul: float = 18.4
    buffer_margin: float = -11.6
    status: str = "SAFE"
    data_origin: str = "synthetic"

