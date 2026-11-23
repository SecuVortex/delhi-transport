import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  createTransitTileLayer,
  normalizeCoord,
  createStationPinMarker,
  createMiddleStopMarker,
  createLayeredPolyline,
  setupMapResizeObserver,
  CROWDING_COLORS
} from '../../utils/mapConfig.js';
import {
  resolveStretchesRoadGeometry,
  fetchRoadGeometry,
  haversineDistanceKm
} from '../../utils/mapRouting.js';

/**
 * CommuterMap Component
 * High-performance, bulletproof interactive transit map for Delhi commuters.
 * 
 * Core Architectural Guarantees:
 * 1. Leaflet + keyless OpenStreetMap tiles with optional Esri Streets basemap toggle (zero API keys, zero watermarks).
 * 2. Strict coordinate normalization (detects swapped Delhi coords, falls back to stop catalog).
 * 3. Instant polyline render (<16ms) with casing and crowding colors; non-blocking background OSRM snapping.
 * 4. Station Marker A (Green) at Origin, Marker B (Red) at Destination, clickable middle-stop dots.
 * 5. Robust ResizeObserver and tab-switch size invalidation so map never renders gray.
 */
export function CommuterMap({
  origin = 'Anand Vihar',
  destination = 'Connaught Place',
  selectedRoute = null,
  stretches = [],
  selectedStretch = null,
  onSelectStretch = null,
  height = '460px',
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const stretchLayersRef = useRef({});
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Initialize Leaflet Map with keyless OpenStreetMap tiles & Esri toggle
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6250, 77.2150], // Central Delhi
        zoom: 12,
        minZoom: 9,
        maxZoom: 18,
        zoomControl: true
      });

      // Attach keyless OpenStreetMap tile layer with Esri Streets toggle
      createTransitTileLayer(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
      setIsMapReady(true);
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

  // 2. Render route, stretches, station pins, and middle stops
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup || !isMapReady) return;

    let isCancelled = false;

    const renderMapRoute = async () => {
      layerGroup.clearLayers();
      stretchLayersRef.current = {};

      const oCoords = normalizeCoord(selectedRoute?.origin_coords, origin);
      const dCoords = normalizeCoord(selectedRoute?.destination_coords, destination);

      // Extract active stretches
      const activeStretches = (selectedRoute?.stretches && selectedRoute.stretches.length > 0)
        ? selectedRoute.stretches
        : (stretches && stretches.length > 0 ? stretches : []);

      const hasRoute = Boolean(selectedRoute || activeStretches.length > 0);

      // If no route options returned yet, render Origin A and Destination B pins + immediate colored route polyline
      if (!hasRoute || activeStretches.length === 0) {
        const originMarker = createStationPinMarker(
          oCoords,
          'A',
          CROWDING_COLORS.SEATS_AVAILABLE,
          `<strong>Origin:</strong> ${origin}<br/><span style="font-size: 11px; color: #64748B;">Board bus here</span>`
        );
        const destMarker = createStationPinMarker(
          dCoords,
          'B',
          CROWDING_COLORS.CROWDED,
          `<strong>Destination:</strong> ${destination}<br/><span style="font-size: 11px; color: #64748B;">Alight bus here</span>`
        );

        layerGroup.addLayer(originMarker);
        layerGroup.addLayer(destMarker);

        // Immediately draw thick colored polyline connecting Point A to Point B (<16ms)
        const { casingPoly, routePoly } = createLayeredPolyline([oCoords, dCoords], CROWDING_COLORS.SEATS_AVAILABLE, 5);
        routePoly.bindPopup(`
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; padding: 2px;">
            <div style="font-weight: 700; color: #0F172A; margin-bottom: 4px;">${origin} &rarr; ${destination}</div>
            <div style="font-size: 11px; color: #64748B;">Direct transit path</div>
          </div>
        `);
        layerGroup.addLayer(casingPoly);
        layerGroup.addLayer(routePoly);

        try {
          map.fitBounds(L.latLngBounds([oCoords, dCoords]), { padding: [50, 50], maxZoom: 15 });
        } catch {
          map.setView(oCoords, 12);
        }
        setTimeout(() => map.invalidateSize(), 80);

        // Background upgrade to real Delhi road geometry via OSRM with 3s timeout
        fetchRoadGeometry([oCoords, dCoords]).then((roadCoords) => {
          if (!isCancelled && roadCoords && roadCoords.length > 1) {
            casingPoly.setLatLngs(roadCoords);
            routePoly.setLatLngs(roadCoords);
            try {
              map.fitBounds(L.latLngBounds(roadCoords), { padding: [50, 50], maxZoom: 15 });
            } catch {}
          }
        }).catch(() => {});

        return;
      }

      // 1. Synchronously resolve all stretch endpoints with strict normalization
      const initialStretches = activeStretches.map((st, idx) => {
        const fromName = st.from_stop_name || st.start_stop || (idx === 0 ? origin : 'Stop');
        const toName = st.to_stop_name || st.end_stop || (idx === activeStretches.length - 1 ? destination : 'Next Stop');
        
        // Strict normalization: checks backend GPS coords first, then falls back to stop name
        const fromCoord = normalizeCoord(st.from_coords || st.fromCoord || st.coordinates?.[0], fromName);
        const toCoord = normalizeCoord(st.to_coords || st.toCoord || st.coordinates?.[1], toName);
        const directDist = haversineDistanceKm(fromCoord, toCoord) * 1.25;

        return {
          ...st,
          from_stop_name: fromName,
          to_stop_name: toName,
          fromCoord,
          toCoord,
          distanceKm: st.distanceKm || st.distance_km || Math.max(0.4, parseFloat(directDist.toFixed(1))),
          roadCoords: [fromCoord, toCoord]
        };
      });

      const polylineMap = new Map();
      const allRoutePoints = [];

      // 2. Draw instant stop-to-stop polylines & middle stop markers (<16ms)
      initialStretches.forEach((st, idx) => {
        const rawLevel = (st.crowding_level || st.crowding || st.crowding_label || selectedRoute?.crowding_pill || 'SEATS_AVAILABLE').toUpperCase();
        const isRed = rawLevel.includes('CROWD') || rawLevel === 'RED';
        const isAmber = rawLevel.includes('STAND') || rawLevel.includes('MODERATE') || rawLevel === 'AMBER';

        const strokeColor = isRed ? CROWDING_COLORS.CROWDED : isAmber ? CROWDING_COLORS.STANDING_ROOM : CROWDING_COLORS.SEATS_AVAILABLE;
        const statusLabel = isRed ? 'Crowded' : isAmber ? 'Standing Room' : 'Seats Available';

        allRoutePoints.push(st.fromCoord, st.toCoord);

        // Layered polyline (White casing + Thick colored line)
        const { casingPoly, routePoly } = createLayeredPolyline([st.fromCoord, st.toCoord], strokeColor, 5);
        layerGroup.addLayer(casingPoly);

        const popupHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; line-height: 1.45; min-width: 210px; padding: 2px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 13px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 6px;">
              ${st.from_stop_name} &rarr; ${st.to_stop_name}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748B;">Bus Route:</span>
              <span style="font-weight: 700; color: #2563EB;">${st.route || selectedRoute?.route || 'DTC Bus'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748B;">Distance:</span>
              <span style="font-weight: 600; color: #334155;">${st.distanceKm} km</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748B;">Crowding:</span>
              <span style="font-weight: 700; color: ${strokeColor};">${statusLabel}</span>
            </div>
            ${st.passenger_count || st.estimated_passengers ? `
              <div style="display: flex; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #E2E8F0;">
                <span style="color: #64748B;">Est. Riders:</span>
                <span style="font-weight: 600; color: #0F172A;">~${st.passenger_count || st.estimated_passengers} riders</span>
              </div>
            ` : ''}
          </div>
        `;

        routePoly.bindPopup(popupHtml);
        routePoly.on('click', () => {
          if (onSelectStretch) onSelectStretch(st);
        });

        layerGroup.addLayer(routePoly);

        // Save reference for click-to-zoom
        const stretchKey = `${st.from_stop_name}_${st.to_stop_name}`;
        stretchLayersRef.current[stretchKey] = {
          poly: routePoly,
          bounds: L.latLngBounds([st.fromCoord, st.toCoord])
        };

        polylineMap.set(idx, { casingPoly, routePoly, stretchKey });

        // Middle Stop Marker (Intermediate stop circle)
        if (idx > 0) {
          const middleDot = createMiddleStopMarker(st.fromCoord, st.from_stop_name, statusLabel, strokeColor);
          layerGroup.addLayer(middleDot);
        }
      });

      // 3. Render extra middle stops if returned by live planner
      if (Array.isArray(selectedRoute?.middle_stops) && selectedRoute.middle_stops.length > 0) {
        selectedRoute.middle_stops.forEach((mStop) => {
          const mCoord = normalizeCoord(mStop.lat ? [mStop.lat, mStop.lng] : mStop, mStop.stop_name);
          allRoutePoints.push(mCoord);
          const mMarker = createMiddleStopMarker(
            mCoord,
            mStop.stop_name || 'Intermediate Stop',
            selectedRoute.crowding_pill || 'Seats Available',
            CROWDING_COLORS.SEATS_AVAILABLE
          );
          layerGroup.addLayer(mMarker);
        });
      }

      // 4. Origin Pin Marker "A" (Green)
      const originCoord = initialStretches[0]?.fromCoord || oCoords;
      const originMarker = createStationPinMarker(
        originCoord,
        'A',
        CROWDING_COLORS.SEATS_AVAILABLE,
        `<strong>Origin:</strong> ${origin}<br/><span style="font-size: 11px; color: #64748B;">Board bus here</span>`
      );
      layerGroup.addLayer(originMarker);

      // 5. Destination Pin Marker "B" (Red)
      const lastStretch = initialStretches[initialStretches.length - 1];
      const destCoord = lastStretch?.toCoord || dCoords;
      const destMarker = createStationPinMarker(
        destCoord,
        'B',
        CROWDING_COLORS.CROWDED,
        `<strong>Destination:</strong> ${destination}<br/><span style="font-size: 11px; color: #64748B;">Alight bus here</span>`
      );
      layerGroup.addLayer(destMarker);

      // 6. Immediately fitBounds so user sees the route path instantly (<16ms)
      if (allRoutePoints.length > 1) {
        try {
          const bounds = L.latLngBounds(allRoutePoints);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } catch {
          map.setView(originCoord, 13);
        }
      }

      setTimeout(() => map.invalidateSize(), 80);

      // 7. Non-blocking background upgrade: fetch road-snapped geometries from OSRM
      try {
        const resolvedStretches = await resolveStretchesRoadGeometry(activeStretches, origin, destination);
        if (isCancelled) return;

        const updatedPoints = [];
        resolvedStretches.forEach((st, idx) => {
          const refs = polylineMap.get(idx);
          if (refs && Array.isArray(st.roadCoords) && st.roadCoords.length > 1) {
            refs.casingPoly.setLatLngs(st.roadCoords);
            refs.routePoly.setLatLngs(st.roadCoords);
            st.roadCoords.forEach((pt) => updatedPoints.push(pt));

            if (stretchLayersRef.current[refs.stretchKey]) {
              stretchLayersRef.current[refs.stretchKey].bounds = L.latLngBounds(st.roadCoords);
            }
          }
        });

        if (updatedPoints.length > 1) {
          try {
            map.fitBounds(L.latLngBounds(updatedPoints), { padding: [50, 50], maxZoom: 15 });
          } catch {}
        }
      } catch (err) {
        // Fallback to straight line already drawn, zero user disruption
        console.warn('Non-blocking OSRM road geometry upgrade skipped:', err.message);
      }
    };

    renderMapRoute();

    return () => {
      isCancelled = true;
    };
  }, [selectedRoute, stretches, origin, destination, isMapReady]);

  // 3. Handle Zoom & Popup on Selected Stretch click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStretch) return;

    const fromName = selectedStretch.from_stop_name || selectedStretch.start_stop || selectedStretch.from;
    const toName = selectedStretch.to_stop_name || selectedStretch.end_stop || selectedStretch.to;
    const stretchKey = `${fromName}_${toName}`;

    const match = stretchLayersRef.current[stretchKey] ||
      Object.entries(stretchLayersRef.current).find(([k]) => k.includes(fromName) || k.includes(toName))?.[1];

    if (match && match.bounds) {
      map.fitBounds(match.bounds, { padding: [50, 50], maxZoom: 15 });
      if (match.poly && match.poly.openPopup) {
        setTimeout(() => match.poly.openPopup(), 120);
      }
    }
  }, [selectedStretch]);

  return (
    <div
      className={`delhi-commuter-map-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: height || '460px',
        minHeight: '400px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF'
        }}
        role="region"
        aria-label="Interactive Delhi Transit Map"
      />
    </div>
  );
}

export default CommuterMap;
