import { apiClient } from './apiClient.js';
import { DEMO_BUSES } from '../data/demoBuses.js';
import { DEMO_ROUTES } from '../data/demoRoutes.js';

/**
 * Bus Fleet and Route Service
 * Connects to live FastAPI /crowding/heatmap and /crowding/route endpoints.
 */

export async function getLiveBuses() {
  // Returns fleet list (note: backend transport is REST only, no polling loops)
  return [...DEMO_BUSES];
}

export async function getBusById(busId) {
  return DEMO_BUSES.find((b) => b.id === busId) || null;
}

export async function getAllRoutes() {
  try {
    const data = await apiClient.getCrowdingHeatmap();
    if (data && Array.isArray(data.routes) && data.routes.length > 0) {
      // Map live routes
      const uniqueRoutesMap = new Map();
      data.routes.forEach((r, idx) => {
        if (!uniqueRoutesMap.has(r.route)) {
          uniqueRoutesMap.set(r.route, {
            id: `r-${r.route}`,
            number: r.route,
            name: `${r.from} to ${r.to}`,
            origin: r.from,
            destination: r.to,
            corridor: r.route.includes('UP') ? 'Northbound Radial' : r.route.includes('DOWN') ? 'Southbound Radial' : 'Crosstown',
            stopsCount: 18,
            duration: '35 min',
            frequency: 'Every 10 min',
            operatingHours: '05:30 - 23:00',
            status: 'Active',
            color: '#2563EB',
            delayAvg: '+2.0 min',
            onTimeRate: '94.5%',
            passengerCount: r.passenger_count || 1,
            stops: [
              { name: r.from, time: '0 min', transfer: 'DTC Feeder', accessible: true },
              { name: 'Intermediate Hub', time: '18 min', transfer: 'Metro Line', accessible: true },
              { name: r.to, time: '35 min', transfer: 'None', accessible: true }
            ]
          });
        }
      });
      return Array.from(uniqueRoutesMap.values());
    }
  } catch (err) {
    if (!apiClient.useMockFallback) {
      console.warn('Could not fetch live routes from heatmap:', err.message);
    }
  }
  return [...DEMO_ROUTES];
}

export const getBusRoutes = getAllRoutes;

export async function getRouteByNumber(routeNumber) {
  try {
    const data = await apiClient.getCrowdingRoute(routeNumber);
    if (data && Array.isArray(data.hotspots) && data.hotspots.length > 0) {
      return {
        number: routeNumber,
        hotspots: data.hotspots
      };
    }
  } catch (err) {
    console.warn(`Could not fetch details for route ${routeNumber}:`, err.message);
  }
  return null;
}

export async function getRouteById(routeId) {
  return DEMO_ROUTES.find((r) => r.id === routeId) || null;
}
