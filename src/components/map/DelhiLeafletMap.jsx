import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Approximate coordinates for common Delhi transit hubs
const DELHI_COORDINATES = {
  'anand vihar': [28.6488, 77.2871],
  'connaught place': [28.6313, 77.2144],
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
  'delhi gate': [28.6406, 77.2403]
};

function resolveCoordinates(stopName, fallbackLat = 28.6139, fallbackLng = 77.2090) {
  if (!stopName) return [fallbackLat, fallbackLng];
  const lower = stopName.toLowerCase();
  for (const [key, coords] of Object.entries(DELHI_COORDINATES)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  return [fallbackLat, fallbackLng];
}

/**
 * Interactive Leaflet Map for Delhi Bus Transit
 * Centers on Delhi [28.61, 77.22], zoom 9-11.
 * Plots route polyline, origin/destination pins, and crowding segments.
 */
export function DelhiLeafletMap({
  origin = 'Anand Vihar',
  destination = 'Connaught Place',
  stretches = [],
  crowdingPill = 'GREEN',
  height = '100%',
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.61, 77.22],
        zoom: 10,
        minZoom: 8,
        maxZoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route and Pins when origin, destination or stretches change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const originCoords = resolveCoordinates(origin, 28.6488, 77.2871);
    const destCoords = resolveCoordinates(destination, 28.6313, 77.2144);

    // Build polyline points
    const points = [originCoords];

    if (stretches && stretches.length > 0) {
      stretches.forEach((stretch, idx) => {
        const fromCoord = resolveCoordinates(stretch.from_stop_name || stretch.from);
        const toCoord = resolveCoordinates(stretch.to_stop_name || stretch.to);

        // If identical to origin or dest, interpolate to prevent overlapping points
        const latOffset = (idx + 1) * 0.008;
        const lngOffset = (idx + 1) * -0.006;
        const stretchCoord = [
          originCoords[0] + (destCoords[0] - originCoords[0]) * ((idx + 1) / (stretches.length + 1)) + latOffset * 0.1,
          originCoords[1] + (destCoords[1] - originCoords[1]) * ((idx + 1) / (stretches.length + 1)) + lngOffset * 0.1
        ];

        points.push(stretchCoord);

        // Color coding for stretch
        const level = (stretch.crowding_level || stretch.crowding_label || 'GREEN').toUpperCase();
        const strokeColor = level === 'RED' ? '#DC2626' : level === 'AMBER' ? '#D97706' : '#16A34A';

        // Add intermediate waypoint circle
        const circle = L.circleMarker(stretchCoord, {
          radius: 5,
          color: strokeColor,
          fillColor: '#FFFFFF',
          fillOpacity: 1,
          weight: 2
        });
        circle.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong>${stretch.from_stop_name || stretch.from || 'Stop'}</strong>
            <div style="color: #64748B; font-size: 11px;">to ${stretch.to_stop_name || stretch.to || 'Next'}</div>
            <div style="margin-top: 4px; font-weight: 600; color: ${strokeColor};">Crowding: ${level}</div>
          </div>
        `);
        layerGroup.addLayer(circle);
      });
    }

    points.push(destCoords);

    // Determine overall corridor color
    const polyColor =
      crowdingPill === 'RED' ? '#DC2626' : crowdingPill === 'AMBER' ? '#D97706' : '#16A34A';

    // Route Polyline
    const polyline = L.polyline(points, {
      color: polyColor,
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    });
    layerGroup.addLayer(polyline);

    // Origin Pin
    const originIcon = L.divIcon({
      className: 'delhi-origin-marker',
      html: `
        <div style="
          background: #16A34A;
          color: #FFFFFF;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          border: 2px solid #FFFFFF;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        ">A</div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const originMarker = L.marker(originCoords, { icon: originIcon });
    originMarker.bindPopup(`<strong>Origin:</strong> ${origin}`);
    layerGroup.addLayer(originMarker);

    // Destination Pin
    const destIcon = L.divIcon({
      className: 'delhi-dest-marker',
      html: `
        <div style="
          background: #DC2626;
          color: #FFFFFF;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          border: 2px solid #FFFFFF;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        ">B</div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const destMarker = L.marker(destCoords, { icon: destIcon });
    destMarker.bindPopup(`<strong>Destination:</strong> ${destination}`);
    layerGroup.addLayer(destMarker);

    // Fit bounds smoothly
    try {
      map.fitBounds(polyline.getBounds(), { padding: [40, 40], maxZoom: 13 });
    } catch {
      map.setView([28.61, 77.22], 10);
    }
  }, [origin, destination, stretches, crowdingPill]);

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
        <span>Delhi Transit Corridor: </span>
        <span style={{ color: '#16A34A' }}>Green (Low)</span> |{' '}
        <span style={{ color: '#D97706' }}>Amber (Moderate)</span> |{' '}
        <span style={{ color: '#DC2626' }}>Red (High)</span>
      </div>
    </div>
  );
}
