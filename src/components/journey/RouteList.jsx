import React from 'react';
import { RouteResult } from './RouteResult.jsx';
import { RouteCardSkeleton } from '../common/Skeletons.jsx';

/**
 * RouteList Component
 * Fix 3: Fix Stuck Loading Text.
 * - Shows editorial monochrome RouteCardSkeleton with 100deg shimmer while loading.
 * - Shows 'X Route Options Found' when loading is complete and routes are available.
 * - Shows a helpful Empty State with 1-click Demo Preset button when 0 routes are found.
 */
export function RouteList({
  routes = [],
  selectedIndex = 0,
  onSelectIndex,
  onSelectStretch = null,
  loading = false,
  priority = 'fastest',
  onDemoPreset
}) {
  // 1. Loading State: ONLY show while loading is true (Monochrome Shimmer Skeletons)
  if (loading) {
    return <RouteCardSkeleton count={3} />;
  }

  // 2. Empty State: Loading finished and 0 route options found
  if (routes.length === 0) {
    return (
      <div
        style={{
          padding: '24px 16px',
          textAlign: 'center',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
          No Route Options Found
        </div>
        <div style={{ fontSize: '12px', color: '#64748B', maxWidth: '320px', lineHeight: 1.4 }}>
          No connecting buses match the requested origin and destination. Try our verified Delhi corridor demo.
        </div>
        {onDemoPreset && (
          <button
            type="button"
            onClick={onDemoPreset}
            style={{
              marginTop: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 14px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>1-Click Demo Preset</span>
          </button>
        )}
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
          marginBottom: '8px',
          padding: '0 2px'
        }}
      >
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
          {routes.length} Route Option{routes.length > 1 ? 's' : ''} Found
        </span>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
          Sorted by: <strong style={{ color: '#2563EB' }}>{priorityLabel}</strong>
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
