# Technical Note: Delhi Bus Intelligence & Travel-Time Modeling

## 1. GPS Cleaning & Preprocessing

Urban bus GPS observations contain significant sensor noise, multipath reflection around dense high-rises, clock drift, and occasional network packet duplication. To prevent biased training sets, the cleaning pipeline enforces a 5-step filter:

1. **Geographic Bounding Box**: Records outside the Delhi NCR envelope ($28.30^\circ\text{N} \le \text{lat} \le 28.95^\circ\text{N}$, $76.80^\circ\text{E} \le \text{lng} \le 77.45^\circ\text{E}$) are rejected.
2. **Deduplication**: Observations sharing identical `(vehicle_id, timestamp, round(lat, 5), round(lng, 5))` are pruned.
3. **Velocity Floor and Ceiling**: Segment speeds exceeding $85\text{ km/h}$ ($23.6\text{ m/s}$) are flagged as impossible for Delhi city buses and dropped.
4. **Acceleration Bounds**: Instantaneous acceleration $|a| = |\Delta v / \Delta t| > 3.5\text{ m/s}^2$ is filtered as GPS coordinate jitter.
5. **Teleportation Jump Rejection**: Consecutive points within $\le 60\text{ seconds}$ having distance $> 800\text{ meters}$ without intermediary pings are rejected.

---

## 2. Map Matching Methodology

GPS observations are snapped to actual transit corridors using a Hidden Markov Model (HMM) Viterbi formulation:

### Emission Probability
The probability that GPS measurement $z_t$ was produced by road segment candidate $r_i$:
$$p(z_t | r_i) = \frac{1}{\sqrt{2\pi}\sigma_z} \exp\left(-\frac{d(z_t, r_i)^2}{2\sigma_z^2}\right)$$
where $d(z_t, r_i)$ is the perpendicular great-circle distance from the GPS point to the line segment, and $\sigma_z = 15\text{ meters}$ accounts for typical urban GPS measurement variance.

### Transition Probability
The probability that a vehicle moved from segment candidate $r_i$ at time $t$ to candidate $r_j$ at time $t+1$:
$$p(r_j | r_i) = \frac{1}{\beta} \exp\left(-\frac{|\Delta d_{\text{geodesic}} - \Delta d_{\text{network}}|}{\beta}\right)$$
where $\Delta d_{\text{geodesic}}$ is the Euclidean distance between consecutive GPS observations, $\Delta d_{\text{network}}$ is the shortest path along the corridor between the candidate projection points, and $\beta = 2.0\text{ meters}$ scales the discrepancy penalty.

The most probable sequence of road segments is computed via dynamic programming using the Viterbi algorithm.

---

## 3. Segment Definition

A bus segment is formally defined as a directed, non-overlapping link connecting two consecutive stops along an authorized transit corridor:
$$\text{Segment} = (s_{\text{origin}}, s_{\text{destination}}, \text{route\_id})$$
* **Distance ($d_{\text{seg}}$)**: Computed using the Haversine equation over coordinate pairs in kilometers.
* **Target Variable**: $\text{observed\_segment\_time\_seconds}$, representing total elapsed time from departing $s_{\text{origin}}$ until arriving at $s_{\text{destination}}$, including intersection traffic light delays and boarding dwell times.

---

## 4. Feature Engineering

To capture non-linear diurnal cycles without discontinuity across midnight or week boundaries, cyclical trigonometric encodings are derived:

$$\text{hour\_sin} = \sin\left(\frac{2\pi \cdot t_{\text{hour}}}{24}\right), \quad \text{hour\_cos} = \cos\left(\frac{2\pi \cdot t_{\text{hour}}}{24}\right)$$
$$\text{day\_sin} = \sin\left(\frac{2\pi \cdot t_{\text{day}}}{7}\right), \quad \text{day\_cos} = \cos\left(\frac{2\pi \cdot t_{\text{day}}}{7}\right)$$

Additional engineered features:
* `is_morning_peak`: Binary flag for 08:00 to 11:00 weekday rush hours.
* `is_evening_peak`: Binary flag for 17:00 to 20:30 weekday rush hours.
* `is_weekend`: Binary flag for Saturday and Sunday traffic patterns.
* `scheduled_travel_time_seconds`: Baseline scheduled traversal time based on timetable speeds.
* `segment_distance_km`: Physical path distance.

---

## 5. Machine Learning Model & Training

### Architecture
We implement an **XGBoost Regressor** with squared error loss:
$$\mathcal{L} = \sum_{i=1}^N (y_i - \hat{y}_i)^2 + \sum_{k=1}^K \Omega(f_k)$$
where $\Omega(f) = \gamma T + \frac{1}{2}\lambda \sum_{j=1}^T w_j^2$ regularizes tree complexity.

### Chronological Train-Val-Test Split
To prevent temporal data leakage, observations are partitioned strictly by date:
* **Training Set**: October 1 to October 10, 2026 (21,930 observations, 71.4%)
* **Validation Set**: October 11 to October 12, 2026 (4,386 observations, 14.3%)
* **Test Set**: October 13 to October 14, 2026 (4,386 observations, 14.3%)

### Non-Negativity Physical Bounds
Predictions are bounded by a physical floor ensuring no predicted bus travels faster than $75\text{ km/h}$:
$$\hat{t}_{\text{bounded}} = \max\left(\hat{t}_{\text{pred}}, \frac{d_{\text{km}}}{75.0} \times 3600 + 20.0\right)$$

---

## 6. Multi-Tiered Fallback Hierarchy

If live inference encounters missing feature data or unindexed corridors, the system systematically cascades through a 4-tier fallback ladder:

1. **Tier 1 - XGBoost Regressor**: Used when full feature vectors and segment identities exist.
2. **Tier 2 - Time-of-Day Baseline**: Hourly historical median for the specific segment ($s_{\text{id}}, \text{hour}$).
3. **Tier 3 - Segment Historical Median**: Overall historical median for the segment across all hours.
4. **Tier 4 - Global Conservative Speed Fallback**: Assumes average Delhi bus operating speed of $18.0\text{ km/h}$ plus $45\text{ seconds}$ dwell time:
$$t_{\text{fallback}} = \left(\frac{d_{\text{km}}}{18.0} \times 3600\right) + 45.0$$

The active tier is recorded in the API response under `data_source` and `fallback_applied`.

---

## 7. Structured Transit Graph & Time-Dependent Dijkstra

### Graph Representation
The transit network is modeled as a directed multi-graph:
* **Nodes ($V$)**: 25 core interchange hubs and 7,552 catalog stops.
* **Edges ($E$)**: Valid stop-to-stop links parameterized with route identity, distance, and scheduled duration.

### Time-Dependent Edge Weight Evaluation
Unlike static routing algorithms where edge costs are constant, transit edge weights are functions of arrival time $t_{\text{arr}}$:
$$c(e, t_{\text{arr}}) = f_{\text{ML}}(\text{segment}(e), t_{\text{arr}}) + c_{\text{transfer}}$$

When exploring an outgoing edge from stop $u$ to stop $v$:
1. Determine passenger arrival time $t_{\text{arr}}$ at stop $u$.
2. Check if a route transfer occurs ($\text{route}_{\text{prev}} \ne \text{route}_{\text{edge}}$).
3. If transferring, add a transfer waiting buffer ($180\text{ seconds}$) and increment transfer count.
4. Query the ML model with $t_{\text{arr}}$ to compute predicted segment traversal time $\Delta t$.
5. Arrival time at stop $v$ is $t_{\text{arr}} + \Delta t$.
6. Push to min-priority heap with entry tie-breaker counter to maintain $O((V+E)\log V)$ complexity.

---

## 8. Walking Integration & Alternatives

* **Spatial Queries**: Walking origins and destinations are resolved to nearby stops within $1,200\text{ meters}$ via a SciPy `KDTree`.
* **Street Curvature Factor**: A $1.25\times$ multiplier is applied to Haversine Euclidean distance to approximate real-world Delhi street network walking paths.
* **Walking Speed**: Standard commuter pace of $4.5\text{ km/h}$ ($1.25\text{ m/s}$).
* **Pareto Ranking**: The engine returns 3 distinct options: Fastest Journey, Fewest Transfers, and Alternative Route.
