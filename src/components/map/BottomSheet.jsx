import React from 'react';
import { Button } from '../common/Button.jsx';

/**
 * Mobile Bottom Sheet Component for Transit Vehicle Telemetry
 * Provides touch-friendly vehicle inspection docked to bottom of mobile viewports.
 */
export function BottomSheet({ bus, isOpen, onClose, onNavigate }) {
  if (!isOpen || !bus) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="bottom-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Drawer */}
      <div
        className="mobile-bottom-sheet"
        role="dialog"
        aria-label={`Bus ${bus.id} details`}
      >
        {/* Grab Handle */}
        <div className="bottom-sheet-handle-bar">
          <div className="bottom-sheet-handle" />
        </div>

        {/* Header */}
        <div className="bottom-sheet-header">
          <div className="bottom-sheet-title-group">
            <div className="bottom-sheet-kicker">VEHICLE TELEMETRY</div>
            <div className="bottom-sheet-title">
              {bus.id} - Route {bus.routeNumber}
            </div>
            <div className="bottom-sheet-subtitle">{bus.routeName}</div>
          </div>
          <div className="bottom-sheet-actions">
            <span className={`status-pill ${bus.statusType || 'success'}`}>
              {bus.status}
            </span>
            <button
              type="button"
              className="bottom-sheet-close-btn"
              onClick={onClose}
              aria-label="Close vehicle details"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="bottom-sheet-grid">
          <div className="bottom-sheet-card">
            <span className="bottom-sheet-label">Direction</span>
            <span className="bottom-sheet-val">{bus.direction}</span>
          </div>
          <div className="bottom-sheet-card">
            <span className="bottom-sheet-label">Speed</span>
            <span className="bottom-sheet-val">{bus.speed}</span>
          </div>
          <div className="bottom-sheet-card">
            <span className="bottom-sheet-label">Next Stop</span>
            <span className="bottom-sheet-val">{bus.nextStop}</span>
          </div>
          <div className="bottom-sheet-card">
            <span className="bottom-sheet-label">Arrival ETA</span>
            <span className="bottom-sheet-val primary-highlight">{bus.eta}</span>
          </div>
          <div className="bottom-sheet-card">
            <span className="bottom-sheet-label">Occupancy</span>
            <span className="bottom-sheet-val">{bus.occupancy}</span>
          </div>
          <div className="bottom-sheet-card">
            <span className="bottom-sheet-label">Last Ping</span>
            <span className="bottom-sheet-val">{bus.lastPing || 'Just now'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bottom-sheet-buttons">
          <Button
            variant="secondary"
            size="md"
            style={{ flex: 1 }}
            onClick={() => {
              if (onNavigate) onNavigate('routes');
              if (onClose) onClose();
            }}
          >
            View Route Details
          </Button>
          <Button
            variant="primary"
            size="md"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Track on Map
          </Button>
        </div>
      </div>
    </>
  );
}
