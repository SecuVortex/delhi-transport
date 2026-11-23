"""
Historical GPS Trajectory & Segment Travel-Time Dataset Generator.
Generates realistic Delhi bus corridor traversal observations grounded in October 2026 patterns.
Captures diurnal congestion curves (morning/evening peaks), corridor variance, and GPS noise.
"""

import math
import random
from typing import List, Dict, Any
from datetime import datetime, timedelta
from .gtfs_loader import GTFSLoader


def get_traffic_congestion_factor(hour: int, minute: int, weekday: int, is_arterial: bool = True) -> float:
    """
    Computes traffic congestion slowdown factor (1.0 = free flow, 2.2 = severe gridlock).
    hour: 0 to 23
    minute: 0 to 59
    weekday: 0 (Monday) to 6 (Sunday)
    """
    time_float = hour + (minute / 60.0)
    is_weekend = weekday >= 5

    factor = 1.0

    # Morning Peak: 08:00 - 11:00, apex at 09:15
    if 7.5 <= time_float <= 11.5:
        peak_dist = abs(time_float - 9.25)
        curve = max(0.0, 1.0 - (peak_dist / 2.0))
        peak_intensity = 0.85 if not is_weekend else 0.40
        factor += curve * peak_intensity

    # Evening Peak: 17:00 - 20:30, apex at 18:30
    elif 16.5 <= time_float <= 21.0:
        peak_dist = abs(time_float - 18.5)
        curve = max(0.0, 1.0 - (peak_dist / 2.25))
        peak_intensity = 1.05 if not is_weekend else 0.55
        factor += curve * peak_intensity

    # Midday Moderate Flow: 12:00 - 16:00
    elif 12.0 <= time_float <= 16.0:
        factor += 0.25 if not is_weekend else 0.20

    # Night Free Flow: 22:00 - 06:00
    else:
        factor = 0.90

    # Arterial corridor multiplier (e.g. Vikas Marg, Ring Road, ITO)
    if is_arterial:
        factor *= 1.15

    return factor


def generate_segment_dataset(num_days: int = 14, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Generates chronological stop-to-stop segment travel time observations for model training.
    Spans October 1 to October 14, 2026 across hourly trips.
    """
    random.seed(seed)
    loader = GTFSLoader()
    segments = loader.get_all_segments()

    records = []
    base_date = datetime(2026, 10, 1, 6, 0, 0)

    # Hourly departures from 06:00 to 22:00
    departure_hours = list(range(6, 23))

    for day_offset in range(num_days):
        current_date = base_date + timedelta(days=day_offset)
        weekday = current_date.weekday()
        is_weekend = 1 if weekday >= 5 else 0

        for hour in departure_hours:
            for minute in [0, 20, 40]:  # 20-minute bus frequency
                obs_dt = current_date.replace(hour=hour, minute=minute, second=random.randint(0, 59))
                hour_val = obs_dt.hour
                min_val = obs_dt.minute

                for seg in segments:
                    dist_km = seg["segment_distance_km"]
                    is_arterial = "R-101" in seg["route_id"] or "R-204" in seg["route_id"] or "R-305" in seg["route_id"]

                    cong_factor = get_traffic_congestion_factor(hour_val, min_val, weekday, is_arterial)

                    # Base free-flow bus speed: 28 km/h on regular roads, 35 km/h on expressways
                    base_speed_kmh = 32.0 if "608" in seg["route_id"] else 26.0
                    effective_speed_kmh = base_speed_kmh / cong_factor

                    # Add realistic Gaussian noise (stochastic delays at intersections, traffic lights, boarding)
                    stochastic_noise = random.gauss(0.0, 1.8)
                    effective_speed_kmh = max(8.0, min(55.0, effective_speed_kmh + stochastic_noise))

                    # Calculate observed travel time
                    travel_time_sec = (dist_km / effective_speed_kmh) * 3600.0
                    dwell_time = random.uniform(25.0, 60.0)  # Stop boarding dwell
                    total_observed_time = round(travel_time_sec + dwell_time, 1)

                    # Peak period indicator
                    is_morning_peak = 1 if 8 <= hour_val <= 11 else 0
                    is_evening_peak = 1 if 17 <= hour_val <= 20 else 0
                    peak_flag = 1 if (is_morning_peak or is_evening_peak) else 0

                    records.append({
                        "observation_id": f"obs_{len(records):06d}",
                        "timestamp": obs_dt.isoformat(),
                        "date": obs_dt.strftime("%Y-%m-%d"),
                        "segment_id": seg["segment_id"],
                        "route_id": seg["route_id"],
                        "from_stop_id": seg["from_stop_id"],
                        "to_stop_id": seg["to_stop_id"],
                        "segment_distance_km": dist_km,
                        "hour": hour_val,
                        "minute": min_val,
                        "weekday": weekday,
                        "is_weekend": is_weekend,
                        "is_peak": peak_flag,
                        "is_morning_peak": is_morning_peak,
                        "is_evening_peak": is_evening_peak,
                        "historical_avg_speed_kmh": round(effective_speed_kmh, 2),
                        "scheduled_travel_time_seconds": seg["scheduled_travel_time_seconds"],
                        "observed_segment_time_seconds": total_observed_time
                    })

    return records
