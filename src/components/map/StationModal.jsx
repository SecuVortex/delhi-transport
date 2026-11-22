import React from 'react';
import { Button } from '../common/Button.jsx';

const STATION_DEPARTURES = {
  'Central Station': [
    { line: '101', destination: 'West Tech Park', bay: 'Bay 1', time: '12:15', delay: 'On Time', type: 'success' },
    { line: '204', destination: 'Civic Loop Clockwise', bay: 'Bay 2', time: '12:20', delay: '+2 min', type: 'warning' },
    { line: '305', destination: 'Harbor Gateway', bay: 'Bay 3', time: '12:25', delay: 'On Time', type: 'success' },
    { line: '402', destination: 'University North Gate', bay: 'Bay 4', time: '12:30', delay: '+1 min', type: 'warning' }
  ],
  'Civic Center': [
    { line: '101', destination: 'West Tech Park', bay: 'Stop A', time: '12:22', delay: 'On Time', type: 'success' },
    { line: '204', destination: 'Central Station', bay: 'Stop B', time: '12:26', delay: '+1 min', type: 'warning' },
    { line: '305', destination: 'Harbor Gateway', bay: 'Stop C', time: '12:34', delay: 'On Time', type: 'success' }
  ],
  'State Library': [
    { line: '101', destination: 'West Tech Park', bay: 'Platform 1', time: '12:28', delay: 'On Time', type: 'success' },
    { line: '204', destination: 'Central Station', bay: 'Platform 2', time: '12:35', delay: '+3 min', type: 'warning' }
  ],
  'Tech Park Gate': [
    { line: '101', destination: 'Central Station', bay: 'Terminal 1', time: '12:35', delay: 'On Time', type: 'success' },
    { line: '402', destination: 'Harbor Gateway', bay: 'Terminal 2', time: '12:45', delay: 'On Time', type: 'success' }
  ],
  'Harbor Point': [
    { line: '305', destination: 'Central Station', bay: 'Pier Bay 1', time: '12:38', delay: 'On Time', type: 'success' },
    { line: '402', destination: 'Civic Center Loop', bay: 'Pier Bay 2', time: '12:48', delay: '+2 min', type: 'warning' }
  ]
};

/**
 * Station Departure Board Modal Component
 * Displays platform bays, scheduled departures, delay estimates, and transfer options for key hubs.
 */
export function StationModal({ stationName, isOpen, onClose, onPlanFromStation }) {
  if (!isOpen || !stationName) return null;

  const departures = STATION_DEPARTURES[stationName] || [
    { line: '101', destination: 'Central Station', bay: 'Bay 1', time: '12:20', delay: 'On Time', type: 'success' },
    { line: '204', destination: 'Civic Loop', bay: 'Bay 2', time: '12:28', delay: 'On Time', type: 'success' }
  ];

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" aria-labelledby="station-modal-title">
      <div className="modal-box" style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>
              TRANSIT HUB DEPARTURE BOARD
            </div>
            <div className="modal-title" id="station-modal-title">
              {stationName}
            </div>
          </div>
          <button
            type="button"
            className="ui-btn ui-btn-secondary"
            onClick={onClose}
            aria-label="Close station departure board"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Station Facilities Strip */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', background: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
          <span className="status-pill success" style={{ fontSize: '11px' }}>Step-Free Access</span>
          <span className="status-pill neutral" style={{ fontSize: '11px' }}>Sheltered Bay</span>
          <span className="status-pill neutral" style={{ fontSize: '11px' }}>Real-Time AVL Connected</span>
        </div>

        {/* Departure Board Table */}
        <div className="modal-body" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            Next Scheduled Departures (Live Tracking)
          </div>

          <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <table className="data-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '65px' }}>Line</th>
                  <th>Destination</th>
                  <th>Bay</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departures.map((dep, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="bus-tag" style={{ fontSize: '11px', padding: '2px 6px' }}>
                        {dep.line}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{dep.destination}</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{dep.bay}</td>
                    <td style={{ fontWeight: 600 }}>{dep.time}</td>
                    <td>
                      <span className={`status-pill ${dep.type}`} style={{ fontSize: '11px' }}>
                        {dep.delay}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (onPlanFromStation) onPlanFromStation(stationName);
              onClose();
            }}
          >
            Plan Journey from Here
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
