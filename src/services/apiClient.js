/**
 * Central API Client for Delhi Transport Stack Live FastAPI Backend
 * Connects directly to backend on the local network (no auth required).
 * Base URL defaults to VITE_API_BASE_URL (http://192.168.0.103:8000).
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://192.168.0.103:8000';

const USE_MOCK_FALLBACK =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_USE_MOCK_FALLBACK === 'true') ||
  false;

/**
 * Base fetch wrapper with timeout and JSON parsing
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Non-JSON response
      }
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.details = errorJson || errorText;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const apiClient = {
  baseUrl: API_BASE_URL,
  useMockFallback: USE_MOCK_FALLBACK,

  /**
   * Health check: GET /api/v1/health (falls back to /health)
   */
  async getHealth() {
    try {
      return await apiFetch('/api/v1/health');
    } catch {
      return await apiFetch('/health');
    }
  },

  /**
   * Stop autocomplete search: GET /stops/search?q={query}&limit={limit}
   * Minimum 2 characters.
   */
  async searchStops(query = '', limit = 15) {
    if (!query || query.trim().length < 2) {
      return { stops: [] };
    }
    const params = new URLSearchParams({
      q: query.trim(),
      limit: String(limit)
    });
    return await apiFetch(`/stops/search?${params.toString()}`);
  },

  /**
   * Journey planning: GET /plan
   * Params: origin, destination, day_type, depart_time, pass_multiplier, bus_size
   */
  async planJourney({
    origin,
    destination,
    dayType = 'weekday',
    departTime = '18:00',
    passMultiplier = 1.2,
    busSize = 'auto'
  }) {
    if (!origin || !destination) {
      throw new Error('Origin and destination are required.');
    }

    const params = new URLSearchParams({
      origin: origin.trim(),
      destination: destination.trim(),
      day_type: dayType,
      depart_time: departTime,
      pass_multiplier: String(passMultiplier),
      bus_size: busSize
    });

    return await apiFetch(`/plan?${params.toString()}`);
  },

  /**
   * Route crowding heatmap: GET /crowding/heatmap
   * Returns list of routes with passenger counts.
   */
  async getCrowdingHeatmap() {
    return await apiFetch('/crowding/heatmap');
  },

  /**
   * Stretch crowding hotspots: GET /crowding/stretch?stop={stop}
   */
  async getCrowdingStretch(stopName) {
    if (!stopName) return { hotspots: [] };
    const params = new URLSearchParams({ stop: stopName.trim() });
    return await apiFetch(`/crowding/stretch?${params.toString()}`);
  },

  /**
   * Route stretch crowding details: GET /crowding/route?route={route}
   */
  async getCrowdingRoute(routeName) {
    if (!routeName) return { hotspots: [] };
    const params = new URLSearchParams({ route: routeName.trim() });
    return await apiFetch(`/crowding/route?${params.toString()}`);
  },

  /**
   * Operator hotspots: GET /api/v1/operator/hotspots
   * Gracefully handles known backend SQL bug.
   */
  async getOperatorHotspots(params = {}) {
    const query = new URLSearchParams({
      day_type: params.dayType || 'weekday',
      hour_start: String(params.hourStart || 17),
      hour_end: String(params.hourEnd || 20),
      limit: String(params.limit || 25),
      pass_multiplier: String(params.passMultiplier || 1.2),
      bus_size: params.busSize || 'auto'
    });

    try {
      return await apiFetch(`/api/v1/operator/hotspots?${query.toString()}`);
    } catch (err) {
      console.warn('Operator hotspots returned known limitation:', err.message);
      return {
        error: err.message,
        isKnownBug: true,
        hotspots: []
      };
    }
  }
};

export default apiClient;
