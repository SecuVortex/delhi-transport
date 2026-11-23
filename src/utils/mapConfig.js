import L from 'leaflet';
import {
  DELHI_BOUNDS,
  clampToDelhiBounds,
  getStopCoordinates
} from '../components/operator/delhiCoordinates.js';

// Keyless Basemap Tile URLs & Attributions (100% Free, Zero API Keys, Zero Watermarks)
export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const ESRI_STREET_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
export const ESRI_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012';

// Crowding Brand Colors
export const CROWDING_COLORS = {
  SEATS_AVAILABLE: '#16A34A', // Green
  STANDING_ROOM: '#D97706',   // Amber
  CROWDED: '#DC2626'          // Red
};

/**
 * Creates a clean, keyless Leaflet tile layer using OpenStreetMap as primary
 * with an interactive basemap toggle to Esri World Street Map and zero watermarks.
 *
 * @param {L.Map} [map] - Optional Leaflet map instance to add the layer to
 * @param {object} [options] - Configuration options
 * @returns {L.TileLayer} The created OSM TileLayer
 */
export function createTransitTileLayer(map = null, options = {}) {
  const osmLayer = L.tileLayer(OSM_TILE_URL, {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19
  });

  const esriLayer = L.tileLayer(ESRI_STREET_TILE_URL, {
    attribution: ESRI_ATTRIBUTION,
    maxZoom: 19
  });

  // Seamless fallback to Esri World Street Map if OSM encounters network failures
  let hasFallenBack = false;
  osmLayer.on('tileerror', () => {
    if (!hasFallenBack) {
      hasFallenBack = true;
      console.warn('OpenStreetMap tile error, switching to Esri World Street Map.');
      osmLayer.setUrl(ESRI_STREET_TILE_URL);
    }
  });

  if (map) {
    osmLayer.addTo(map);

    if (options.addLayerControl !== false && !map._transitLayerControl) {
      try {
        map._transitLayerControl = L.control.layers(
          {
            'OpenStreetMap': osmLayer,
            'Esri Street': esriLayer
          },
          null,
          { position: 'topright' }
        ).addTo(map);
      } catch {
        // Safe guard against duplicate control attachment
      }
    }
  }

  return osmLayer;
}

/**
 * Normalizes any coordinate input into a strictly validated [lat, lng] array inside Delhi.
 *
 * Features:
 * - Accepts [lat, lng], [lng, lat], {lat, lng}, or {latitude, longitude}.
 * - Detects and flips swapped coordinates (if first > 60 && second < 40, swaps to [second, first]).
 * - Rejects null, undefined, NaN, or [0, 0].
 * - Falls back to getStopCoordinates(fallbackStopName) from delhiCoordinates.js.
 * - Strictly clamps output to Delhi transit operating boundaries (28.40–28.90 N, 76.80–77.40 E).
 *
 * @param {any} coord - Input coordinate candidate
 * @param {string} [fallbackStopName] - Optional stop name to use for lookup if coord is invalid
 * @returns {[number, number]} Valid [lat, lng] array
 */
export function normalizeCoord(coord, fallbackStopName = null) {
  let lat = null;
  let lng = null;

  if (Array.isArray(coord) && coord.length >= 2) {
    const p1 = Number(coord[0]);
    const p2 = Number(coord[1]);
    if (Number.isFinite(p1) && Number.isFinite(p2) && !(p1 === 0 && p2 === 0)) {
      lat = p1;
      lng = p2;
    }
  } else if (coord && typeof coord === 'object') {
    if (coord.lat !== undefined && (coord.lng !== undefined || coord.lon !== undefined)) {
      const p1 = Number(coord.lat);
      const p2 = Number(coord.lng !== undefined ? coord.lng : coord.lon);
      if (Number.isFinite(p1) && Number.isFinite(p2) && !(p1 === 0 && p2 === 0)) {
        lat = p1;
        lng = p2;
      }
    } else if (coord.latitude !== undefined && coord.longitude !== undefined) {
      const p1 = Number(coord.latitude);
      const p2 = Number(coord.longitude);
      if (Number.isFinite(p1) && Number.isFinite(p2) && !(p1 === 0 && p2 === 0)) {
        lat = p1;
        lng = p2;
      }
    }
  }

  // If coordinate parsed, check for swapped Delhi coordinates
  // Delhi Latitude is ~28.6 (28.4 - 28.9). Delhi Longitude is ~77.2 (76.8 - 77.4).
  // If first number is longitude (> 60) and second is latitude (< 40), flip them!
  if (lat !== null && lng !== null) {
    if (lat > 60 && lng < 40) {
      const temp = lat;
      lat = lng;
      lng = temp;
    }
    return clampToDelhiBounds(lat, lng);
  }

  // Fallback to stop name lookup
  if (fallbackStopName && typeof fallbackStopName === 'string') {
    return getStopCoordinates(fallbackStopName);
  }

  // Final Central Delhi fallback
  return [28.6250, 77.2150];
}

/**
 * Checks if a coordinate is valid and non-zero
 */
export function isValidCoord(coord) {
  if (!coord) return false;
  if (Array.isArray(coord) && coord.length >= 2) {
    return Number.isFinite(Number(coord[0])) && Number.isFinite(Number(coord[1])) && !(Number(coord[0]) === 0 && Number(coord[1]) === 0);
  }
  if (typeof coord === 'object') {
    const lat = coord.lat ?? coord.latitude;
    const lng = coord.lng ?? coord.lon ?? coord.longitude;
    return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && !(Number(lat) === 0 && Number(lng) === 0);
  }
  return false;
}

/**
 * Creates high-contrast station pin marker (Green "A" for Origin, Red "B" for Destination).
 *
 * @param {[number, number]} latLng - [lat, lng] array
 * @param {string} label - "A" or "B"
 * @param {string} color - Hex color code
 * @param {string} popupContent - HTML string for popup
 * @returns {L.Marker} Leaflet Marker
 */
export function createStationPinMarker(latLng, label, color, popupContent) {
  const safeCoord = normalizeCoord(latLng);
  const icon = L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div style="
        background-color: ${color};
        color: #FFFFFF;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        border: 2px solid #FFFFFF;
      ">
        ${label}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });

  const marker = L.marker(safeCoord, { icon, zIndexOffset: 1000 });
  if (popupContent) {
    marker.bindPopup(popupContent);
  }
  return marker;
}

/**
 * Creates clickable middle-stop circle marker with tooltips.
 *
 * @param {[number, number]} latLng - [lat, lng] array
 * @param {string} stopName - Stop name
 * @param {string} statusLabel - Crowding status label
 * @param {string} strokeColor - Hex color code
 * @returns {L.CircleMarker} Leaflet CircleMarker
 */
export function createMiddleStopMarker(latLng, stopName, statusLabel, strokeColor) {
  const safeCoord = normalizeCoord(latLng, stopName);
  const marker = L.circleMarker(safeCoord, {
    radius: 5.5,
    color: strokeColor,
    fillColor: '#FFFFFF',
    fillOpacity: 1,
    weight: 2.5
  });

  marker.bindTooltip(`
    <div style="font-size: 11.5px; font-weight: 600; font-family: sans-serif;">
      <div>${stopName}</div>
      <div style="color: ${strokeColor}; font-size: 10.5px;">${statusLabel}</div>
    </div>
  `, { permanent: false, direction: 'top' });

  marker.bindPopup(`
    <div style="font-size: 12px; font-weight: 600; font-family: sans-serif;">
      <strong>Stop:</strong> ${stopName}<br/>
      <span style="color: ${strokeColor};">${statusLabel}</span>
    </div>
  `);

  return marker;
}

/**
 * Creates a pair of casing + colored polylines for crisp map rendering.
 *
 * @param {Array<[number, number]>} coords - Ordered [lat, lng] array
 * @param {string} strokeColor - Hex color for polyline
 * @param {number} [weight=5] - Weight of the colored polyline
 * @returns {{ casingPoly: L.Polyline, routePoly: L.Polyline }}
 */
export function createLayeredPolyline(coords, strokeColor, weight = 5) {
  const safeCoords = coords.map((c) => normalizeCoord(c));

  const casingPoly = L.polyline(safeCoords, {
    color: '#FFFFFF',
    weight: weight + 3,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round'
  });

  const routePoly = L.polyline(safeCoords, {
    color: strokeColor,
    weight,
    opacity: 1.0,
    lineCap: 'round',
    lineJoin: 'round'
  });

  return { casingPoly, routePoly };
}

/**
 * Attaches a ResizeObserver to a container DOM element to call map.invalidateSize().
 * Includes fallback setTimeout triggers and returns a cleanup function.
 *
 * @param {L.Map} map - Leaflet Map instance
 * @param {HTMLElement} container - DOM container element
 * @returns {() => void} Cleanup function to disconnect observer
 */
export function setupMapResizeObserver(map, container) {
  if (!map || !container) return () => {};

  // Initial invalidations
  const t1 = setTimeout(() => {
    try { map.invalidateSize(); } catch {}
  }, 100);
  const t2 = setTimeout(() => {
    try { map.invalidateSize(); } catch {}
  }, 300);

  let resizeObserver = null;
  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      try {
        map.invalidateSize();
      } catch {}
    });
    resizeObserver.observe(container);
  }

  const handleWindowResize = () => {
    try {
      map.invalidateSize();
    } catch {}
  };
  window.addEventListener('resize', handleWindowResize);

  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener('resize', handleWindowResize);
  };
}
