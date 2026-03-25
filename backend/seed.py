import random
from datetime import datetime, timedelta
from database import SessionLocal
import models
from algorithms import compute_hotspot_scores
from database import engine

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if we already have areas
    if db.query(models.Area).count() > 0:
        print("Database already seeded.")
        return
        
    # Create Areas
    areas_data = [
        {"area_id": 1, "area_name": "Downtown", "city": "Metroville", "population_density": 15000},
        {"area_id": 2, "area_name": "Northside", "city": "Metroville", "population_density": 8000},
        {"area_id": 3, "area_name": "East End", "city": "Metroville", "population_density": 12000},
        {"area_id": 4, "area_name": "Westville", "city": "Metroville", "population_density": 5000},
        {"area_id": 5, "area_name": "South Park", "city": "Metroville", "population_density": 7000},
        {"area_id": 6, "area_name": "Uptown", "city": "Metroville", "population_density": 9500},
        {"area_id": 7, "area_name": "Industrial District", "city": "Metroville", "population_density": 2000}
    ]
    for ad in areas_data:
        db.add(models.Area(**ad))
        
    # Create Connections (Edges)
    connections = [
        (1, 2), (1, 3), (1, 4), (1, 6),
        (3, 5), (3, 7), (4, 5), (5, 7)
    ]
    for c1, c2 in connections:
        db.add(models.AreaConnection(area_id_1=c1, area_id_2=c2))
        
    # Create Crimes
    crime_types = ["Robbery", "Theft", "Assault", "Vandalism", "Burglary", "Pickpocketing"]
    severities = ["High", "Medium", "Low"]
    time_slots = ["Day", "Evening", "Night"]
    
    today = datetime.now()
    
    # Load heavily into Downtown(1) and East End(3)
    for _ in range(25):
        ctype = random.choice(crime_types)
        sev = random.choices(severities, weights=[50, 30, 20])[0] # more high
        ts = random.choices(time_slots, weights=[20, 30, 50])[0] # more night
        date_str = (today - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d")
        
        db.add(models.Crime(
            area_id=1, crime_type=ctype, severity=sev, 
            crime_date=date_str, crime_time="23:30", time_slot=ts, status="Open"
        ))
        
    for _ in range(18):
        ctype = random.choice(crime_types)
        sev = random.choices(severities, weights=[40, 40, 20])[0] 
        ts = random.choices(time_slots, weights=[30, 30, 40])[0]
        date_str = (today - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d")
        
        db.add(models.Crime(
            area_id=3, crime_type=ctype, severity=sev, 
            crime_date=date_str, crime_time="21:15", time_slot=ts, status="Open"
        ))
        
    # Sparse random for others
    for area_id in [2, 4, 5, 6, 7]:
        for _ in range(random.randint(2, 6)):
            ctype = random.choice(crime_types)
            sev = random.choice(severities) 
            ts = random.choice(time_slots)
            date_str = (today - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d")
            
            db.add(models.Crime(
                area_id=area_id, crime_type=ctype, severity=sev, 
                crime_date=date_str, crime_time="12:00", time_slot=ts, status="Open"
            ))
            
    # Create Patrol Units
    patrols_data = [
        {"unit_name": "Alpha-1", "availability_status": "Available", "current_location": "HQ"},
        {"unit_name": "Bravo-2", "availability_status": "Available", "current_location": "HQ"},
        {"unit_name": "Charlie-3", "availability_status": "Available", "current_location": "HQ"},
        {"unit_name": "Delta-4", "availability_status": "Available", "current_location": "HQ"}
    ]
    for pd in patrols_data:
        db.add(models.PatrolUnit(**pd))
        
    db.commit()
    
    # Compute initial hotspots
    compute_hotspot_scores(db)
    print("Database seeded and hotspots computed.")

if __name__ == "__main__":
    seed()
