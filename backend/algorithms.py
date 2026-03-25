from sqlalchemy.orm import Session
import models
from collections import deque
from datetime import datetime

def compute_hotspot_scores(db: Session):
    areas = db.query(models.Area).all()
    
    for area in areas:
        crimes = db.query(models.Crime).filter(models.Crime.area_id == area.area_id).all()
        
        freq = len(crimes)
        
        severity_score = 0
        night_crimes = 0
        
        for c in crimes:
            if c.severity == "High":
                severity_score += 3
            elif c.severity == "Medium":
                severity_score += 2
            elif c.severity == "Low":
                severity_score += 1
                
            if c.time_slot == "Night":
                night_crimes += 1
                
        # Algorithm Rule-based Scoring Formula
        score = (freq * 0.5) + (severity_score * 0.3) + (night_crimes * 0.2)
        
        risk_level = "Low Risk"
        if score >= 8:
            risk_level = "High Risk"
        elif score >= 5:
            risk_level = "Moderate Risk"
            
        hotspot = db.query(models.Hotspot).filter(models.Hotspot.area_id == area.area_id).first()
        if hotspot:
            hotspot.hotspot_score = score
            hotspot.risk_level = risk_level
            hotspot.last_updated = datetime.utcnow()
        else:
            new_hotspot = models.Hotspot(
                area_id=area.area_id,
                hotspot_score=score,
                risk_level=risk_level
            )
            db.add(new_hotspot)
            
    db.commit()

def bfs_clustering(db: Session, start_area_id: int, depth: int = 1):
    edges = db.query(models.AreaConnection).all()
    graph = {}
    for edge in edges:
        # Undirected graph logic
        if edge.area_id_1 not in graph: graph[edge.area_id_1] = []
        if edge.area_id_2 not in graph: graph[edge.area_id_2] = []
        graph[edge.area_id_1].append(edge.area_id_2)
        graph[edge.area_id_2].append(edge.area_id_1)
        
    visited = set([start_area_id])
    queue = deque([(start_area_id, 0)])
    neighbors = []
    
    while queue:
        current, current_depth = queue.popleft()
        if current_depth > 0:
             neighbors.append({"area_id": current, "distance": current_depth})
             
        if current_depth < depth:
            for neighbor in graph.get(current, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, current_depth + 1))
                    
    # Map back to area models
    result = []
    for n in neighbors:
         area = db.query(models.Area).filter(models.Area.area_id == n["area_id"]).first()
         if area:
             result.append({
                 "area_id": area.area_id,
                 "area_name": area.area_name,
                 "distance": n["distance"]
             })
    return result

def greedy_patrol_assignment(db: Session):
    # Clear existing assignments for fresh run
    db.query(models.PatrolAssignment).delete()
    
    # 1. Sort Hotspots by Highest Score (Greedy Priority)
    hotspots = db.query(models.Hotspot).order_by(models.Hotspot.hotspot_score.desc()).all()
    
    # 2. Get Available Patrol Units
    units = db.query(models.PatrolUnit).filter(models.PatrolUnit.availability_status == "Available").all()
    
    assignments = []
    unit_idx = 0
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    for hotspot in hotspots:
        if hotspot.hotspot_score < 1:
            continue # Don't patrol fundamentally safe zones if short staffed
            
        if unit_idx < len(units):
            unit = units[unit_idx]
            
            # Map risk level to priority
            priority = "High" if hotspot.risk_level == "High Risk" else ("Medium" if hotspot.risk_level == "Moderate Risk" else "Low")
            
            assignment = models.PatrolAssignment(
                patrol_id=unit.patrol_id,
                area_id=hotspot.area_id,
                assigned_date=today_str,
                priority_level=priority
            )
            db.add(assignment)
            
            # For JSON serialization
            area_name_val = "Unknown"
            area = db.query(models.Area).filter(models.Area.area_id == hotspot.area_id).first()
            if area:
                area_name_val = area.area_name

            assignments.append({
                "patrol_name": unit.unit_name,
                "area_name": area_name_val,
                "area_id": hotspot.area_id,
                "priority_level": priority
            })
            
            unit_idx += 1
        else:
            break
            
    db.commit()
    return assignments
