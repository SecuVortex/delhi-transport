import React from 'react';

/**
 * Dedicated Header for DTC Transit Planner
 * Zero commuter search clutter.
 * Features:
 * - 'DTC Transit Planner' profile badge with operational indicator
 * - 1-Click 'Switch to Commuter Profile' button
 * - 'Validation & Proof' modal trigger
 * - 'Model Assumptions' drawer toggle with dynamic parameter pills
 */
export function OperatorHeader({
  onSwitchProfile,
  onOpenValidationModal,
  onToggleAssumptions,
  isDrawerOpen,
  passMultiplier = 1.2,
  busSize = 'auto',
  onRefresh,
  isLoading = false
}) {
  return (
    <header className="operator-header" style={{
      background: '#0F172A',
      color: '#FFFFFF',
      borderBottom: '1px solid #1E293B',
      padding: '14px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Profile Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: '#F8FAFC' }}>
                Delhi Transit Operations & Congestion Control
              </h1>
              {/* DTC Transit Planner Profile Badge */}
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ADE80',
                border: '1px solid rgba(74, 222, 128, 0.4)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                letterSpacing: '0.02em'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                DTC Transit Planner
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              DuckDB OLAP Corridor Bottlenecks • Scaled Capacity Analytics • 2.56M ETM Ground Truth
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Model Assumptions Toggle */}
        <button
          type="button"
          onClick={onToggleAssumptions}
          style={{
            background: isDrawerOpen ? '#1E293B' : '#1E293B',
            color: '#E2E8F0',
            border: isDrawerOpen ? '1px solid #3B82F6' : '1px solid #334155',
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
          title="Adjust passenger multiplier & vehicle capacity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
          </svg>
          <span>Model Assumptions</span>
          <span style={{
            background: '#0F172A',
            color: '#60A5FA',
            padding: '1px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace'
          }}>
            {passMultiplier}x • {busSize.toUpperCase()}
          </span>
        </button>

        {/* Validation & Proof Modal Button */}
        <button
          type="button"
          onClick={onOpenValidationModal}
          style={{
            background: '#1E293B',
            color: '#E2E8F0',
            border: '1px solid #334155',
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
          title="View ML validation curves, stability metrics and data coverage"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Validation & Proof</span>
        </button>

        {/* Refresh Hotspots Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              background: '#1E293B',
              color: '#94A3B8',
              border: '1px solid #334155',
              padding: '7px 10px',
              borderRadius: '6px',
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Refresh hotspots"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}

        {/* 1-Click Switch to Commuter Profile Button */}
        <button
          type="button"
          onClick={() => onSwitchProfile && onSwitchProfile('commuter')}
          style={{
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: '#FFFFFF',
            border: 'none',
            padding: '7px 15px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.35)',
            transition: 'all 0.15s ease'
          }}
          title="Switch to Commuter Profile (Journey Planner)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
          </svg>
          <span>Switch to Commuter Profile</span>
        </button>
      </div>
    </header>
  );
}
