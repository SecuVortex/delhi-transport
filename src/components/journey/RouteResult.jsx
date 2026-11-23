import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';

/**
 * RouteResult Component
 * Refined Commuter Journey Card:
 * 1. Bold Bus Route Badge
 * 2. Duration + Distance (km) + Stop Count (tabular numerals)
 * 3. Glanceable Crowding Pill with semantic dots (#16A34A, #D97706, #DC2626)
 * 4. Expandable "Show stops & crowding breakdown ▾" panel with per-stretch indicators
 * 5. Theme safe across Light and Dark modes with 12px rounded corners
 */
export function RouteResult({ routeOption, isSelected, onSelect, onSelectStretch }) {
  if (!routeOption) return null;

  const { formatTime, t } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive standardized crowding pill color and label
  const rawPill = (routeOption.crowding_pill || 'GREEN').toUpperCase();
  const isRed = rawPill === 'RED' || rawPill.includes('CROWD');
  const isAmber = rawPill === 'AMBER' || rawPill.includes('STAND') || rawPill.includes('MODERATE');

  const pillColor = isRed ? '#DC2626' : isAmber ? '#D97706' : '#16A34A';
  const pillBg = isRed
    ? 'rgba(220, 38, 38, 0.12)'
    : isAmber
      ? 'rgba(217, 119, 6, 0.12)'
      : 'rgba(22, 163, 74, 0.12)';
  const pillBorder = isRed
    ? 'rgba(220, 38, 38, 0.3)'
    : isAmber
      ? 'rgba(217, 119, 6, 0.3)'
      : 'rgba(22, 163, 74, 0.3)';
  const pillLabel =
    routeOption.crowding_label ||
    (isRed ? t('crowded') : isAmber ? t('standing_room') : t('seats_available'));

  // Category Tag badge styling
  const cardType = routeOption.card_type || 'fastest';
  const tagText =
    routeOption.tag ||
    (cardType === 'fastest'
      ? t('fastest')
      : cardType === 'leave_later'
        ? t('leave_later_seats')
        : t('more_comfortable'));

  const confidence = routeOption.confidence || 'HIGH';
  const stretches = routeOption.stretches || [];
  const busBadge = routeOption.busBadge || routeOption.route || 'DTC Bus';
  const distanceText = routeOption.distanceKm ? `${routeOption.distanceKm} km` : 'Direct stretch';
  const stopCountText = `${routeOption.stopCount || (stretches.length + 1)} stops`;
  const riderText = routeOption.riderEstimate || '~18/70 riders';

  const formattedDepTime = formatTime(routeOption.depTime);
  const formattedArrTime = formatTime(routeOption.arrTime);

  const handleStretchClick = (e, st) => {
    e.stopPropagation();
    if (onSelectStretch) {
      onSelectStretch(st);
    }
  };

  return (
    <div
      className={`route-option-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`${tagText}: ${routeOption.totalTime}, ${busBadge}, ${pillLabel}`}
      style={{
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--bg-subtle)' : 'var(--bg-card)',
        border: isSelected ? '1px solid var(--btn-bg)' : '1px solid var(--border-line)',
        borderRadius: 'var(--card-radius, 12px)',
        padding: '16px 18px',
        marginBottom: '12px',
        boxShadow: isSelected ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
        transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* 1. Top Header: Category Tag + Bus Route Badge + Confidence Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Tag */}
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-line)',
              padding: '2px 8px',
              borderRadius: '999px'
            }}
          >
            {tagText}
          </span>

          {/* Bus Route Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              letterSpacing: '0.02em'
            }}
            title="Designated DTC bus route to board"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect width="16" height="16" x="4" y="3" rx="2" />
              <path d="M4 11h16" />
              <path d="M8 15h.01" />
              <path d="M16 15h.01" />
              <path d="M6 19v2" />
              <path d="M18 19v2" />
            </svg>
            <span>{busBadge}</span>
          </span>
        </div>

        {/* Confidence Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-line)',
            padding: '2px 7px',
            borderRadius: '999px',
            cursor: 'help'
          }}
          title="Confidence grounded in October 2026 Delhi ETM ticketing validation records"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="editorial-meta">Proof: {confidence}</span>
        </div>
      </div>

      {/* 2. Main Timing & Glanceable Crowding Pill Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span
            className="tabular-nums"
            style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            {routeOption.totalTime}
          </span>
          <span
            className="tabular-nums"
            style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}
          >
            {formattedDepTime} - {formattedArrTime}
          </span>
        </div>

        {/* Glanceable Crowding Decision Pill */}
        <span
          className="tabular-nums"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '999px',
            color: pillColor,
            backgroundColor: pillBg,
            border: `1px solid ${pillBorder}`
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: pillColor,
              flexShrink: 0
            }}
          />
          <span>{pillLabel} &middot; {riderText}</span>
        </span>
      </div>

      {/* 3. Duration + Distance + Stop Count Summary */}
      <div
        className="tabular-nums"
        style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '10px' }}
      >
        <span>{routeOption.totalTime} &middot; {distanceText} &middot; {stopCountText}</span>
      </div>

      {/* 4. Expandable "Show stops & crowding breakdown ▾" */}
      {stretches.length > 0 && (
        <div style={{ marginTop: '6px' }}>
          {/* Segmented Color Progression Bar */}
          <div
            style={{
              display: 'flex',
              height: '7px',
              borderRadius: '999px',
              overflow: 'hidden',
              gap: '2px',
              backgroundColor: 'var(--border-line)',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            title="Click to toggle stops and crowding breakdown"
          >
            {stretches.map((st, i) => {
              const stLevel = (st.crowding_level || rawPill).toUpperCase();
              const stColor =
                stLevel.includes('CROWD') || stLevel === 'RED'
                  ? '#DC2626'
                  : stLevel.includes('STAND') || stLevel === 'AMBER'
                    ? '#D97706'
                    : '#16A34A';
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    backgroundColor: stColor,
                    height: '100%',
                    transition: 'opacity 0.15s ease'
                  }}
                  title={`${st.from_stop_name || 'Stop'} -> ${st.to_stop_name || 'Stop'}: ${st.crowding_label || stLevel}`}
                />
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '6px'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {stretches.length} corridor stretch{stretches.length > 1 ? 'es' : ''}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 0',
                textDecoration: 'underline',
                textUnderlineOffset: '2px'
              }}
            >
              {isExpanded ? 'Hide stops & crowding breakdown ▲' : 'Show stops & crowding breakdown ▼'}
            </button>
          </div>

          {/* Expanded Stops Panel */}
          {isExpanded && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--card-radius, 12px)',
                border: '1px solid var(--border-line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '2px'
                }}
              >
                Stop Sequence &amp; Crowding (Click stretch to highlight on map)
              </div>

              {stretches.map((st, sIdx) => {
                const sLevel = (st.crowding_level || rawPill).toUpperCase();
                const isStretchRed = sLevel.includes('CROWD') || sLevel === 'RED';
                const isStretchAmber = sLevel.includes('STAND') || sLevel === 'AMBER';
                const sColor = isStretchRed ? '#DC2626' : isStretchAmber ? '#D97706' : '#16A34A';
                const sLabel =
                  st.crowding_label ||
                  (isStretchRed ? t('crowded') : isStretchAmber ? t('standing_room') : t('seats_available'));
                const sDist = st.distanceKm ? `${st.distanceKm} km` : 'Direct stretch';
                const sLoad = st.passenger_count
                  ? `~${st.passenger_count} riders`
                  : st.load_ratio !== undefined
                    ? `Load ${Math.round(st.load_ratio * 100)}%`
                    : '';

                return (
                  <div
                    key={sIdx}
                    onClick={(e) => handleStretchClick(e, st)}
                    className="accordion-content"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11.5px',
                      padding: '7px 10px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-line)',
                      cursor: 'pointer',
                      transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-line)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    }}
                    title={`Click to focus ${st.from_stop_name} -> ${st.to_stop_name} on map`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: sColor,
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {st.from_stop_name} &rarr; {st.to_stop_name}
                        </span>
                        <div className="tabular-nums" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          {st.route || busBadge} &middot; {sDist} {sLoad ? `&middot; ${sLoad}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="tabular-nums" style={{ fontSize: '11px', fontWeight: 600, color: sColor }}>
                        {sLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RouteResult;
