from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import csv
import io

import models, schemas, algorithms
from database import engine, get_db

# Create all DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crime Hotspot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[url.strip() for url in os.getenv("FRONTEND_URLS", "http://localhost:5173,http://127.0.0.1:5173").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======= ROUTES FOR AREA =======
@app.post("/areas", response_model=schemas.Area)
def create_area(area: schemas.AreaCreate, db: Session = Depends(get_db)):
    db_area = models.Area(**area.model_dump())
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area

@app.get("/areas", response_model=List[schemas.Area])
def read_areas(db: Session = Depends(get_db)):
    return db.query(models.Area).all()

@app.get("/areas/{area_id}", response_model=schemas.Area)
def read_area(area_id: int, db: Session = Depends(get_db)):
    area = db.query(models.Area).filter(models.Area.area_id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return area

# ======= ROUTES FOR CRIMES =======
@app.post("/crimes", response_model=schemas.Crime)
def create_crime(crime: schemas.CrimeCreate, db: Session = Depends(get_db)):
    db_crime = models.Crime(**crime.model_dump())
    db.add(db_crime)
    db.commit()
    db.refresh(db_crime)
    return db_crime

@app.get("/crimes", response_model=List[schemas.Crime])
def read_crimes(db: Session = Depends(get_db)):
    return db.query(models.Crime).all()

@app.get("/crimes/{crime_id}", response_model=schemas.Crime)
def read_crime(crime_id: int, db: Session = Depends(get_db)):
    crime = db.query(models.Crime).filter(models.Crime.crime_id == crime_id).first()
    if not crime:
        raise HTTPException(status_code=404, detail="Crime not found")
    return crime

@app.delete("/crimes/{crime_id}")
def delete_crime(crime_id: int, db: Session = Depends(get_db)):
    crime = db.query(models.Crime).filter(models.Crime.crime_id == crime_id).first()
    if not crime:
        raise HTTPException(status_code=404, detail="Crime not found")
    db.delete(crime)
    db.commit()
    return {"detail": "Crime deleted successfully"}

# ======= ROUTES FOR HOTSPOTS =======
@app.post("/hotspots/compute")
def compute_hotspots(db: Session = Depends(get_db)):
    algorithms.compute_hotspot_scores(db)
    return {"detail": "Hotspot scores updated"}

@app.get("/hotspots", response_model=List[schemas.HotspotResponse])
def get_hotspots(db: Session = Depends(get_db)):
    hotspots = db.query(models.Hotspot).order_by(models.Hotspot.hotspot_score.desc()).all()
    # Need to inject area name for response model
    result = []
    for h in hotspots:
        area_name = h.area.area_name if h.area else None
        h_dict = {
            "hotspot_id": h.hotspot_id,
            "area_id": h.area_id,
            "hotspot_score": h.hotspot_score,
            "risk_level": h.risk_level,
            "last_updated": h.last_updated,
            "area_name": area_name
        }
        result.append(h_dict)
    return result

@app.get("/hotspots/{area_id}")
def get_hotspot_neighbors(area_id: int, depth: int = 1, db: Session = Depends(get_db)):
    # Uses BFS algorithms to cluster zones
    clusters = algorithms.bfs_clustering(db, start_area_id=area_id, depth=depth)
    return {"neighbors": clusters}

# ======= ROUTES FOR PATROLS =======
@app.post("/patrol-units", response_model=schemas.PatrolUnit)
def create_patrol_unit(unit: schemas.PatrolUnitCreate, db: Session = Depends(get_db)):
    db_unit = models.PatrolUnit(**unit.model_dump())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

@app.get("/patrol-units", response_model=List[schemas.PatrolUnit])
def get_patrol_units(db: Session = Depends(get_db)):
    return db.query(models.PatrolUnit).all()

@app.post("/patrol/assign")
def assign_patrols(db: Session = Depends(get_db)):
    # Uses Greedy assignment algorithm
    assignments = algorithms.greedy_patrol_assignment(db)
    return {"detail": "Assignments created via Greedy Optimization", "assignments": assignments}

@app.get("/patrol/assignments", response_model=List[schemas.PatrolAssignment])
def get_patrol_assignments(db: Session = Depends(get_db)):
    return db.query(models.PatrolAssignment).all()
