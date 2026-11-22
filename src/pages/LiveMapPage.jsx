import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { DelhiLeafletMap } from '../components/map/DelhiLeafletMap.jsx';
import { getCrowdingHeatmap } from '../services/trafficService.js';

/**
 * Live Map and Transit Corridor Explorer
 * Real geographic Leaflet rendering of Delhi transit network.
 * REST only, strictly NO polling loops or WebSockets.
 */
export function LiveMapPage({ onNavigate }) {
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [routesList, setRoutesList] = useState([]);
  const [origin, setOrigin] = useState('Anand Vihar');
  const [destination, setDestination] = useState('Connaught Place');

  // Load real routes once on mount via REST
  useEffect(() => {
    let isMounted = true;
    getCrowdingHeatmap()
      .then((data) => {
        if (isMounted && data.routes) {
          setRoutesList(data.routes.slice(0, 30));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCorridor = (item) => {
    setSelectedRoute(item.route);
    if (item.from) setOrigin(item.from);
    if (item.to) setDestination(item.to);
  };

  return (
    <PageLayout
      title="Live Delhi Transit Network Map"
      subtitle="Geographic tracking of Delhi bus corridors, terminals, and crowding distribution."
      actions={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {selectedRoute !== 'all' && (
            <button
              type="button"
              className="status-pill neutral"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => {
                setSelectedRoute('all');
                setOrigin('Anand Vihar');
                setDestination('Connaught Place');
              }}
              title="Clear selected corridor"
            >
              <span>Line {selectedRoute}</span>
              <span>&times;</span>
            </button>
          )}
          <Button variant="primary" size="sm" onClick={() => onNavigate('journey')}>
            Plan Journey on Route
          </Button>
        </div>
      }
    >
      <div className="live-map-wrapper" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '16px', height: 'calc(100vh - 180px)', minHeight: '550px' }}>
        {/* Left Corridors List */}
        <div className="ui-card" style={{ display: 'flex', flexDirection: 'column', padding: '14px', overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>
            Monitored Delhi Corridors
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '12px' }}>
            Select a corridor to center geographic polyline
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {routesList.map((r, i) => (
              <div
                key={i}
                onClick={() => handleSelectCorridor(r)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: selectedRoute === r.route ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: selectedRoute === r.route ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background 150ms ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-primary)' }}>
                    Route {r.route}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {r.passenger_count?.toLocaleString()} pax
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  {r.from} &rarr; {r.to}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Leaflet Map View */}
        <div className="ui-card" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
          <DelhiLeafletMap
            origin={origin}
            destination={destination}
            height="100%"
          />
        </div>
      </div>
    </PageLayout>
  );
}
