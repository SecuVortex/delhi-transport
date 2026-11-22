import React from 'react';
import { StatusIndicator } from '../common/StatusIndicator.jsx';

/**
 * Key Station Departures Table Component
 */
export function TrafficSummary({ nearbyStops = [] }) {
  return (
    <div className="ui-card">
      <div className="ui-card-header">
        <div>
          <div className="ui-card-title">Key Station Departures</div>
          <div className="ui-card-subtitle">Estimated departures from major interchanges.</div>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Lines</th>
              <th>Departure</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {nearbyStops.map((stop) => (
              <tr key={stop.name}>
                <td style={{ fontWeight: 600 }}>{stop.name}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {stop.lines.map((line) => (
                      <span key={line} className="bus-tag">
                        Route {line}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {stop.nextArrival}
                </td>
                <td>
                  <StatusIndicator
                    status={stop.status}
                    type={stop.status === 'On Time' ? 'success' : 'warning'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
