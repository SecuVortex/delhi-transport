import { apiClient } from './apiClient.js';
import { DEMO_ALERTS, DEMO_HOTSPOTS, DEMO_NEARBY_STOPS } from '../data/demoAlerts.js';

/**
 * Traffic Intelligence, Corridor Crowding & Operator Analytics Service
 * Connects to live FastAPI backend for route passenger counts, stretch hotspots,
 * and system health metrics.
 */

export async function getSystemHealth() {
  try {
    return await apiClient.getHealth();
  } catch (err) {
    if (apiClient.useMockFallback) {
      return {
        status: 'ok',
        db_ready: true,
        total_tickets: 2559899,
        gtfs_mode: 'inferred',
        demo_preset: { route_id: '0114(NS)UP', stop_name: 'Rohini Sector 21', stop_sequence: 1 }
      };
    }
    throw err;
  }
}

export async function getCrowdingHeatmap() {
  try {
    const res = await apiClient.getCrowdingHeatmap();
    return res.routes || [];
  } catch (err) {
    if (apiClient.useMockFallback) {
      return [];
    }
    throw err;
  }
}

export async function getStretchHotspots(stopName = 'Anand Vihar') {
  try {
    const res = await apiClient.getCrowdingStretch(stopName);
    return res.hotspots || [];
  } catch (err) {
    if (apiClient.useMockFallback) {
      return DEMO_HOTSPOTS;
    }
    throw err;
  }
}

export async function getTrafficAlerts(severityFilter = 'all') {
  // Alerts are maintained client-side or from fallback as backend does not have an alert feed
  if (severityFilter === 'all') {
    return [...DEMO_ALERTS];
  }
  return DEMO_ALERTS.filter((a) => a.severity.toLowerCase() === severityFilter.toLowerCase());
}

export async function getTrafficHotspots() {
  try {
    const routes = await getCrowdingHeatmap();
    if (routes && routes.length > 0) {
      return routes.slice(0, 15).map((r, i) => ({
        location: `${r.from} to ${r.to}`,
        congestionLevel: r.passenger_count > 50 ? 'Heavily Loaded' : r.passenger_count > 20 ? 'Moderate' : 'Normal Flow',
        congestionClass: r.passenger_count > 50 ? 'error' : r.passenger_count > 20 ? 'warning' : 'success',
        affectedRoutes: `Route ${r.route}`,
        avgDelay: `+${Math.min(Math.round(r.passenger_count * 0.2), 12)} min`,
        cause: 'Peak commuter demand on corridor',
        status: 'Monitored'
      }));
    }
    return [...DEMO_HOTSPOTS];
  } catch {
    return [...DEMO_HOTSPOTS];
  }
}

export async function getNearbyStops() {
  return [...DEMO_NEARBY_STOPS];
}
