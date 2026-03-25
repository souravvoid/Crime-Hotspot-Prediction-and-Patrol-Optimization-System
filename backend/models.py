from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Area(Base):
    __tablename__ = "areas"
    
    area_id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String, index=True)
    city = Column(String)
    population_density = Column(Integer)
    
    crimes = relationship("Crime", back_populates="area", cascade="all, delete-orphan")
    hotspot = relationship("Hotspot", back_populates="area", uselist=False, cascade="all, delete-orphan")

class AreaConnection(Base):
    __tablename__ = "area_connections"
    area_id_1 = Column(Integer, ForeignKey("areas.area_id"), primary_key=True)
    area_id_2 = Column(Integer, ForeignKey("areas.area_id"), primary_key=True)

class Crime(Base):
    __tablename__ = "crimes"
    
    crime_id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.area_id"))
    crime_type = Column(String, index=True)
    severity = Column(String) # High, Medium, Low
    crime_date = Column(String) # YYYY-MM-DD
    crime_time = Column(String) # HH:MM
    time_slot = Column(String) # Day, Evening, Night
    status = Column(String) # Open, Closed
    
    area = relationship("Area", back_populates="crimes")

class Hotspot(Base):
    __tablename__ = "hotspots"
    
    hotspot_id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.area_id"))
    hotspot_score = Column(Float)
    risk_level = Column(String) # High Risk, Moderate Risk, Low Risk
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    area = relationship("Area", back_populates="hotspot")

class PatrolUnit(Base):
    __tablename__ = "patrol_units"
    
    patrol_id = Column(Integer, primary_key=True, index=True)
    unit_name = Column(String, index=True)
    availability_status = Column(String) # Available, Busy
    current_location = Column(String)

class PatrolAssignment(Base):
    __tablename__ = "patrol_assignments"
    
    assignment_id = Column(Integer, primary_key=True, index=True)
    patrol_id = Column(Integer, ForeignKey("patrol_units.patrol_id"))
    area_id = Column(Integer, ForeignKey("areas.area_id"))
    assigned_date = Column(String)
    priority_level = Column(String)
