# Crime Hotspot Prediction and Patrol Optimization System

## Overview
This full-stack application utilizes a deterministic rule-based formula to compute historical crime hotspot risk levels. It leverages Design and Analysis of Algorithms (DAA) concepts—specifically Breadth-First Search (BFS) and Greedy Optimization—to trace crime spill-over vulnerabilities across geographic nodes, and programmatically allocate limited patrol units to maximum-risk zones.

## Technology Stack
- **Frontend Engine**: React 18, Vite, Chart.js, Vanilla CSS Glassmorphism Styles.
- **Backend API**: Python 3, FastAPI, Uvicorn.
- **Database Architecture**: SQLite, mapped via SQLAlchemy (100% MySQL/PostgreSQL schema compatible).

## DAA Applications (Algorithms Used)

### 1. Deterministic Hotspot Risk Evaluation
`Score = (Frequency × 0.5) + (Severity Weight × 0.3) + (Night Crime Factor × 0.2)`
Nodes are dynamically tagged as (`High Risk` | `Moderate Risk` | `Low Risk`) depending on the rolling mathematical output of this calculation against the underlying SQL dataset.

### 2. Breadth-First Search (BFS) Topological Scanning
City districts are represented as an undirected graph, connected via the `area_connections` relation table. When an area escalates into a high-risk zone, the API iteratively expands a BFS traversal queue to alert neighboring areas of collateral risk vectors based on a bounding radius constraint.

### 3. Greedy Resource Dispatch Engine
To solve the patrol mapping constraint, the assignment engine filters the available `PatrolUnits`, sorts the `Hotspots` array descending strictly by `Risk Score` (the locally optimal greedy choice), and maps units iteratively down the chain until resources or high-risk targets are exhausted. 

## Entity-Relationship (ER) Schema Overview
- **`Area`**: Central geographic node tracking localized metrics (id, name, population).
- **`AreaConnection`**: Joint associative table explicitly defining contiguous borders between Area nodes.
- **`Crime`**: The primary data ledger storing `crime_type`, `severity`, `time_slot`, linked to their hosting `Area`.
- **`Hotspot`**: Derived scoring table caching the mathematical output representing the local algorithmic urgency per area.
- **`PatrolUnit`**: Tracked responder entities checking `availability_status`.
- **`PatrolAssignment`**: Generated intersection join mapping a `PatrolUnit` dynamically to an `Area` under a formulated `priority_level`.

---

## Operating Instructions

### Start the FastAPI Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py # Populates the mock DAA database (only run once)
uvicorn main:app --reload --port 8000
```

### Start the React Frontend
```bash
cd frontend
npm install
npm run dev # Access UI via http://localhost:5173
```
