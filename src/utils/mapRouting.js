import { getStopCoordinates, clampToDelhiBounds } from '../components/operator/delhiCoordinates.js';
import { normalizeCoord } from './mapConfig.js';

// In-memory cache for OSRM route geometries
const routingCache = new Map();

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function haversineDistanceKm(coord1, coord2) {
  if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return 0;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves coordinates for a stop name and ensures they are strictly clamped within Delhi bounds.
 */
export function resolveStopLocation(stopName, defaultLat = 28.6250, defaultLng = 77.2150) {
  const [lat, lng] = getStopCoordinates(stopName, defaultLat, defaultLng);
  return clampToDelhiBounds(lat, lng);
}

/**
 * Fetches real road geometry from the free public OSRM API.
 * 
 * @param {Array<[number, number]>} orderedCoords - Array of [lat, lng] coordinates
 * @param {number} timeoutMs - Request timeout in milliseconds (default: 3000ms)
 * @returns {Promise<Array<[number, number]>>} Array of [lat, lng] road points
 */
export async function fetchRoadGeometry(orderedCoords, timeoutMs = 3000) {
  if (!Array.isArray(orderedCoords) || orderedCoords.length < 2) {
    return orderedCoords || [];
  }

  // Sanitize and clamp all coordinates inside Delhi
  const clampedCoords = orderedCoords.map(([lat, lng]) => clampToDelhiBounds(lat, lng));

  // Deduplicate consecutive identical points to prevent OSRM 400 errors
  const filteredCoords = [];
  for (let i = 0; i < clampedCoords.length; i++) {
    const current = clampedCoords[i];
    if (i === 0) {
      filteredCoords.push(current);
    } else {
      const prev = clampedCoords[i - 1];
      if (Math.abs(current[0] - prev[0]) > 0.0001 || Math.abs(current[1] - prev[1]) > 0.0001) {
        filteredCoords.push(current);
      }
    }
  }

  if (filteredCoords.length < 2) {
    return clampedCoords;
  }

  // Generate cache key
  const cacheKey = filteredCoords.map(([lat, lng]) => `${lat.toFixed(4)},${lng.toFixed(4)}`).join(';');
  if (routingCache.has(cacheKey)) {
    return routingCache.get(cacheKey);
  }

  // OSRM expects: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson
  const coordParam = filteredCoords.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordParam}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`OSRM HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const geojsonCoords = data.routes[0].geometry?.coordinates;
      if (Array.isArray(geojsonCoords) && geojsonCoords.length > 0) {
        // Convert GeoJSON [lng, lat] back to Leaflet [lat, lng] and clamp
        const leafletCoords = geojsonCoords.map(([lng, lat]) => clampToDelhiBounds(lat, lng));
        routingCache.set(cacheKey, leafletCoords);
        return leafletCoords;
      }
    }
    // Fallback if no geometry in Ok response
    return clampedCoords;
  } catch (err) {
    // Graceful fallback to straight stop-to-stop line
    console.warn('OSRM road snapping unavailable, using direct stop line:', err.message);
    return clampedCoords;
  }
}

/**
 * Resolves road geometries for a list of route stretches.
 * For each stretch, resolves start/end coordinates and queries OSRM (or retrieves from cache).
 * 
 * @param {Array<Object>} stretches - Route stretch objects with from_stop_name and to_stop_name
 * @param {string} origin - Route origin fallback
 * @param {string} destination - Route destination fallback
 * @returns {Promise<Array<Object>>} Enriched stretches with roadCoords and distanceKm
 */
export async function resolveStretchesRoadGeometry(stretches, origin = 'Anand Vihar', destination = 'Connaught Place') {
  if (!Array.isArray(stretches) || stretches.length === 0) {
    const oCoord = resolveStopLocation(origin);
    const dCoord = resolveStopLocation(destination);
    const roadPoints = await fetchRoadGeometry([oCoord, dCoord]);
    const dist = haversineDistanceKm(oCoord, dCoord) * 1.25; // 1.25 winding factor
    return [
      {
        from_stop_name: origin,
        to_stop_name: destination,
        fromCoord: oCoord,
        toCoord: dCoord,
        roadCoords: roadPoints,
        distanceKm: Math.max(0.5, parseFloat(dist.toFixed(1))),
        crowding_level: 'SEATS_AVAILABLE',
        crowding_label: 'Seats Available'
      }
    ];
  }

  // Resolve coordinates for each stretch
  const resolved = stretches.map((stretch, idx) => {
    const fromName = stretch.from_stop_name || stretch.start_stop || (idx === 0 ? origin : 'Stop');
    const toName = stretch.to_stop_name || stretch.end_stop || (idx === stretches.length - 1 ? destination : 'Next Stop');
    const fromCoord = normalizeCoord(stretch.from_coords || stretch.fromCoord, fromName);
    const toCoord = normalizeCoord(stretch.to_coords || stretch.toCoord, toName);
    const directDist = haversineDistanceKm(fromCoord, toCoord) * 1.25;

    return {
      ...stretch,
      from_stop_name: fromName,
      to_stop_name: toName,
      fromCoord,
      toCoord,
      distanceKm: stretch.distance_km || Math.max(0.4, parseFloat(directDist.toFixed(1)))
    };
  });

  // Fetch road geometries for all stretches in parallel
  const enriched = await Promise.all(
    resolved.map(async (st) => {
      const roadCoords = await fetchRoadGeometry([st.fromCoord, st.toCoord]);
      return {
        ...st,
        roadCoords
      };
    })
  );

  return enriched;
}
