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
            {routeOption.depTime} departure from Central Station
          </div>
        </div>
        <span className="status-pill success">{routeOption.totalTime}</span>
      </div>

      <div className="timeline">
        {routeOption.steps.map((step, index) => {
          const isEndpoint = index === 0 || index === routeOption.steps.length - 1;
          return (
            <div key={index} className="timeline-step">
              <div className={`timeline-node ${isEndpoint ? 'active' : ''}`} />
              <div className="timeline-step-title">{step.label}</div>
              <div className="timeline-step-desc">{step.detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
