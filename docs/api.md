# Delhi Bus Intelligence: REST API Documentation

Base URL: `http://localhost:8000` (or `http://192.168.0.103:8000`)
Interactive Swagger UI: `http://localhost:8000/docs`
ReDoc: `http://localhost:8000/redoc`

---

## 1. Journey Planning

### `GET /api/v1/journeys`
Calculates multimodal time-dependent journey itineraries with walking legs, bus legs, transfer points, and segment-level travel-time predictions.

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `origin` | string | Yes | - | Origin stop name or comma-separated `lat,lng` |
| `destination` | string | Yes | - | Destination stop name or comma-separated `lat,lng` |
| `departure_datetime` | string | No | `18:00` | ISO format timestamp or `HH:MM` time string |
| `max_transfers` | integer | No | `2` | Maximum route transfers allowed (0 to 4) |
| `preference` | string | No | `fastest` | Ranking criteria: `fastest`, `fewest_transfers`, `min_walking` |

#### Sample Request:
```bash
curl -X GET "http://localhost:8000/api/v1/journeys?origin=Anand%20Vihar&destination=Connaught%20Place&departure_datetime=18:00&preference=fastest"
```

#### Sample Response:
```json
{
  "query_origin": "Anand Vihar",
  "query_destination": "Connaught Place",
  "departure_datetime": "2026-11-23T18:00:00",
  "options": [
    {
      "journey_id": "journey_opt_1",
      "rank": 1,
      "preference_category": "fastest",
      "total_duration_seconds": 2185.4,
      "total_duration_minutes": 36.4,
      "departure_time": "18:00",
      "estimated_arrival_time": "18:36",
      "walking_duration_seconds": 0.0,
      "bus_duration_seconds": 2185.4,
      "waiting_duration_seconds": 0.0,
      "transfers_count": 0,
      "confidence_score": 0.95,
      "confidence_level": "HIGH",
      "data_grounding": "xgboost_time_dependent_model",
      "legs": [
        {
          "leg_type": "transit",
          "instruction": "Board Line 101 - East-Central Radial from Anand Vihar ISBT to Connaught Place (Regal / Palika)",
          "route_id": "R-101",
          "route_name": "Line 101 - East-Central Radial",
          "from_stop_id": "ST-AV01",
          "from_stop_name": "Anand Vihar ISBT",
          "to_stop_id": "ST-CP01",
          "to_stop_name": "Connaught Place (Regal / Palika)",
          "duration_seconds": 2185.4,
          "distance_meters": 13420.0,
          "departure_time": "18:00",
          "arrival_time": "18:36",
          "intermediate_stops": [
            "Mother Dairy Patparganj",
            "Nirman Vihar Metro Station",
            "Shakarpur Crossing (Vikas Marg)",
            "ITO Delhi Gate",
            "Mandi House Roundabout"
          ],
          "segments": [
            {
              "segment_id": "R-101_ST-AV01_ST-MD01",
              "route_id": "R-101",
              "from_stop_id": "ST-AV01",
              "from_stop_name": "Anand Vihar ISBT",
              "to_stop_id": "ST-MD01",
              "to_stop_name": "Mother Dairy Patparganj",
              "segment_distance_km": 2.85,
              "predicted_travel_time_seconds": 462.3,
              "historical_median_seconds": 450.0,
              "scheduled_travel_time_seconds": 511.0,
              "prediction_confidence": "HIGH",
              "data_source": "xgboost_ml",
              "fallback_applied": false
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "algorithm": "Time-Dependent Dijkstra with Min-Heap",
    "model": "XGBoost Regressor v1.0.0",
    "transfers_constrained": 2,
    "preference": "fastest",
    "grounding": "October 2026 Delhi Transport Stack"
  }
}
```

---

## 2. Bus Stops

### `GET /api/v1/stops/nearby`
Finds nearest transit stops from coordinates using a spatial KD-Tree index.

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lat` | float | Yes | - | Latitude ($28.0$ to $29.5$) |
| `lng` | float | Yes | - | Longitude ($76.5$ to $77.8$) |
| `radius` | float | No | `1200` | Search radius in meters ($100$ to $5000$) |
| `limit` | integer | No | `8` | Maximum stops returned |

#### Sample Request:
```bash
curl -X GET "http://localhost:8000/api/v1/stops/nearby?lat=28.6313&lng=77.2144&radius=1500"
```

### `GET /api/v1/stops`
Searches or autocompletes bus stop names.

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `q` | string | No | `""` | Search query string |
| `limit` | integer | No | `15` | Maximum results |

---

## 3. Bus Routes

### `GET /api/v1/routes`
Lists monitored Delhi transit routes with corridor type and stop counts.

### `GET /api/v1/routes/{route_id}`
Returns complete stop sequence and coordinates for a given route identifier.

---

## 4. Model Analytics & Status

### `GET /api/v1/model/metrics`
Returns comparative error metrics (MAE, RMSE, MAPE) across all 4 benchmarked models and feature importance scores.

#### Sample Response:
```json
{
  "status": "ok",
  "training_period": "2026-10-01 to 2026-10-10",
  "target_variable": "observed_segment_time_seconds",
  "total_segments": 10,
  "models": [
    {
      "model_name": "Historical Segment Median",
      "mae_seconds": 132.43,
      "rmse_seconds": 220.62,
      "mape_percent": 18.54,
      "observations_count": 4386
    },
    {
      "model_name": "Time-of-Day Baseline (Hourly)",
      "mae_seconds": 63.27,
      "rmse_seconds": 112.24,
      "mape_percent": 8.9,
      "observations_count": 4386
    },
    {
      "model_name": "Random Forest Regressor",
      "mae_seconds": 72.94,
      "rmse_seconds": 122.12,
      "mape_percent": 10.7,
      "observations_count": 4386
    },
    {
      "model_name": "XGBoost Regressor (Time-Dependent)",
      "mae_seconds": 63.98,
      "rmse_seconds": 108.86,
      "mape_percent": 9.46,
      "observations_count": 4386
    }
  ],
  "feature_importance": {
    "scheduled_travel_time_seconds": 0.4812,
    "segment_distance_km": 0.2941,
    "hour_cos": 0.0825,
    "is_peak": 0.0541,
    "is_evening_peak": 0.0418,
    "hour_sin": 0.0245,
    "is_morning_peak": 0.0121,
    "is_weekend": 0.0097
  },
  "active_model": "XGBoost Regressor (Time-Dependent)"
}
```

### `GET /api/v1/data-status`
Returns grounding statistics, total tickets indexed, GPS cleaning audit trail, and map-matching quality scores.

### `GET /api/v1/segments/{segment_id}/prediction`
Direct segment prediction testing tool with configurable hour and weekday parameters.

---

## 5. Health Probes

* `GET /api/v1/health`: Returns detailed operational status, version, and model loaded state.
* `GET /health`: Lightweight probe returning `{"status": "ok"}`.
