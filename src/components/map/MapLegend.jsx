import React from 'react';

/**
 * Functional Map Legend Component
 * Clearly indicates condition thresholds with functional colors.
 */
export function MapLegend() {
  return (
    <div className="map-legend-panel">
      <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '2px', color: 'var(--color-text)' }}>
        TRAFFIC CONDITIONS
      </div>
      <div className="legend-item">
        <span className="legend-color" style={{ background: 'var(--color-success)' }} />
        <span>Normal Flow (&lt; 2 min delay)</span>
      </div>
      <div className="legend-item">
        <span className="legend-color" style={{ background: 'var(--color-warning)' }} />
        <span>Moderate Congestion (2 - 5 min delay)</span>
      </div>
      <div className="legend-item">
        <span className="legend-color" style={{ background: 'var(--color-error)' }} />
        <span>Heavy Congestion (&gt; 5 min delay)</span>
      </div>
    </div>
  );
}
