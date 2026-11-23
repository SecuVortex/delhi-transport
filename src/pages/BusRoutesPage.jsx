import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { StatusIndicator } from '../components/common/StatusIndicator.jsx';
import { getBusRoutes } from '../services/busService.js';

/**
 * Bus Routes Directory Page Component
 * Shows Delhi bus routes dynamically populated from live /crowding/heatmap.
 */
export function BusRoutesPage({ onNavigate }) {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('number');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getBusRoutes()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setRoutes(data);
          setSelectedRouteId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRoutes = routes
    .filter((r) => {
      const q = searchQuery.toLowerCase();
      return (
        (r.number && r.number.toLowerCase().includes(q)) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.origin && r.origin.toLowerCase().includes(q)) ||
        (r.destination && r.destination.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'duration') {
        return parseInt(a.duration || 0, 10) - parseInt(b.duration || 0, 10);
      }
      return (a.number || '').localeCompare(b.number || '');
    });

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <PageLayout
      title="Bus Routes Directory"
      subtitle="Delhi transit lines, corridor alignments, operational frequencies, and stop sequences."
    >
      {/* Filter Toolbar */}
      <div className="ui-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="global-search-container" style={{ width: '280px' }}>
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route number or stop..."
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <label className="form-label" htmlFor="sort-routes" style={{ margin: 0 }}>
              Sort:
            </label>
            <select
              id="sort-routes"
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ height: '36px' }}
            >
              <option value="number">Route Number</option>
              <option value="duration">Travel Time</option>
            </select>
          </div>

          {loading && (
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Querying backend routes...
            </span>
          )}
        </div>
      </div>

      {/* Split View: Table & Selected Route Details */}
      <div className="routes-layout">
        <div className="ui-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', maxHeight: '560px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Route Corridor</th>
                  <th>Origin Stop</th>
                  <th>Destination Stop</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => {
                    const isSelected = route.id === selectedRouteId;
                    return (
                      <tr
                        key={route.id}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--color-surface-muted)' : undefined,
                          fontWeight: isSelected ? 600 : undefined
                        }}
                        onClick={() => setSelectedRouteId(route.id)}
                      >
                        <td>
                          <span className="bus-tag">Route {route.number}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{route.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                            {route.corridor} Corridor
                          </div>
                        </td>
                        <td>{route.origin}</td>
                        <td>{route.destination}</td>
                        <td>{route.frequency}</td>
                        <td>{route.duration}</td>
                        <td>
                          <StatusIndicator
                            status={route.status}
                            type={route.status === 'Active' ? 'success' : 'warning'}
                          />
                        </td>
                        <td>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRouteId(route.id);
                            }}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                      {loading ? 'Querying backend routes...' : 'No routes found. Verify backend connection.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Route Detail Card */}
        {selectedRoute && (
          <div className="ui-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="bus-tag" style={{ fontSize: '13px', padding: '3px 8px' }}>
                    Route {selectedRoute.number}
                  </span>
                  <StatusIndicator
                    status={selectedRoute.status}
                    type={selectedRoute.status === 'Active' ? 'success' : 'warning'}
                  />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
                  {selectedRoute.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {selectedRoute.origin} to {selectedRoute.destination}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Operating Frequency</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedRoute.frequency}</div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                padding: '12px 0',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '12px',
                marginTop: '12px'
              }}
            >
              <div>
                <div style={{ color: 'var(--color-text-secondary)' }}>Operating Hours</div>
                <div style={{ fontWeight: 600 }}>{selectedRoute.operatingHours || '05:30 - 23:00'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-secondary)' }}>Average Delay</div>
                <div
                  style={{
                    fontWeight: 600,
                    color: selectedRoute.status === 'Active' ? 'var(--color-success)' : 'var(--color-warning)'
                  }}
                >
                  {selectedRoute.delayAvg || 'Nominal'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-secondary)' }}>On-Time Rate</div>
                <div style={{ fontWeight: 600 }}>{selectedRoute.onTimeRate || '95%'}</div>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '10px' }}>
                Stop Sequence ({selectedRoute.stops ? selectedRoute.stops.length : 0} Recorded Stages)
              </div>
              <div className="route-stops-timeline" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                  selectedRoute.stops.map((stop, idx) => (
                    <div key={stop.name || idx} className="stop-row-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', width: '18px' }}>
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text)' }}>
                            {stop.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            Transfer: {stop.transfer || 'Direct stage'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {stop.time}
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            color: stop.accessible ? 'var(--color-success)' : 'var(--color-text-muted)'
                          }}
                        >
                          {stop.accessible ? 'Accessible' : 'Standard'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '12px', color: '#64748B', padding: '8px 0' }}>
                    Direct corridor link between {selectedRoute.origin} and {selectedRoute.destination}.
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <Button
                variant="primary"
                onClick={() => {
                  if (onNavigate) onNavigate('journey');
                }}
              >
                Plan Journey with this Route
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
