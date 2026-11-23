import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { searchDelhiTransit, splitHighlightParts } from '../../utils/fuzzySearch.js';

const POPULAR_DELHI_STOPS = [
  'Anand Vihar ISBT',
  'Mandi House Roundabout',
  'Mall Road Ring Road',
  'Model Town Ring Road',
  'Red Fort',
  'Karampura Terminal'
];

/**
 * Editorial Monochrome Suggestion Dropdown
 * Fully theme-safe: crisp in Light and Dark Mode with zero white-on-white text.
 */
function SuggestionDropdown({ results, query, onSelectStop }) {
  if (!results) return null;
  const { matchingStops = [], connectedRoutes = [], nearbyHubs = [] } = results;
  if (matchingStops.length === 0 && connectedRoutes.length === 0 && nearbyHubs.length === 0) return null;

  return (
    <div
      className="suggestion-dropdown"
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-line, #e2e2df)',
        borderRadius: 'var(--card-radius, 12px)',
        boxShadow: 'var(--shadow-elevated)',
        zIndex: 'var(--z-dropdown, 50)',
        maxHeight: '280px',
        overflowY: 'auto',
        padding: '4px 0'
      }}
    >
      {/* 1. Matching Stops */}
      {matchingStops.length > 0 && (
        <div>
          <div className="meta-label" style={{ padding: '8px 14px 4px', fontSize: '9px', color: 'var(--text-muted)' }}>
            Matching Delhi Stops
          </div>
          {matchingStops.map((st, i) => {
            const parts = splitHighlightParts(st.name, query);
            return (
              <div
                key={i}
                onClick={() => onSelectStop(st.name)}
                style={{
                  padding: '9px 14px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-line)',
                  color: 'var(--text-primary)',
                  transition: 'background-color 120ms ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ color: 'var(--text-primary)' }}>
                  {parts.map((p, idx) => (
                    <span
                      key={idx}
                      style={p.isMatch ? { fontWeight: 800, textDecoration: 'underline', color: 'var(--text-primary)' } : { fontWeight: 400, color: 'var(--text-primary)' }}
                    >
                      {p.text}
                    </span>
                  ))}
                </span>
                <span className="meta-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  SELECT &rarr;
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Connected Bus Routes */}
      {connectedRoutes.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-line)' }}>
          <div className="meta-label" style={{ padding: '8px 14px 4px', fontSize: '9px', color: 'var(--text-muted)' }}>
            Connected Routes Serving Area
          </div>
          {connectedRoutes.map((r, i) => (
            <div
              key={i}
              onClick={() => onSelectStop(r.servingStop)}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid var(--border-line)',
                color: 'var(--text-primary)',
                transition: 'background-color 120ms ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  fontWeight: 700,
                  fontSize: '10px'
                }}
              >
                {r.route}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                Via {r.servingStop}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * JourneySearch Component
 * Refined Monochrome styling, 1-letter instant fuzzy suggestions,
 * approachable radii (12px card, 8px inputs, 999px pills).
 */
export function JourneySearch({
  origin = 'Anand Vihar',
  onOriginChange,
  destination = 'Connaught Place',
  onDestinationChange,
  date,
  onDateChange,
  time = '18:00',
  onTimeChange,
  dayType = 'weekday',
  onDayTypeChange,
  onSwap,
  onSearch,
  onDemoPreset,
  priority = 'fastest',
  onPriorityChange,
  loading = false
}) {
  const { t } = useSettings();
  const [originResults, setOriginResults] = useState(null);
  const [destResults, setDestResults] = useState(null);
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  const originRef = useRef(null);
  const destRef = useRef(null);

  // Instant 1-letter debounced search for origin
  useEffect(() => {
    if (!origin || !origin.trim()) {
      setOriginResults(null);
      return;
    }
    const timer = setTimeout(() => {
      const res = searchDelhiTransit(origin, 6);
      setOriginResults(res);
    }, 120);
    return () => clearTimeout(timer);
  }, [origin]);

  // Instant 1-letter debounced search for destination
  useEffect(() => {
    if (!destination || !destination.trim()) {
      setDestResults(null);
      return;
    }
    const timer = setTimeout(() => {
      const res = searchDelhiTransit(destination, 6);
      setDestResults(res);
    }, 120);
    return () => clearTimeout(timer);
  }, [destination]);

  // Click outside to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (originRef.current && !originRef.current.contains(e.target)) {
        setShowOriginDrop(false);
      }
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChipClick = (station) => {
    if (!origin || origin === 'Anand Vihar') {
      if (station !== destination) {
        onOriginChange(station);
      } else {
        onDestinationChange(station);
      }
    } else {
      onDestinationChange(station);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowOriginDrop(false);
    setShowDestDrop(false);
    if (onSearch) onSearch();
  };

  return (
    <div
      className="ui-card journey-search-card"
      style={{
        padding: '16px 20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-line, #e2e2df)',
        borderRadius: 'var(--card-radius, 12px)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '16px'
      }}
    >
      <form onSubmit={handleFormSubmit}>
        {/* Step 1: Compact, Unclipped 1-Row Search Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: '10px',
            alignItems: 'center',
            width: '100%'
          }}
          className="planner-1row-grid"
        >
          {/* 1. Origin Stop Input with 1-Letter Fuzzy Suggestions */}
          <div ref={originRef} style={{ position: 'relative', minWidth: 0, gridColumn: 'span 2' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-line)',
                borderRadius: 'var(--input-radius, 8px)',
                padding: '0 12px',
                height: '42px',
                minWidth: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ flexShrink: 0, marginRight: '8px' }}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <input
                id="journey-origin"
                type="text"
                value={origin}
                onChange={(e) => {
                  onOriginChange(e.target.value);
                  setShowOriginDrop(true);
                }}
                onFocus={() => setShowOriginDrop(true)}
                placeholder={`${t('origin') || 'Origin Stop'} (e.g. Anand Vihar, CP)`}
                autoComplete="off"
                aria-label="Origin bus stop"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  minWidth: 0,
                  fontSize: '13px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Smart Autocomplete Dropdown */}
            {showOriginDrop && originResults && (
              <SuggestionDropdown
                results={originResults}
                query={origin}
                onSelectStop={(st) => {
                  onOriginChange(st);
                  setShowOriginDrop(false);
                }}
              />
            )}
          </div>

          {/* 2. Swap Origin & Destination Button */}
          <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0, width: '38px', justifySelf: 'center' }}>
            <button
              type="button"
              onClick={onSwap}
              aria-label={t('swap_stops') || 'Swap origin and destination'}
              title={t('swap_stops') || 'Swap origin and destination'}
              style={{
                width: '38px',
                height: '42px',
                borderRadius: 'var(--btn-radius, 8px)',
                border: '1px solid var(--border-line)',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 150ms ease'
              }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m7 16 5 5 5-5" />
                <path d="m7 8 5-5 5 5" />
              </svg>
            </button>
          </div>

          {/* 3. Destination Stop Input with 1-Letter Fuzzy Suggestions */}
          <div ref={destRef} style={{ position: 'relative', minWidth: 0, gridColumn: 'span 2' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-line)',
                borderRadius: 'var(--input-radius, 8px)',
                padding: '0 12px',
                height: '42px',
                minWidth: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" style={{ flexShrink: 0, marginRight: '8px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                id="journey-dest"
                type="text"
                value={destination}
                onChange={(e) => {
                  onDestinationChange(e.target.value);
                  setShowDestDrop(true);
                }}
                onFocus={() => setShowDestDrop(true)}
                placeholder={`${t('destination') || 'Destination Stop'} (e.g. Mandi House, KG)`}
                autoComplete="off"
                aria-label="Destination bus stop"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  minWidth: 0,
                  fontSize: '13px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Smart Autocomplete Dropdown */}
            {showDestDrop && destResults && (
              <SuggestionDropdown
                results={destResults}
                query={destination}
                onSelectStop={(st) => {
                  onDestinationChange(st);
                  setShowDestDrop(false);
                }}
              />
            )}
          </div>

          {/* 4. Day Type Selector */}
          <div style={{ minWidth: '105px' }}>
            <select
              id="journey-daytype"
              className="form-select"
              value={dayType}
              onChange={(e) => onDayTypeChange && onDayTypeChange(e.target.value)}
              aria-label="Day Type"
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-line)',
                borderRadius: 'var(--input-radius, 8px)',
                fontSize: '12.5px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 500,
                color: 'var(--text-primary)',
                padding: '0 10px',
                outline: 'none'
              }}
            >
              <option value="weekday">{t('language_label') === 'डिस्प्ले भाषा' ? 'सप्ताह का दिन' : 'Weekday'}</option>
              <option value="weekend">{t('language_label') === 'डिस्प्ले भाषा' ? 'सप्ताहांत' : 'Weekend'}</option>
            </select>
          </div>

          {/* 5. Departure Time Picker */}
          <div style={{ minWidth: '100px' }}>
            <input
              id="journey-time"
              type="time"
              value={time}
              onChange={(e) => onTimeChange && onTimeChange(e.target.value)}
              aria-label="Departure Time in IST"
              className="tabular-nums"
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-line)',
                borderRadius: 'var(--input-radius, 8px)',
                fontSize: '12.5px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 500,
                color: 'var(--text-primary)',
                padding: '0 10px',
                outline: 'none'
              }}
            />
          </div>

          {/* 6. Primary CTA Action Button */}
          <div style={{ minWidth: '130px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: 'var(--btn-radius, 8px)',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {loading ? (
                <span>{t('finding_routes') || 'Finding...'}</span>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <span>{t('find_routes') || 'Find Routes'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Directly beneath: Prominent 1-Click Demo Preset + Tidy Delhi Hub Chips + Clean Sort */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-line)'
          }}
        >
          {/* Left Group: 1-Click Demo Preset + Delhi Hubs Chips */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            {onDemoPreset && (
              <button
                type="button"
                onClick={onDemoPreset}
                className="chip active"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '30px',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  border: '1px solid var(--btn-bg)'
                }}
                title="Load verified Delhi bus corridor demo (Anand Vihar ISBT to Mandi House Roundabout)"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>{t('demo_preset') || '1-Click Demo Preset'}</span>
              </button>
            )}

            <div
              style={{
                width: '1px',
                height: '18px',
                backgroundColor: 'var(--border-line)',
                margin: '0 4px'
              }}
            />

            <span className="meta-label" style={{ color: 'var(--text-muted)' }}>
              {t('delhi_hubs') || 'Delhi Hubs'}:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {POPULAR_DELHI_STOPS.map((station) => {
                const isSelected = origin === station || destination === station;
                return (
                  <button
                    key={station}
                    type="button"
                    onClick={() => handleChipClick(station)}
                    className={`chip ${isSelected ? 'active' : ''}`}
                    title={`Select ${station}`}
                    style={{
                      height: '28px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      borderRadius: '999px'
                    }}
                  >
                    {station}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Group: Styled 999px Segmented Pills (Fastest | Least Crowded | Leave Later) */}
          {onPriorityChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="meta-label" style={{ color: 'var(--text-muted)' }}>
                SORT:
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '3px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '999px',
                  border: '1px solid var(--border-line)',
                  gap: '3px'
                }}
                role="radiogroup"
                aria-label="Route comparison sorting"
              >
                <button
                  type="button"
                  onClick={() => onPriorityChange('fastest')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    border: 'none',
                    backgroundColor: priority === 'fastest' ? 'var(--btn-bg)' : 'transparent',
                    color: priority === 'fastest' ? 'var(--btn-text)' : 'var(--text-muted)',
                    fontWeight: priority === 'fastest' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>{t('fastest') || 'Fastest'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPriorityChange('least_crowded')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    border: 'none',
                    backgroundColor: (priority === 'least_crowded' || priority === 'comfortable') ? 'var(--btn-bg)' : 'transparent',
                    color: (priority === 'least_crowded' || priority === 'comfortable') ? 'var(--btn-text)' : 'var(--text-muted)',
                    fontWeight: (priority === 'least_crowded' || priority === 'comfortable') ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>{t('more_comfortable') || 'Least Crowded'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPriorityChange('leave_later')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    border: 'none',
                    backgroundColor: (priority === 'leave_later' || priority === 'later') ? 'var(--btn-bg)' : 'transparent',
                    color: (priority === 'leave_later' || priority === 'later') ? 'var(--btn-text)' : 'var(--text-muted)',
                    fontWeight: (priority === 'leave_later' || priority === 'later') ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{t('leave_later') || 'Leave Later'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default JourneySearch;
