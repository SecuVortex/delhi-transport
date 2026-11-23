"""
GPS Data Cleaning and Quality Filtering Module.
Applies rigorous validation, duplicate removal, outlier filtering, and trajectory reconstruction.
Maintains a detailed audit trail of all preprocessing decisions.
"""

import math
from typing import List, Dict, Any, Tuple
from datetime import datetime
from ..config import GPS_CONFIG


def haversine_distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Computes great-circle distance between two coordinates in meters.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


class GPSCleaner:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or GPS_CONFIG
        self.audit_log = {
            "total_records_ingested": 0,
            "missing_fields": 0,
            "out_of_bounds": 0,
            "duplicate_records": 0,
            "impossible_speed": 0,
            "excessive_acceleration": 0,
            "teleportation_jumps": 0,
            "accepted_records": 0
        }

    def clean_records(self, raw_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Cleans a batch of raw GPS observations.
        Sorts by vehicle/trip and timestamp, detects duplicates, bounds, and dynamic outliers.
        """
        self.audit_log["total_records_ingested"] += len(raw_records)
        valid_records = []
        seen_keys = set()

        for rec in raw_records:
            # 1. Missing fields check
            lat = rec.get("latitude") or rec.get("lat")
            lng = rec.get("longitude") or rec.get("lng")
            ts = rec.get("timestamp")
            vid = rec.get("vehicle_id")

            if lat is None or lng is None or ts is None:
                self.audit_log["missing_fields"] += 1
                continue

            try:
                lat = float(lat)
                lng = float(lng)
            except (ValueError, TypeError):
                self.audit_log["missing_fields"] += 1
                continue

            # 2. Delhi NCR Bounding Box validation
            if not (self.config["min_lat"] <= lat <= self.config["max_lat"] and
                    self.config["min_lng"] <= lng <= self.config["max_lng"]):
                self.audit_log["out_of_bounds"] += 1
                continue

            # 3. Duplicate check (vehicle_id + timestamp + rounded lat/lng)
            dedup_key = (str(vid), str(ts), round(lat, 5), round(lng, 5))
            if dedup_key in seen_keys:
                self.audit_log["duplicate_records"] += 1
                continue
            seen_keys.add(dedup_key)

            # Standardize record
            norm_rec = dict(rec)
            norm_rec["latitude"] = lat
            norm_rec["longitude"] = lng
            norm_rec["timestamp"] = self._parse_timestamp(ts)
            valid_records.append(norm_rec)

        # 4. Trajectory Reconstruction & Outlier Filtering per Vehicle
        clean_trajectories = self._filter_trajectories(valid_records)
        self.audit_log["accepted_records"] += len(clean_trajectories)
        return clean_trajectories

    def _parse_timestamp(self, ts: Any) -> float:
        """Converts timestamp to Unix epoch seconds."""
        if isinstance(ts, (int, float)):
            return float(ts)
        if isinstance(ts, str):
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                return dt.timestamp()
            except Exception:
                try:
                    dt = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
                    return dt.timestamp()
                except Exception:
                    pass
        return 0.0

    def _filter_trajectories(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups observations by vehicle_id, sorts chronologically,
        and applies dynamic velocity, acceleration, and teleportation jump filters.
        """
        by_vehicle: Dict[str, List[Dict[str, Any]]] = {}
        for r in records:
            vid = str(r.get("vehicle_id", "default_vehicle"))
            by_vehicle.setdefault(vid, []).append(r)

        accepted = []
        for vid, pts in by_vehicle.items():
            pts.sort(key=lambda x: x["timestamp"])
            if not pts:
                continue

            prev_pt = pts[0]
            prev_speed_mps = 0.0
            accepted.append(prev_pt)

            for cur_pt in pts[1:]:
                dt = cur_pt["timestamp"] - prev_pt["timestamp"]
                if dt < self.config["min_interval_seconds"]:
                    self.audit_log["duplicate_records"] += 1
                    continue

                dist = haversine_distance_meters(
                    prev_pt["latitude"], prev_pt["longitude"],
                    cur_pt["latitude"], cur_pt["longitude"]
                )

                # Check teleportation jump
                if dt <= 60.0 and dist > self.config["max_jump_distance_m"]:
                    self.audit_log["teleportation_jumps"] += 1
                    continue

                speed_mps = dist / dt
                speed_kmh = speed_mps * 3.6

                # Speed limit check
                if speed_kmh > self.config["max_speed_kmh"]:
                    self.audit_log["impossible_speed"] += 1
                    continue

                # Acceleration check
                if prev_speed_mps > 0:
                    accel = abs(speed_mps - prev_speed_mps) / dt
                    if accel > self.config["max_acceleration_ms2"]:
                        self.audit_log["excessive_acceleration"] += 1
                        continue

                cur_pt["calculated_speed_kmh"] = round(speed_kmh, 2)
                cur_pt["step_distance_meters"] = round(dist, 2)
                prev_speed_mps = speed_mps
                prev_pt = cur_pt
                accepted.append(cur_pt)

        return accepted

    def get_audit_report(self) -> Dict[str, Any]:
        """Returns the complete GPS preprocessing audit trail."""
        total = self.audit_log["total_records_ingested"]
        accepted = self.audit_log["accepted_records"]
        acceptance_rate = (accepted / total * 100.0) if total > 0 else 100.0
        return {
            **self.audit_log,
            "acceptance_rate_percent": round(acceptance_rate, 2)
        }
