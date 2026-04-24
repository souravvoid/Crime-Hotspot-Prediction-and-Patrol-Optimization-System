## 2024-04-24 - [N+1 Query Bottleneck in Hotspot Algorithm]
**Learning:** Found a severe N+1 query issue in the `compute_hotspot_scores` function where it iterated over every `Area` and executed separate DB queries for its `Crimes` and `Hotspot`. This scaled terribly (O(N) DB calls) and execution time ballooned to >1.4s with just 1000 areas.
**Action:** Always inspect loops that run database queries. Use SQLAlchemy's `joinedload` (eager loading) to fetch related objects in a single query when the relationship data is definitively needed for calculation.
