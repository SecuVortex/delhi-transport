# Delhi Bus Intelligence & Time-Dependent Journey Planner: System Architecture

## 1. System Overview

Delhi Bus Intelligence is an end-to-end transportation intelligence platform designed for the Delhi Transport Stack Hackathon 2026. The system uses historical bus GPS trajectory data to learn real-world travel times across urban road segments and computes accurate, time-dependent, transfer-aware bus itineraries using a Dijkstra shortest-path algorithm.

```
+-----------------------------------------------------------------------------------+
|                                  DATA PIPELINE                                    |
|                                                                                   |
|  Raw GPS Streams   -->   GPS Cleaning   -->  Route Map Matching  --> Trajectories |
|  (Oct 2026 DTC)          (Bounds/Jumps)      (HMM Viterbi)          (Stop-to-Stop)|
|                                                                          |        |
|                                                                          v        |
|  Prediction Store  <--  XGBoost Regressor  <--  Feature Pipeline  <-- Segments    |
|  (JSON Models)          (Non-Negative)          (Cyclical Sin/Cos)                |
+-----------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                             ROUTING & GRAPH ENGINE                                |
|                                                                                   |
|  GTFS Catalog     -->  Transit Multi-Graph   --> Dynamic Edge Weights             |
|  (Stops/Routes)        (Adjacency Lists)         (Queried at Simulated Arrival)   |
|                                                          |                        |
|                                                          v                        |
|  Pareto Options   <--  Multi-Modal Ranking   <-- Time-Dependent Dijkstra          |
|  (Fast/Few/Walk)       (Walking Integration)     (Min-Priority Heap)              |
+-----------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                             FASTAPI BACKEND & REST API                            |
|                                                                                   |
|  /api/v1/journeys  |  /api/v1/stops/nearby  |  /api/v1/routes  |  /api/v1/health  |
|  /api/v1/model/metrics  |  /api/v1/data-status  |  /api/v1/segments/...           |
+-----------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                 REACT 18 FRONTEND                                 |
|                                                                                   |
|  Interactive Leaflet Map (Delhi NCR) | Timelines | Transfers | Confidence Pills   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Modules and Responsibilities

### 2.1 Data Processing & Ingestion (`backend/app/algorithms/` & `backend/app/data/`)
* **`gps_cleaning.py`**:
  * Geospatial boundary filtering within Delhi NCR (Lat: 28.30 to 28.95, Lng: 76.80 to 77.45).
  * Duplicate removal based on vehicle ID, timestamp, and coordinates.
  * Impossible velocity filter ($> 85\text{ km/h}$) and acceleration filter ($> 3.5\text{ m/s}^2$).
  * Teleportation jump detector ($> 800\text{ m}$ in $\le 60\text{ s}$).
  * Trajectory grouping and chronological sorting per vehicle.
* **`map_matching.py`**:
  * Route-constrained candidate segment projection.
  * Hidden Markov Model (HMM) Viterbi decoding with Gaussian emission probability and path discrepancy transition probability.
* **`gtfs_loader.py`**:
  * Loads stops, routes, stop sequences, and stop-to-stop segment distances.
* **`gps_loader.py`**:
  * Historical segment traversal generator capturing diurnal congestion patterns across October 2026.

### 2.2 Machine Learning Travel-Time Model (`backend/app/ml/`)
* **`feature_engineering.py`**:
  * Cyclical time features: $\sin(2\pi \cdot \text{hour}/24)$, $\cos(2\pi \cdot \text{hour}/24)$, $\sin(2\pi \cdot \text{weekday}/7)$, $\cos(2\pi \cdot \text{weekday}/7)$.
  * Temporal regime flags: `morning_peak` (08:00 to 11:00), `evening_peak` (17:00 to 20:30), `night_period` (21:00 to 05:00).
  * Segment properties: `segment_distance_km`, `scheduled_travel_time_seconds`.
* **`train.py`**:
  * Strict chronological train-val-test split: Days 1 to 10 Train (21,930 observations), Days 11 to 12 Val (4,386 observations), Days 13 to 14 Test (4,386 observations).
  * Evaluates Historical Median, Time-of-Day baseline, Random Forest, and XGBoost regressor.
* **`predict.py`**:
  * Inference interface with non-negativity physical floor and 4-tier fallback hierarchy.
* **`evaluation.py`**:
  * MAE, RMSE, and MAPE calculations.

### 2.3 Graph Construction & Dijkstra Router (`backend/app/algorithms/` & `backend/app/services/`)
* **`graph.py`**:
  * Multi-route directed adjacency graph indexing bus stops as vertices and valid route connections as edges.
* **`dijkstra.py`**:
  * Time-dependent shortest-path algorithm using a min-heap priority queue ($O((V+E)\log V)$).
  * Dynamically evaluates edge traversal time using the ML model based on simulated passenger arrival time at that segment.
  * Enforces transfer penalties and configurable maximum transfers (`max_transfers = 2`).
* **`spatial_index.py`**:
  * SciPy KDTree spatial index over Delhi stop coordinates for $O(\log N)$ radius queries.
  * Haversine walking calculation with a $1.25\times$ street network curvature factor.
* **`journey_planner.py`**:
  * Multi-modal orchestrator exploring candidate boarding and destination stops, generating walking legs, transit legs, transfer nodes, and confidence scores.

### 2.4 REST API Layer (`backend/app/api/`)
* Built with FastAPI, Pydantic schemas, and CORS middleware.
* Complete OpenAPI schema exposed at `/docs` and `/redoc`.

---

## 3. Data Structures & Algorithmic Complexity

| Module | Data Structure | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| Nearest Stop Spatial Query | SciPy `KDTree` | $O(\log N)$ | $O(N)$ |
| Public Transit Network | Directed Adjacency List | $O(V + E)$ lookup | $O(V + E)$ |
| Time-Dependent Route Search | Min-Heap Priority Queue | $O((V + E) \log V)$ | $O(V + E)$ |
| XGBoost Model Inference | Gradient Boosted Trees | $O(T \cdot D)$ ($T$ trees, depth $D$) | $O(T \cdot 2^D)$ |
| HMM Map Matching | Viterbi Trellis Table | $O(K \cdot S^2)$ ($K$ points, $S$ segments) | $O(K \cdot S)$ |
