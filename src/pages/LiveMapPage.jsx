import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { DelhiLeafletMap } from '../components/map/DelhiLeafletMap.jsx';
import { getCrowdingHeatmap } from '../services/trafficService.js';

const DEFAULT_CORRIDORS = [
  { route: '975DOWN', from: 'Dtc Apartments / Dtc Colony Pitam Pura', to: 'Karampura Terminal', from_stop_name: 'Dtc Apartments / Dtc Colony Pitam Pura', to_stop_name: 'Karampura Terminal', passenger_count: 43 },
  { route: '740UP', from: 'Anand Vihar ISBT', to: 'Mandi House Roundabout', from_stop_name: 'Anand Vihar ISBT', to_stop_name: 'Mandi House Roundabout', passenger_count: 58 },
  { route: '433UP', from: 'ITO Delhi Gate', to: 'Mandi House Roundabout', from_stop_name: 'ITO Delhi Gate', to_stop_name: 'Mandi House Roundabout', passenger_count: 54 },
  { route: '790AUP', from: 'Red Fort', to: 'Mahipal Pur Extension', from_stop_name: 'Red Fort', to_stop_name: 'Mahipal Pur Extension', passenger_count: 48 },
  { route: '921UP', from: 'Mall Road Ring Road', to: 'Model Town-Ii', from_stop_name: 'Mall Road Ring Road', to_stop_name: 'Model Town-Ii', passenger_count: 39 },
  { route: '611ADOWN', from: 'Satya Niketan', to: 'Maharani Bagh', from_stop_name: 'Satya Niketan', to_stop_name: 'Maharani Bagh', passenger_count: 42 },
  { route: 'D-040UP', from: 'Sarojini Nagar Market', to: 'M Block Sarojini Nagar', from_stop_name: 'Sarojini Nagar Market', to_stop_name: 'M Block Sarojini Nagar', passenger_count: 36 }
];

/**
 * Live Map and Transit Corridor Explorer
 * Real geographic Leaflet rendering of Delhi transit network.
 * REST only, strictly NO polling loops or WebSockets.
 */
export function LiveMapPage({ onNavigate }) {
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [routesList, setRoutesList] = useState(DEFAULT_CORRIDORS);
  const [origin, setOrigin] = useState('Anand Vihar ISBT');
  const [destination, setDestination] = useState('Mandi House Roundabout');

  // Load real routes once on mount via REST
  useEffect(() => {
    let isMounted = true;
    getCrowdingHeatmap()
      .then((data) => {
        const routes = Array.isArray(data) ? data : (data && data.routes) ? data.routes : [];
        if (isMounted && routes.length > 0) {
          setRoutesList(routes.slice(0, 30));
          // Default to first corridor if available
          if (routes[0]) {
            setOrigin(routes[0].from_stop_name || routes[0].from || 'Anand Vihar');
            setDestination(routes[0].to_stop_name || routes[0].to || 'Connaught Place');
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCorridor = (item) => {
    setSelectedRoute(item.route);
    if (item.from_stop_name || item.from) setOrigin(item.from_stop_name || item.from);
    if (item.to_stop_name || item.to) setDestination(item.to_stop_name || item.to);
  };

  return (
    <PageLayout
      title="Live Delhi Transit Network Map"
      subtitle="Geographic tracking of Delhi bus corridors, terminals, and operational transit routes."
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
          <Button variant="secondary" size="sm" onClick={() => onNavigate('journey')}>
            Plan Journey on Route
          </Button>
        </div>
      }
    >
      <div className="live-map-wrapper" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '16px', height: 'calc(100vh - 180px)', minHeight: '550px' }}>
        {/* Left Corridors List */}
        <div className="ui-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden', borderRadius: 'var(--card-radius, 12px)', border: '1px solid var(--border-line)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
            Monitored Delhi Corridors
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Select a corridor to center geographic polyline
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {routesList.map((r, i) => {
              const fromName = r.from_stop_name || r.from || 'Origin Stop';
              const toName = r.to_stop_name || r.to || 'Destination Stop';
              const isSelected = selectedRoute === r.route;
              return (
                <div
                  key={i}
                  className={`corridor-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectCorridor(r)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--btn-radius, 8px)',
                    border: isSelected ? '1px solid var(--btn-bg)' : '1px solid var(--border-line)',
                    background: isSelected ? 'var(--bg-subtle)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                      Route {r.route}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {r.passenger_count ? `${r.passenger_count.toLocaleString()} passengers` : 'Seats Available'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {fromName} &rarr; {toName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Leaflet Map View */}
        <div className="ui-card" style={{ padding: 0, overflow: 'hidden', height: '100%', borderRadius: 'var(--card-radius, 12px)', border: '1px solid var(--border-line)', background: 'var(--bg-card)' }}>
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
