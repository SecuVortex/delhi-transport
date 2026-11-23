import React from 'react';
import { RouteResult } from './RouteResult.jsx';
import { RouteCardSkeleton } from '../common/Skeletons.jsx';

/**
 * RouteList Component
 * Scannable route comparison cards, monochrome shimmer skeletons while loading,
 * and clean empty state with helpful commuter guidance.
 */
export function RouteList({
  routes = [],
  selectedIndex = 0,
  onSelectIndex,
  onSelectStretch = null,
  loading = false,
  priority = 'fastest'
}) {
  // 1. Loading State: ONLY show while loading is true (Monochrome Shimmer Skeletons)
  if (loading) {
    return <RouteCardSkeleton count={3} />;
  }

  // 2. Empty State: Loading finished and 0 route options found
  if (routes.length === 0) {
    return (
      <div
        className="ui-card empty-route-state"
        style={{
          padding: '28px 20px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--card-radius, 12px)',
          border: '1px solid var(--border-line)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          No Route Options Found
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.45 }}>
          No direct buses match the requested origin and destination. Try searching different nearby stops or check specific route numbers below.
        </div>
      </div>
    );
  }

  // 3. Populated Routes State: "X Route Options Found"
  const priorityLabel =
    priority === 'least_crowded' || priority === 'comfortable'
      ? 'Least Crowded'
      : priority === 'leave_later' || priority === 'later'
        ? 'Leave Later'
        : 'Fastest';

  return (
    <div className="route-options-list">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          padding: '0 4px'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {routes.length} Route Option{routes.length > 1 ? 's' : ''} Found
        </span>
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Sorted by: <strong style={{ color: 'var(--text-primary)' }}>{priorityLabel}</strong>
        </span>
      </div>

      {routes.map((option, idx) => (
        <RouteResult
          key={option.id || idx}
          routeOption={option}
          isSelected={idx === selectedIndex}
          onSelect={() => onSelectIndex(idx)}
          onSelectStretch={onSelectStretch}
        />
      ))}
    </div>
  );
}

export default RouteList;
