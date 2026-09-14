from pydantic import BaseModel

class MissionWindowSchema(BaseModel):
    mission_id: str
    mission_name: str
    asset_id: str
    start_date: str
    end_date: str
    mission_priority: str
    required_cycles: int
    data_origin: str = "synthetic"
