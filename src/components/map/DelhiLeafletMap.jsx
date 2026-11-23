import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { createTransitTileLayer, setupMapResizeObserver, normalizeCoord } from '../../utils/mapConfig.js';
import { fetchRoadGeometry } from '../../utils/mapRouting.js';

// Core Delhi transit stop catalog coordinates
const DELHI_COORDINATES = {
  'anand vihar': [28.6488, 77.2871],
  'connaught place': [28.6313, 77.2144],
  'super bazar': [28.6313, 77.2144],
  'dilshad garden': [28.6759, 77.3210],
  'kashmere gate': [28.6665, 77.2294],
  'rohini': [28.7180, 77.0650],
  'kapashera': [28.5250, 77.0850],
  'nehru place': [28.5494, 77.2528],
  'lajpat nagar': [28.5700, 77.2400],
  'karol bagh': [28.6514, 77.1907],
  'dhaula kuan': [28.5900, 77.1600],
  'ito': [28.6289, 77.2415],
  'nizamuddin': [28.5880, 77.2530],
  'mayur vihar': [28.6080, 77.2950],
  'shahdara': [28.6730, 77.2880],
  'aiims': [28.5672, 77.2100],
  'delhi gate': [28.6406, 77.2403],
  'shakarpur': [28.6295, 77.2750],
  'nirman vihar': [28.6360, 77.2850],
  'mandi house': [28.6260, 77.2340],
  'badarpur': [28.4900, 77.3000],
  'sarai kale khan': [28.5910, 77.2560],
  'pushpa bhawan': [28.5350, 77.2280],
  'chirag delhi': [28.5420, 77.2270],
  'andrews ganj': [28.5660, 77.2290],
  'mother dairy': [28.6310, 77.2990],
  'okhla': [28.5300, 77.2700],
  'mehrauli': [28.5200, 77.1800],
  'saket': [28.5240, 77.2060],
  'azadpur': [28.7070, 77.1750],
  'wazirpur': [28.6980, 77.1620],
  'pitampura': [28.6990, 77.1380],
  'janakpuri': [28.6210, 77.0870],
  'uttam nagar': [28.6210, 77.0580],
  'dwarka': [28.5920, 77.0460]
};

function resolveCoordinates(stopName, fallbackLat = 28.6139, fallbackLng = 77.2090) {
  if (!stopName) return [fallbackLat, fallbackLng];
  const lower = String(stopName).toLowerCase();
  for (const [key, coords] of Object.entries(DELHI_COORDINATES)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  // Generates repeatable deterministic jitter for unknown stops across Delhi bounds
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash << 5) - hash + lower.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.18;
  const lngOffset = ((Math.abs(hash >> 3) % 1000) / 1000 - 0.5) * 0.22;
  return [28.6200 + latOffset, 77.2100 + lngOffset];
}

/**
 * Interactive Leaflet Map for Delhi Bus Transit
 * Supports both:
 * 1. Commuter View: Route legs, walking links, and stop waypoints
 * 2. Operator View: Ranked corridor bottleneck polylines colored Green/Amber/Red
 */
export function DelhiLeafletMap({
  origin = 'Anand Vihar',
  destination = 'Connaught Place',
  stretches = [],
  legs = [],
  bottlenecks = [],
  crowdingPill = 'GREEN',
  mode = 'commuter', // 'commuter' | 'operator'
  height = '100%',
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.62, 77.22],
        zoom: 11,
        minZoom: 8,
        maxZoom: 16,
        zoomControl: true
      });

      createTransitTileLayer(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const container = mapContainerRef.current;
    const cleanupResize = setupMapResizeObserver(map, container);

    return () => {
      cleanupResize();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers when mode, stretches, legs, or bottlenecks change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const allPoints = [];

    // Mode A: Operator Bottlenecks Map
    if (mode === 'operator' || (bottlenecks && bottlenecks.length > 0)) {
      const activeHotspots = bottlenecks.length > 0 ? bottlenecks : [];

      activeHotspots.forEach((h, idx) => {
        const fromCoord = resolveCoordinates(h.from_stop || h.from || 'Anand Vihar');
        const toCoord = resolveCoordinates(h.to_stop || h.to || 'Connaught Place');

        allPoints.push(fromCoord, toCoord);

        const level = (h.crowding_level || (h.load_factor > 0.95 ? 'RED' : h.load_factor > 0.60 ? 'AMBER' : 'GREEN')).toUpperCase();
        const strokeColor = level === 'RED' ? '#DC2626' : level === 'AMBER' ? '#D97706' : '#16A34A';
        const lineWeight = level === 'RED' ? 6 : level === 'AMBER' ? 5 : 4;

        const poly = L.polyline([fromCoord, toCoord], {
          color: strokeColor,
          weight: lineWeight,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round'
        });

        poly.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <div style="font-weight: 700; color: #0F172A;">${h.corridor || `${h.from_stop} to ${h.to_stop}`}</div>
            <div style="color: #64748B; font-size: 11px;">Route: ${h.route || 'DTC Corridor'}</div>
            <div style="margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: ${strokeColor};">
                ${level === 'RED' ? 'Crowded (High Load)' : level === 'AMBER' ? 'Standing Room' : 'Seats Available'}
              </span>
              <span style="font-size: 11px; color: #475569;">
                ${h.passenger_count || 1} boardings
              </span>
            </div>
            ${h.load_factor !== undefined ? `<div style="font-size: 10.5px; color: #64748B;">Load Factor: ${Math.round(h.load_factor * 100)}%</div>` : ''}
          </div>
        `);
        layerGroup.addLayer(poly);

        // Add circle marker for from_stop
        const startDot = L.circleMarker(fromCoord, {
          radius: 4,
          color: strokeColor,
          fillColor: '#FFFFFF',
          fillOpacity: 1,
          weight: 2
        });
        layerGroup.addLayer(startDot);
      });

      if (allPoints.length > 1) {
        try {
          map.fitBounds(L.latLngBounds(allPoints), { padding: [30, 30], maxZoom: 13 });
        } catch {}
      }

      // Invalidate size once after 180ms page entrance transition completes
      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 200);
      return;
    }

    // Mode B: Commuter Journey Itinerary Map
    const originCoords = resolveCoordinates(origin, 28.6488, 77.2871);
    const destCoords = resolveCoordinates(destination, 28.6313, 77.2144);
    const polyColor = crowdingPill === 'RED' ? '#DC2626' : crowdingPill === 'AMBER' ? '#D97706' : '#16A34A';

    allPoints.push(originCoords);

    if (stretches && stretches.length > 0) {
      stretches.forEach((stretch, idx) => {
        const fromC = resolveCoordinates(stretch.from_stop_name || origin, originCoords[0], originCoords[1]);
        const toC = resolveCoordinates(stretch.to_stop_name || destination, destCoords[0], destCoords[1]);

        allPoints.push(fromC, toC);

        const level = (stretch.crowding_level || stretch.crowding_label || crowdingPill).toUpperCase();
        const strokeColor = level === 'RED' ? '#DC2626' : level === 'AMBER' ? '#D97706' : '#16A34A';

        const poly = L.polyline([fromC, toC], {
          color: strokeColor,
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        });

        poly.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <div style="font-weight: 700; color: #0F172A;">${stretch.from_stop_name} to ${stretch.to_stop_name}</div>
            <div style="color: #64748B; font-size: 11px;">Route: ${stretch.route || 'DTC Corridor'}</div>
            <div style="margin-top: 4px; font-weight: 700; color: ${strokeColor};">
              Crowding: ${stretch.crowding_label || level}
            </div>
          </div>
        `);
        layerGroup.addLayer(poly);
      });
    } else {
      // Draw thick colored route polyline connecting Point A to Point B immediately
      const poly = L.polyline([originCoords, destCoords], {
        color: polyColor,
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      });

      poly.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 700; color: #0F172A;">${origin} &rarr; ${destination}</div>
          <div style="color: #64748B; font-size: 11px;">Corridor Route</div>
          <div style="margin-top: 4px; font-weight: 700; color: ${polyColor};">
            Crowding: ${crowdingPill === 'RED' ? 'Crowded' : crowdingPill === 'AMBER' ? 'Standing Room' : 'Seats Available'}
          </div>
        </div>
      `);
      layerGroup.addLayer(poly);
      allPoints.push(destCoords);

      // Non-blocking background upgrade via OSRM
      fetchRoadGeometry([originCoords, destCoords]).then((roadCoords) => {
        if (roadCoords && roadCoords.length > 1) {
          poly.setLatLngs(roadCoords);
          try {
            map.fitBounds(L.latLngBounds(roadCoords), { padding: [50, 50], maxZoom: 15 });
          } catch {}
        }
      }).catch(() => {});
    }

    // Origin Pin (A)
    const pinA = allPoints[0];
    const originIcon = L.divIcon({
      className: 'delhi-origin-marker',
      html: `
        <div style="background: #16A34A; color: #FFFFFF; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; border: 2px solid #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.25);">A</div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const originMarker = L.marker(pinA, { icon: originIcon });
    originMarker.bindPopup(`<strong>Origin:</strong> ${origin}`);
    layerGroup.addLayer(originMarker);

    // Destination Pin (B)
    const pinB = allPoints[allPoints.length - 1];
    const destIcon = L.divIcon({
      className: 'delhi-dest-marker',
      html: `
        <div style="background: #DC2626; color: #FFFFFF; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; border: 2px solid #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.25);">B</div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const destMarker = L.marker(pinB, { icon: destIcon });
    destMarker.bindPopup(`<strong>Destination:</strong> ${destination}`);
    layerGroup.addLayer(destMarker);

    if (allPoints.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50], maxZoom: 15 });
      } catch {
        map.setView([28.62, 77.22], 11);
      }
    }

    setTimeout(() => {
      try { map.invalidateSize(); } catch {}
    }, 200);
  }, [origin, destination, stretches, legs, bottlenecks, crowdingPill, mode]);

  return (
    <div style={{ position: 'relative', width: '100%', height, minHeight: '340px' }} className={className}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '6px' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid #E2E8F0',
          fontSize: '11px',
          fontWeight: 600,
          color: '#1E293B',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <span>{mode === 'operator' ? 'Corridor Bottlenecks: ' : 'Transit Crowding: '}</span>
        <span style={{ color: '#16A34A' }}>Green (Low)</span> |{' '}
        <span style={{ color: '#D97706' }}>Amber (Moderate)</span> |{' '}
        <span style={{ color: '#DC2626' }}>Red (Critical)</span>
      </div>
    </div>
  );
}
