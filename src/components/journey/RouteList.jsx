import React from 'react';
import { RouteResult } from './RouteResult.jsx';

/**
 * Route Alternatives List Component
 */
export function RouteList({ routes = [], selectedIndex = 0, onSelectIndex }) {
  if (routes.length === 0) {
    return (
      <div style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
        No route options available.
      </div>
    );
  }

  return (
    <div className="route-options-list">
      {routes.map((option, idx) => (
        <RouteResult
          key={option.id || idx}
          routeOption={option}
          isSelected={idx === selectedIndex}
          onSelect={() => onSelectIndex(idx)}
        />
      ))}
    </div>
  );
}
