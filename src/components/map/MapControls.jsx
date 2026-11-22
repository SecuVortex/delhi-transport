import React from 'react';

/**
 * Floating Map Controls Component
 * Provides layer toggles, corridor route filter, bus search, and zoom buttons.
 */
export function MapControls({
  searchQuery,
  onSearchChange,
  selectedRouteFilter = 'all',
  onRouteFilterChange,
  layers,
  onToggleLayer,
  onZoomIn,
  onZoomOut
}) {
  return (
    <div className="live-map-toolbar">
      <div className="map-floating-bar" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {/* Search bus / stop */}
        <input
          type="text"
          className="form-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter bus ID or stop..."
          style={{ width: '160px', height: '32px', fontSize: '12px' }}
        />

        {/* Route Filter Dropdown */}
        {onRouteFilterChange && (
          <select
            className="form-select"
            value={selectedRouteFilter}
            onChange={(e) => onRouteFilterChange(e.target.value)}
            style={{ width: '130px', height: '32px', fontSize: '12px', padding: '0 8px' }}
          >
            <option value="all">All Corridors</option>
            <option value="101">Line 101</option>
            <option value="204">Line 204</option>
            <option value="305">Line 305</option>
            <option value="402">Line 402</option>
          </select>
        )}

        <div style={{ height: '20px', width: '1px', background: 'var(--color-border)' }} />

        {/* Layer Checkboxes */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={layers.buses}
            onChange={() => onToggleLayer('buses')}
          />
          <span>Buses</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={layers.routes}
            onChange={() => onToggleLayer('routes')}
          />
          <span>Routes</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={layers.traffic}
            onChange={() => onToggleLayer('traffic')}
          />
          <span>Traffic Overlay</span>
        </label>
      </div>

      {/* Zoom Controls */}
      <div className="map-floating-bar" style={{ gap: '4px' }}>
        <button
          type="button"
          className="map-ctrl-btn"
          onClick={onZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
        <button
          type="button"
          className="map-ctrl-btn"
          onClick={onZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
