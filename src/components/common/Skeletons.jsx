import React from 'react';

/**
 * Primitive Monochrome Shimmer Box
 */
export function SkeletonBox({ width = '100%', height = '16px', borderRadius = '2px', style = {} }) {
  return (
    <div
      className="shimmer-skeleton"
      style={{
        width,
        height,
        borderRadius,
        display: 'inline-block',
        ...style
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Commuter Route Card Skeleton
 * Renders 3 structured placeholder cards mimicking the Fastest, Comfortable, and Later cards.
 */
export function RouteCardSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-cards-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '14px 16px',
            backgroundColor: 'var(--panel-bg, #ffffff)',
            border: '1px solid var(--border-soft, #e4e4e4)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
          aria-label="Loading route options from DuckDB..."
        >
          {/* Top row: Tag + Badge + Confidence */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <SkeletonBox width="80px" height="18px" borderRadius="2px" />
              <SkeletonBox width="65px" height="18px" borderRadius="2px" />
            </div>
            <SkeletonBox width="110px" height="16px" borderRadius="2px" />
          </div>

          {/* Timing row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
              <SkeletonBox width="60px" height="24px" borderRadius="2px" />
              <SkeletonBox width="90px" height="14px" borderRadius="2px" />
            </div>
            <SkeletonBox width="120px" height="20px" borderRadius="30px" />
          </div>

          {/* Distance and stops info */}
          <SkeletonBox width="180px" height="12px" borderRadius="2px" />

          {/* Crowding progress bar */}
          <SkeletonBox width="100%" height="6px" borderRadius="2px" />
        </div>
      ))}
    </div>
  );
}

/**
 * Operator KPI and Table Shimmer Skeleton
 */
export function OperatorKpiSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 KPI shimmer boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              backgroundColor: 'var(--panel-bg, #ffffff)',
              border: '1px solid var(--border-soft, #e4e4e4)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <SkeletonBox width="90px" height="12px" />
            <SkeletonBox width="130px" height="26px" />
            <SkeletonBox width="160px" height="10px" />
          </div>
        ))}
      </div>

      {/* Table rows skeleton */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--panel-bg, #ffffff)',
          border: '1px solid var(--border-soft, #e4e4e4)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <SkeletonBox width="180px" height="16px" />
          <SkeletonBox width="100px" height="16px" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--border-soft, #e4e4e4)'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <SkeletonBox width="28px" height="14px" />
              <SkeletonBox width="200px" height="14px" />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <SkeletonBox width="70px" height="14px" />
              <SkeletonBox width="80px" height="14px" />
              <SkeletonBox width="90px" height="14px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Translucent Map Loading Shimmer Overlay
 */
export function MapOverlaySkeleton({ label = 'Grounded in 2.56M DuckDB records...' }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(21, 20, 19, 0.88)',
        backdropFilter: 'blur(4px)',
        color: '#ffffff',
        padding: '6px 14px',
        borderRadius: '30px',
        fontSize: '11px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        letterSpacing: '0.02em',
        pointerEvents: 'none'
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="shimmer-skeleton"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ffffff'
        }}
      />
      <span>{label}</span>
    </div>
  );
}
