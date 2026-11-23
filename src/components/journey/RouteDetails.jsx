import React from 'react';

/**
 * Step-by-Step Route Itinerary Details Component
 * Clean vertical timeline illustrating boarding, walking links, and transfers.
 */
export function RouteDetails({ routeOption }) {
  if (!routeOption) return null;

  return (
    <div className="itinerary-details">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>
            {routeOption.title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {routeOption.depTime} departure from {routeOption.from_stop_id || 'Origin'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="status-pill success">{routeOption.totalTime}</span>
          <span className="status-pill neutral" style={{ fontSize: '10px' }}>
            {routeOption.confidence || 'HIGH'}
          </span>
        </div>
      </div>

      <div className="timeline">
        {routeOption.steps.map((step, index) => {
          const isEndpoint = index === 0 || index === routeOption.steps.length - 1;
          const isWalk = step.type === 'walk';
          return (
            <div key={index} className="timeline-step">
              <div
                className={`timeline-node ${isEndpoint ? 'active' : ''}`}
                style={isWalk ? { borderColor: 'var(--color-text-muted)', borderStyle: 'dashed' } : {}}
              />
              <div className="timeline-step-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{step.label}</span>
                {isWalk && (
                  <span className="status-pill neutral" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                    Walk
                  </span>
                )}
              </div>
              <div className="timeline-step-desc">{step.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Time-Dependent Segment Predictions Breakdown */}
      {routeOption.stretches && routeOption.stretches.length > 0 && (
        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Segment Travel-Time Predictions (ML Inference)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {routeOption.stretches.map((st, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  padding: '4px 6px',
                  background: 'var(--color-surface-muted)',
                  borderRadius: '4px'
                }}
              >
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                  {st.from_stop_name || 'Stop'} &rarr; {st.to_stop_name || 'Next'}
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {st.predicted_seconds && (
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      {Math.round(st.predicted_seconds / 60)} min ({Math.round(st.predicted_seconds)}s)
                    </span>
                  )}
                  {st.data_source && (
                    <span className="status-pill neutral" style={{ fontSize: '9px', padding: '0 4px' }}>
                      {st.data_source.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
