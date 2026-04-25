from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

# Area Schemas
class AreaBase(BaseModel):
    area_name: str = Field(..., max_length=100)
    city: str = Field(..., max_length=100)
    population_density: int = Field(..., ge=0)

class AreaCreate(AreaBase):
    pass

class Area(AreaBase):
    area_id: int
    model_config = ConfigDict(from_attributes=True)

# Crime Schemas
class CrimeBase(BaseModel):
    area_id: int
    crime_type: str = Field(..., max_length=50)
    severity: str = Field(..., pattern="^(High|Medium|Low)$")
    crime_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    crime_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    time_slot: str = Field(..., pattern="^(Day|Evening|Night)$")
    status: str = Field(..., max_length=50)

class CrimeCreate(CrimeBase):
    pass

class Crime(CrimeBase):
    crime_id: int
    model_config = ConfigDict(from_attributes=True)

# Hotspot Schemas
class HotspotBase(BaseModel):
    area_id: int
    hotspot_score: float
    risk_level: str = Field(..., max_length=50)

class HotspotResponse(HotspotBase):
    hotspot_id: int
    last_updated: datetime
    area_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Patrol Unit Schemas
class PatrolUnitBase(BaseModel):
    unit_name: str = Field(..., max_length=100)
    availability_status: str = Field(..., pattern="^(Available|Busy)$")
    current_location: str = Field(..., max_length=200)

class PatrolUnitCreate(PatrolUnitBase):
    pass

class PatrolUnit(PatrolUnitBase):
    patrol_id: int
    model_config = ConfigDict(from_attributes=True)

class PatrolAssignmentBase(BaseModel):
    patrol_id: int
    area_id: int
    assigned_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    priority_level: str = Field(..., pattern="^(High|Medium|Low)$")
    
class PatrolAssignment(PatrolAssignmentBase):
    assignment_id: int
    model_config = ConfigDict(from_attributes=True)
