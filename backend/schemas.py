from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# Area Schemas
class AreaBase(BaseModel):
    area_name: str
    city: str
    population_density: int

class AreaCreate(AreaBase):
    pass

class Area(AreaBase):
    area_id: int
    model_config = ConfigDict(from_attributes=True)

# Crime Schemas
class CrimeBase(BaseModel):
    area_id: int
    crime_type: str
    severity: str
    crime_date: str
    crime_time: str
    time_slot: str
    status: str

class CrimeCreate(CrimeBase):
    pass

class Crime(CrimeBase):
    crime_id: int
    model_config = ConfigDict(from_attributes=True)

# Hotspot Schemas
class HotspotBase(BaseModel):
    area_id: int
    hotspot_score: float
    risk_level: str

class HotspotResponse(HotspotBase):
    hotspot_id: int
    last_updated: datetime
    area_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Patrol Unit Schemas
class PatrolUnitBase(BaseModel):
    unit_name: str
    availability_status: str
    current_location: str

class PatrolUnitCreate(PatrolUnitBase):
    pass

class PatrolUnit(PatrolUnitBase):
    patrol_id: int
    model_config = ConfigDict(from_attributes=True)

class PatrolAssignmentBase(BaseModel):
    patrol_id: int
    area_id: int
    assigned_date: str
    priority_level: str
    
class PatrolAssignment(PatrolAssignmentBase):
    assignment_id: int
    model_config = ConfigDict(from_attributes=True)
