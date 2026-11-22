import React from 'react';

/**
 * Route Result Alternative Card Component
 * Displays 1-second glanceable crowding pill (Green / Amber / Red),
 * confidence badge, route duration, and stretch crowding indicators.
 */
export function RouteResult({ routeOption, isSelected, onSelect }) {
  if (!routeOption) return null;

  const pill = (routeOption.crowding_pill || 'GREEN').toUpperCase();
  const isGreen = pill === 'GREEN';
  const isAmber = pill === 'AMBER';
  const isRed = pill === 'RED';

  const pillClass = isRed ? 'error' : isAmber ? 'warning' : 'success';
  const pillLabel = isRed ? 'High Crowding' : isAmber ? 'Moderate Load' : 'Seats Available';

  const isLowConfidence = (routeOption.confidence || '').toUpperCase() === 'LOW';

  return (
    <div
      className={`route-option-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <div className="route-card-top">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span className="route-time-total">{routeOption.totalTime}</span>
          <span className="route-time-span">
            {routeOption.depTime} - {routeOption.arrTime}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* 1-Second Glanceable Crowding Decision Pill */}
          <span className={`status-pill ${pillClass}`} style={{ fontWeight: 600, fontSize: '11px' }}>
            {pillLabel}
          </span>

          {/* Confidence Badge */}
          <span
            className="status-pill neutral"
            style={{
              fontSize: '10px',
              borderStyle: isLowConfidence ? 'dashed' : 'solid',
              borderColor: isLowConfidence ? 'var(--color-warning)' : 'var(--color-border)'
            }}
            title={isLowConfidence ? 'Estimated crowding: verify with operator' : 'Historical ticket model confidence'}
          >
            {routeOption.confidence || 'MEDIUM'}
          </span>
        </div>
      </div>

      {/* Route Corridor Summary */}
      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text)', marginTop: '4px' }}>
        {routeOption.from_stop_id} to {routeOption.to_stop_id}
      </div>

      {/* Per-Stretch Crowding Bar (Glanceable Segmented Bar) */}
      {routeOption.stretches && routeOption.stretches.length > 0 && (
        <div style={{ margin: '8px 0 4px 0' }}>
          <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '2px', background: 'var(--color-surface-muted)' }}>
            {routeOption.stretches.map((st, i) => {
              const stLevel = (st.crowding_level || pill).toUpperCase();
              const stColor = stLevel === 'RED' ? 'var(--color-error)' : stLevel === 'AMBER' ? 'var(--color-warning)' : 'var(--color-success)';
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: stColor,
                    height: '100%'
                  }}
                  title={`${st.from_stop_name} to ${st.to_stop_name}: ${stLevel}`}
                />
              );
            })}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {routeOption.stretches.length} stretch segment{routeOption.stretches.length > 1 ? 's' : ''} evaluated
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="route-card-metrics" style={{ marginTop: '6px' }}>
        <span>Transfers: {routeOption.transfers}</span>
        <span>Walk: {routeOption.walkingDist}</span>
        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Fare: {routeOption.fare}</span>
      </div>
    </div>
  );
}
