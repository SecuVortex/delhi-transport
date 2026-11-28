import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { searchDelhiTransit, splitHighlightParts } from '../../utils/fuzzySearch.js';

const POPULAR_DTC_ROUTES = [
  { route: '740UP', from: 'Anand Vihar ISBT', to: 'Mandi House Roundabout', corridor: 'Anand Vihar ISBT → Mandi House' },
  { route: '433UP', from: 'ITO Delhi Gate', to: 'Mandi House Roundabout', corridor: 'New Delhi Station → Badarpur Border' },
  { route: '975DOWN', from: 'Dtc Apartments / Dtc Colony Pitam Pura', to: 'Karampura Terminal', corridor: 'Pitam Pura → Karampura Terminal' },
  { route: '790AUP', from: 'Red Fort', to: 'Mahipal Pur Extension', corridor: 'Red Fort → Mahipalpur' },
  { route: '921UP', from: 'Mall Road Ring Road', to: 'Model Town-Ii', corridor: 'Kashmere Gate → Model Town' },
  { route: '611ADOWN', from: 'Satya Niketan', to: 'Maharani Bagh', corridor: 'Satya Niketan → Maharani Bagh' },
  { route: 'D-040UP', from: 'Sarojini Nagar Market', to: 'M Block Sarojini Nagar', corridor: 'Sarojini Nagar Market → M Block' },
  { route: '543DOWN', from: 'Anand Vihar ISBT', to: 'Safdarjung Terminal', corridor: 'Anand Vihar → Safdarjung Terminal' },
  { route: '85AUP', from: 'Anand Vihar ISBT', to: 'Punjabi Bagh Terminal', corridor: 'Anand Vihar → Punjabi Bagh Terminal' },
  { route: '442UP', from: 'AIIMS', to: 'Nehru Place Terminal', corridor: 'AIIMS → Nehru Place Terminal' },
  { route: '894UP', from: 'Connaught Place', to: 'Karampura Terminal', corridor: 'Connaught Place → Karampura' },
  { route: '502UP', from: 'Kashmere Gate ISBT', to: 'Mehrauli Terminal', corridor: 'Kashmere Gate → Mehrauli Terminal' }
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
        maxHeight: '260px',
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
 * Iconic "Where is my Train" Style Bus Journey Planner Card
 * Unified Origin / Destination card with left route connector rail,
 * floating circular swap button with 180° rotation, 50/50 schedule row,
 * full-width primary CTA, secondary quick bus lookup bar, and hub chips.
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
  onSelectRoute,
  priority = 'fastest',
  onPriorityChange,
  loading = false
}) {
  const { t } = useSettings();
  const [originResults, setOriginResults] = useState(null);
  const [destResults, setDestResults] = useState(null);
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  // Floating swap button rotation state
  const [swapRotation, setSwapRotation] = useState(0);

  // Secondary Quick Bus Route Lookup Bar state
  const [routeQuery, setRouteQuery] = useState('');
  const [showRouteDrop, setShowRouteDrop] = useState(false);

  const originRef = useRef(null);
  const destRef = useRef(null);
  const routeRef = useRef(null);
  const originInputRef = useRef(null);
  const destInputRef = useRef(null);

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
      if (routeRef.current && !routeRef.current.contains(e.target)) {
        setShowRouteDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwapClick = () => {
    setSwapRotation((prev) => prev + 180);
    if (onSwap) onSwap();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowOriginDrop(false);
    setShowDestDrop(false);
    setShowRouteDrop(false);
    if (onSearch) onSearch();
  };

  // Quick Route selection
  const handleSelectBusRoute = (item) => {
    setRouteQuery(item.route);
    setShowRouteDrop(false);
    if (item.from) onOriginChange(item.from);
    if (item.to) onDestinationChange(item.to);
    if (onSelectRoute) onSelectRoute(item.route);
    if (onSearch) setTimeout(onSearch, 50);
  };

  const filteredRoutes = POPULAR_DTC_ROUTES.filter((r) => {
    if (!routeQuery.trim()) return false;
    const q = routeQuery.toLowerCase().trim();
    return (
      r.route.toLowerCase().includes(q) ||
      r.from.toLowerCase().includes(q) ||
      r.to.toLowerCase().includes(q) ||
      r.corridor.toLowerCase().includes(q)
    );
  });

  return (
    <div className="wimt-journey-container" style={{ marginBottom: 0 }}>
      {/* 1. Iconic "Where is my Train" Unified Card (Single Clean Surface Container) */}
      <div
        className="ui-card wimt-card"
        style={{
          padding: '16px 18px',
          backgroundColor: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-line, #e2e2df)',
          borderRadius: 'var(--card-radius, 12px)',
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}
      >
        <form onSubmit={handleFormSubmit}>
          {/* Main Origin & Destination Stops Group (No Nested Inner Box Border) */}
          <div
            className="wimt-stops-group"
            style={{
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {/* Left Route Connector Rail (Hollow Green Circle -> Connecting Line -> Hollow Red Circle) */}
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: 0,
                bottom: 0,
                width: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                pointerEvents: 'none',
                zIndex: 6
              }}
              aria-hidden="true"
            >
              {/* Origin Hollow Circle (Green #16A34A) */}
              <div
                style={{
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  border: '2.5px solid #16A34A',
                  backgroundColor: 'var(--bg-card)',
                  flexShrink: 0
                }}
              />

              {/* Connecting Vertical Arrow Line */}
              <div
                style={{
                  width: '1.5px',
                  flex: 1,
                  backgroundColor: 'var(--border-line)',
                  margin: '4px 0',
                  minHeight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>

              {/* Destination Hollow Circle (Red #DC2626) */}
              <div
                style={{
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  border: '2.5px solid #DC2626',
                  backgroundColor: 'var(--bg-card)',
                  flexShrink: 0
                }}
              />
            </div>

            {/* Top Row: From Stop (Origin) */}
            <div ref={originRef} style={{ position: 'relative', width: '100%' }}>
              <div
                className="wimt-stop-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '48px',
                  paddingLeft: '44px',
                  paddingRight: '88px',
                  position: 'relative'
                }}
              >
                <input
                  ref={originInputRef}
                  id="journey-origin"
                  className="wimt-stop-input"
                  type="text"
                  value={origin}
                  onChange={(e) => {
                    onOriginChange(e.target.value);
                    setShowOriginDrop(true);
                  }}
                  onFocus={() => setShowOriginDrop(true)}
                  placeholder="From Stop (Origin, e.g. Anand Vihar, CP)"
                  autoComplete="off"
                  aria-label="Origin bus stop"
                  style={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: '13.5px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}
                />

                {/* Clear '×' button for Origin */}
                {origin && (
                  <button
                    type="button"
                    onClick={() => {
                      onOriginChange('');
                      originInputRef.current?.focus();
                    }}
                    title="Clear origin"
                    aria-label="Clear origin stop"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      zIndex: 8
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
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

            {/* Single Inset Hairline Divider separating From and To (Clear of Left Connector Rail) */}
            <div className="wimt-stops-divider" aria-hidden="true" />

            {/* Floating Circular Swap Button (Overlapping divider line at right: 44px) */}
            <button
              type="button"
              onClick={handleSwapClick}
              aria-label={t('swap_stops') || 'Swap origin and destination'}
              title="Swap From and To stops"
              style={{
                position: 'absolute',
                right: '44px',
                top: '50%',
                transform: `translateY(-50%) rotate(${swapRotation}deg)`,
                transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1), background-color 150ms ease, box-shadow 150ms ease',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-line)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                zIndex: 20
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7 16 5 5 5-5" />
                <path d="M12 21V9" />
                <path d="m17 8-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
            </button>

            {/* Bottom Row: To Stop (Destination) */}
            <div ref={destRef} style={{ position: 'relative', width: '100%' }}>
              <div
                className="wimt-stop-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '48px',
                  paddingLeft: '44px',
                  paddingRight: '88px',
                  position: 'relative'
                }}
              >
                <input
                  ref={destInputRef}
                  id="journey-dest"
                  className="wimt-stop-input"
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    onDestinationChange(e.target.value);
                    setShowDestDrop(true);
                  }}
                  onFocus={() => setShowDestDrop(true)}
                  placeholder="To Stop (Destination, e.g. Mandi House, KG)"
                  autoComplete="off"
                  aria-label="Destination bus stop"
                  style={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: '13.5px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}
                />

                {/* Clear '×' button for Destination */}
                {destination && (
                  <button
                    type="button"
                    onClick={() => {
                      onDestinationChange('');
                      destInputRef.current?.focus();
                    }}
                    title="Clear destination"
                    aria-label="Clear destination stop"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      zIndex: 8
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
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
          </div>

          {/* Compact Side-by-Side Schedule Row (50/50 Split) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginTop: '10px'
            }}
          >
            {/* Left 50%: Day Type Selector */}
            <div style={{ position: 'relative' }}>
              <select
                id="journey-daytype"
                className="form-select wimt-schedule-control"
                value={dayType}
                onChange={(e) => onDayTypeChange && onDayTypeChange(e.target.value)}
                aria-label="Day Type"
                style={{
                  width: '100%',
                  height: '42px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  padding: '0 12px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="weekday">{t('language_label') === 'डिस्प्ले भाषा' ? 'सप्ताह का दिन (Weekday)' : 'Weekday Schedule'}</option>
                <option value="weekend">{t('language_label') === 'डिस्प्ले भाषा' ? 'सप्ताहांत (Weekend)' : 'Weekend Schedule'}</option>
              </select>
            </div>

            {/* Right 50%: Departure Time (IST) */}
            <div style={{ position: 'relative' }}>
              <input
                id="journey-time"
                type="time"
                value={time}
                onChange={(e) => onTimeChange && onTimeChange(e.target.value)}
                aria-label="Departure Time in IST"
                className="tabular-nums wimt-schedule-control"
                style={{
                  width: '100%',
                  height: '42px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  padding: '0 12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Full-Width Primary CTA (Find Routes) */}
          <div style={{ marginTop: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: 'var(--btn-radius, 8px)',
                fontSize: '13.5px',
                fontWeight: 700,
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {loading ? (
                <span>{t('finding_routes') || 'Finding Best Routes...'}</span>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <span>{t('find_routes') || 'Find Bus Routes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Quick Bus Route Lookup Bar (Directly beneath main card) */}
      <div
        ref={routeRef}
        className="quick-route-lookup-bar"
        style={{
          marginTop: '8px',
          padding: '6px 10px 6px 14px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-line)',
          borderRadius: 'var(--card-radius, 12px)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          position: 'relative',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 6v6" />
            <path d="M15 6v6" />
            <path d="M2 12h19.6" />
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
          </svg>
        </div>

        <input
          type="text"
          className="wimt-route-input"
          value={routeQuery}
          onChange={(e) => {
            setRouteQuery(e.target.value);
            setShowRouteDrop(true);
          }}
          onFocus={() => setShowRouteDrop(true)}
          placeholder="Bus No. / Route Name (e.g. 740UP, 433UP, 975DOWN, 0114)..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            background: 'transparent',
            fontSize: '12.5px',
            color: 'var(--text-primary)',
            padding: '6px 0',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}
        />

        {routeQuery && (
          <button
            type="button"
            onClick={() => setRouteQuery('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
            title="Clear route"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            const match = POPULAR_DTC_ROUTES.find((r) => r.route.toLowerCase().includes(routeQuery.toLowerCase().trim()));
            if (match) handleSelectBusRoute(match);
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-line)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          Check Route
        </button>

        {/* Route Autocomplete Suggestions */}
        {showRouteDrop && filteredRoutes.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-line)',
              borderRadius: 'var(--card-radius, 12px)',
              boxShadow: 'var(--shadow-elevated)',
              zIndex: 'var(--z-dropdown, 50)',
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px 0'
            }}
          >
            <div className="meta-label" style={{ padding: '6px 14px', fontSize: '9px', color: 'var(--text-muted)' }}>
              Matching DTC Bus Routes ({filteredRoutes.length})
            </div>
            {filteredRoutes.map((r, i) => (
              <div
                key={i}
                onClick={() => handleSelectBusRoute(r)}
                style={{
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-line)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  transition: 'background-color 120ms ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--btn-bg)',
                      color: 'var(--btn-text)',
                      fontWeight: 700,
                      fontSize: '10.5px'
                    }}
                  >
                    {r.route}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {r.corridor}
                  </span>
                </div>
                <span className="meta-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  APPLY &rarr;
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Sort Bar (Flows cleanly straight into Route Results) */}
      {onPriorityChange && (
        <div
          className="wimt-sort-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '10px'
          }}
        >
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
        </div>
      )}
    </div>
  );
}

export default JourneySearch;
