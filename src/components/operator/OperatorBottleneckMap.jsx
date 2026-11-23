import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  createTransitTileLayer,
  normalizeCoord,
  setupMapResizeObserver,
  createLayeredPolyline,
  CROWDING_COLORS
} from '../../utils/mapConfig.js';

/**
 * Embedded Interactive Leaflet Bottleneck Map for DTC Transit Planners
 * 
 * Core Architectural Guarantees:
 * 1. Leaflet + keyless OpenStreetMap tiles with optional Esri Streets basemap toggle (zero API keys, zero watermarks).
 * 2. Strict coordinate normalization (detects swapped Delhi coords, falls back to stop catalog).
 * 3. Plots Green / Amber / Red overloaded stretches from /api/v1/operator/hotspots with casing.
 * 4. Polyline popups with (route, corridor, peak load %, extra buses/hr).
 * 5. Automatic zoom & popup trigger when a stretch is selected from the table.
 * 6. ResizeObserver and tab-switch size invalidation so map never renders gray.
 */
export function OperatorBottleneckMap({
  hotspots = [],
  selectedStretch = null,
  onSelectStretch = null,
  isDrawerOpen = false,
  height = '440px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const polylineRefs = useRef({});

  // 1. Initialize Leaflet Map with keyless OpenStreetMap tiles & Esri toggle
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6250, 77.2150], // Central Delhi / CP
        zoom: 11,
        minZoom: 9,
        maxZoom: 16,
        zoomControl: true
      });

      // Attach keyless OpenStreetMap tile layer with Esri Streets toggle
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

  // 2. Invalidate map size when drawer toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [isDrawerOpen]);

  // 3. Render Polylines for Hotspots
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    polylineRefs.current = {};

    const allPoints = [];

    (hotspots || []).forEach((h, index) => {
      const stretchId = h.id || `stretch-${index}`;
      const fromName = h.from_stop || h.from_stop_name || h.start_stop_name || h.from || 'Anand Vihar';
      const toName = h.to_stop || h.to_stop_name || h.end_stop_name || h.to || 'Connaught Place';
      const routeName = h.route || h.route_id || 'DTC Corridor';

      // Strict coordinate normalization: checks h.coordinates first, then from_coords, then fallback
      const rawFrom = (Array.isArray(h.coordinates) && h.coordinates.length >= 2) ? h.coordinates[0] : (h.from_coords || h.start_coords);
      const rawTo = (Array.isArray(h.coordinates) && h.coordinates.length >= 2) ? h.coordinates[1] : (h.to_coords || h.end_coords);

      const fromCoord = normalizeCoord(rawFrom, fromName);
      const toCoord = normalizeCoord(rawTo, toName);

      allPoints.push(fromCoord, toCoord);

      // Determine crowding level and colors
      const rawRatio = h.load_ratio ?? (h.load_factor ?? ((h.capacity_pct || 50) / 100));
      let loadRatio = typeof rawRatio === 'number' && !isNaN(rawRatio) ? rawRatio : 0.5;
      if (loadRatio > 1.5) {
        loadRatio = loadRatio / 100;
      }
      const peakLoadPct = Math.round(loadRatio * 100);

      const levelStr = String(h.crowding_level || h.crowding || '').toUpperCase();
      let color = CROWDING_COLORS.SEATS_AVAILABLE; // Green: Seats Available
      let statusText = 'Seats Available';
      let weight = 4;

      if (levelStr === 'CROWDED' || levelStr === 'RED' || loadRatio > 0.95) {
        color = CROWDING_COLORS.CROWDED; // Red: Crowded
        statusText = 'Crowded (>95%)';
        weight = 6;
      } else if (levelStr === 'STANDING_ROOM' || levelStr === 'AMBER' || (loadRatio > 0.60 && loadRatio <= 0.95)) {
        color = CROWDING_COLORS.STANDING_ROOM; // Amber: Standing Room
        statusText = 'Standing Room';
        weight = 5;
      }

      // Calculate extra buses/hr needed
      let extraBuses = 0;
      if (h.extra_buses_needed_per_hr !== undefined && h.extra_buses_needed_per_hr !== null) {
        extraBuses = Number(h.extra_buses_needed_per_hr);
      } else if (loadRatio > 1.25) {
        extraBuses = Math.min(6, Math.max(3, Math.ceil((loadRatio - 0.8) * 8)));
      } else if (loadRatio > 0.95) {
        extraBuses = Math.min(3, Math.max(2, Math.ceil((loadRatio - 0.7) * 4)));
      } else if (loadRatio > 0.60) {
        extraBuses = 1;
      }

      const extraBusesText = extraBuses > 0
        ? `+${extraBuses} buses/hr needed`
        : 'Adequate capacity (+0/hr)';

      // 1. Layered polyline (White casing + Thick colored line)
      const { casingPoly, routePoly } = createLayeredPolyline([fromCoord, toCoord], color, weight);
      layerGroup.addLayer(casingPoly);

      // Accessible rich popup content
      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; line-height: 1.45; min-width: 220px; padding: 2px;">
          <div style="font-weight: 700; color: #0F172A; font-size: 13.5px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 6px;">
            ${fromName} &rarr; ${toName}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #64748B;">Route:</span>
            <span style="font-weight: 700; color: #2563EB;">${routeName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #64748B;">Corridor:</span>
            <span style="font-weight: 600; color: #334155;">${fromName} - ${toName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #64748B;">Peak Load:</span>
            <span style="font-weight: 700; color: ${color};">${peakLoadPct}% (${statusText})</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #CBD5E1;">
            <span style="color: #64748B;">Operational Action:</span>
            <span style="font-weight: 700; color: ${extraBuses > 0 ? '#DC2626' : '#16A34A'};">
              ${extraBusesText}
            </span>
          </div>
        </div>
      `;

      routePoly.bindPopup(popupHtml);

      routePoly.on('click', () => {
        if (onSelectStretch) {
          onSelectStretch(h);
        }
      });

      layerGroup.addLayer(routePoly);

      // Start stop circle marker
      const startMarker = L.circleMarker(fromCoord, {
        radius: 4.5,
        color,
        fillColor: '#FFFFFF',
        fillOpacity: 1,
        weight: 2
      }).bindTooltip(fromName, { permanent: false, direction: 'top' });
      layerGroup.addLayer(startMarker);

      // End stop circle marker
      const endMarker = L.circleMarker(toCoord, {
        radius: 4,
        color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 1
      }).bindTooltip(toName, { permanent: false, direction: 'bottom' });
      layerGroup.addLayer(endMarker);

      // Save reference for click-to-zoom
      polylineRefs.current[stretchId] = {
        polyline: routePoly,
        bounds: L.latLngBounds([fromCoord, toCoord]),
        fromName,
        toName,
        routeName
      };
    });

    // Fit map bounds to encompass all visible bottlenecks
    if (allPoints.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [30, 30], maxZoom: 13 });
      } catch {}
    }

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);
  }, [hotspots]);

  // 4. Handle Selected Stretch Click-to-Zoom & Open Popup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStretch) return;

    const fromName = selectedStretch.from_stop || selectedStretch.from_stop_name || selectedStretch.start_stop_name || selectedStretch.from;
    const toName = selectedStretch.to_stop || selectedStretch.to_stop_name || selectedStretch.end_stop_name || selectedStretch.to;
    const stretchId = selectedStretch.id;

    let targetRef = stretchId ? polylineRefs.current[stretchId] : null;

    if (!targetRef) {
      targetRef = Object.values(polylineRefs.current).find((item) => {
        return (
          (item.fromName && fromName && item.fromName.toLowerCase().includes(fromName.toLowerCase())) ||
          (item.toName && toName && item.toName.toLowerCase().includes(toName.toLowerCase()))
        );
      });
    }

    if (targetRef && targetRef.bounds) {
      map.fitBounds(targetRef.bounds, { padding: [50, 50], maxZoom: 14 });
      if (targetRef.polyline && targetRef.polyline.openPopup) {
        setTimeout(() => {
          try {
            targetRef.polyline.openPopup();
          } catch {}
        }, 150);
      }
    } else {
      const c1 = normalizeCoord(null, fromName);
      const c2 = normalizeCoord(null, toName);
      if (c1 && c2) {
        map.fitBounds(L.latLngBounds([c1, c2]), { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [selectedStretch, hotspots]);

  return (
    <div className="operator-bottleneck-map-wrapper" style={{
      background: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Map Header Bar */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#F8FAFC'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
            Interactive Delhi Bottleneck Congestion Map
          </span>
          <span style={{
            fontSize: '11px',
            background: '#E2E8F0',
            color: '#475569',
            padding: '2px 7px',
            borderRadius: '9999px',
            fontWeight: 600
          }}>
            {hotspots.length} Stretches
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '4px', background: '#16A34A', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-muted)' }}>{'Seats Available (≤ 60%)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '4px', background: '#D97706', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-muted)' }}>Standing Room (60-95%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '4px', background: '#DC2626', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{'Crowded (> 95%)'}</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          height: height || '440px',
          minHeight: '400px',
          width: '100%',
          position: 'relative',
          backgroundColor: '#FFFFFF',
          zIndex: 1
        }}
        role="region"
        aria-label="Interactive Delhi Bottleneck Congestion Map"
      />
    </div>
  );
}

export default OperatorBottleneckMap;
