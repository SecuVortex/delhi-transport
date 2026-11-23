import React, { useState, useEffect, useRef } from 'react';
import { searchDelhiTransit, splitHighlightParts } from '../../utils/fuzzySearch.js';

/**
 * Editorial Monochrome Global Search Overlay
 * Triggered by '/' or 'Ctrl+K' or Header Search Toggle button.
 * Supports instant 1-letter fuzzy matching, connected routes, and keyboard navigation.
 */
export function GlobalSearchModal({ isOpen, onClose, onSelectStop, onSelectRoute }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ matchingStops: [], connectedRoutes: [], nearbyHubs: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open & listen for Escape
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      setQuery('');
      setResults({ matchingStops: [], connectedRoutes: [], nearbyHubs: [] });
      setSelectedIndex(0);
    }
  }, [isOpen, onClose]);

  // Live 1-letter instant fuzzy query with 100ms debounce
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const res = searchDelhiTransit(query, 8);
      setResults(res);
      setSelectedIndex(0);
    }, 100);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  // Flatten selectable items for keyboard arrow navigation
  const flatItems = [
    ...results.matchingStops.map((s) => ({ type: 'stop', data: s })),
    ...results.connectedRoutes.map((r) => ({ type: 'route', data: r })),
    ...results.nearbyHubs.map((h) => ({ type: 'hub', data: { name: h } }))
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < flatItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = flatItems[selectedIndex];
      if (current) {
        if (current.type === 'stop' || current.type === 'hub') {
          onSelectStop && onSelectStop(current.data.name);
          onClose();
        } else if (current.type === 'route') {
          onSelectRoute && onSelectRoute(current.data.route);
          onClose();
        }
      }
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'stop' || item.type === 'hub') {
      onSelectStop && onSelectStop(item.data.name);
      onClose();
    } else if (item.type === 'route') {
      onSelectRoute && onSelectRoute(item.data.route);
      onClose();
    }
  };

  return (
    <div
      className="global-search-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(21, 20, 19, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 20px'
      }}
      onClick={onClose}
    >
      <div
        className="global-search-dialog"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--panel-bg, #ffffff)',
          border: '1px solid var(--border-line, #c8c8c8)',
          borderRadius: '4px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
          animation: 'runwayEntrance 180ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search Delhi transit stops and bus routes"
      >
        {/* Search Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-soft, #e4e4e4)',
            gap: '12px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-muted, #66625c)' }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type any letter (e.g. 'a', 'cp', 'mandi house', '740')..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '15px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 500,
              color: 'var(--text-primary, #151413)'
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted, #66625c)',
                padding: '4px'
              }}
              title="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted, #66625c)',
              border: '1px solid var(--border-soft, #e4e4e4)',
              borderRadius: '2px',
              padding: '2px 6px'
            }}
          >
            ESC
          </span>
        </div>

        {/* Results Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          {/* Section 1: Matching Stops */}
          {results.matchingStops.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div className="meta-label" style={{ marginBottom: '8px', paddingLeft: '4px' }}>
                Matching Delhi Stops ({results.matchingStops.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {results.matchingStops.map((stop, sIdx) => {
                  const isCur = selectedIndex === sIdx;
                  const parts = splitHighlightParts(stop.name, query);
                  return (
                    <div
                      key={stop.name}
                      onClick={() => handleItemClick({ type: 'stop', data: stop })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        backgroundColor: isCur ? 'var(--surface-subtle, #f5f5f4)' : 'transparent',
                        border: isCur ? '1px solid var(--border-line, #c8c8c8)' : '1px solid transparent',
                        transition: 'all 120ms ease'
                      }}
                      onMouseEnter={() => setSelectedIndex(sIdx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--surface-subtle, #f5f5f4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary, #151413)' }}>
                          {parts.map((p, pIdx) => (
                            <span key={pIdx} style={p.isMatch ? { fontWeight: 800, textDecoration: 'underline' } : { fontWeight: 400 }}>
                              {p.text}
                            </span>
                          ))}
                        </span>
                      </div>
                      <span className="meta-label" style={{ fontSize: '9px' }}>
                        DTC STOP &rarr;
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Connected Routes / Corridors */}
          {results.connectedRoutes.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div className="meta-label" style={{ marginBottom: '8px', paddingLeft: '4px' }}>
                Connected DTC Bus Routes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {results.connectedRoutes.map((routeObj, rIdx) => {
                  const globalIdx = results.matchingStops.length + rIdx;
                  const isCur = selectedIndex === globalIdx;
                  return (
                    <div
                      key={routeObj.route + rIdx}
                      onClick={() => handleItemClick({ type: 'route', data: routeObj })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        backgroundColor: isCur ? 'var(--surface-subtle, #f5f5f4)' : 'transparent',
                        border: isCur ? '1px solid var(--border-line, #c8c8c8)' : '1px solid transparent',
                        transition: 'all 120ms ease'
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: 'var(--accent, #151413)',
                            color: 'var(--on-accent, #ffffff)',
                            padding: '2px 6px',
                            borderRadius: '2px'
                          }}
                        >
                          {routeObj.route}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary, #151413)' }}>
                            {routeObj.corridor}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted, #66625c)' }}>
                            Serves {routeObj.servingStop}
                          </span>
                        </div>
                      </div>
                      <span className="meta-label" style={{ fontSize: '9px' }}>
                        VIEW ROUTE &rarr;
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Similar / Nearby Hubs */}
          {results.nearbyHubs.length > 0 && (
            <div>
              <div className="meta-label" style={{ marginBottom: '8px', paddingLeft: '4px' }}>
                Delhi Transit Hubs
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {results.nearbyHubs.map((hubName, hIdx) => {
                  const globalIdx = results.matchingStops.length + results.connectedRoutes.length + hIdx;
                  const isCur = selectedIndex === globalIdx;
                  return (
                    <button
                      key={hubName}
                      type="button"
                      className={`chip ${isCur ? 'active' : ''}`}
                      onClick={() => handleItemClick({ type: 'hub', data: { name: hubName } })}
                      style={{
                        border: isCur ? '1px solid var(--accent, #151413)' : '1px solid var(--border-line, #c8c8c8)',
                        backgroundColor: isCur ? 'var(--accent, #151413)' : 'transparent',
                        color: isCur ? 'var(--on-accent, #ffffff)' : 'var(--text-primary, #151413)'
                      }}
                    >
                      {hubName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {query.trim() &&
            results.matchingStops.length === 0 &&
            results.connectedRoutes.length === 0 && (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted, #66625c)' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                  No exact stops found for "{query}"
                </div>
                <div style={{ fontSize: '12px' }}>
                  Try entering an acronym like "cp", "av", "kg", "ai", or search "Anand Vihar".
                </div>
              </div>
            )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-soft, #e4e4e4)',
            backgroundColor: 'var(--surface-subtle, #f5f5f4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted, #66625c)'
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd style={{ fontWeight: 700 }}>&uarr;&darr;</kbd> Navigate</span>
            <span><kbd style={{ fontWeight: 700 }}>&crarr;</kbd> Select</span>
            <span><kbd style={{ fontWeight: 700 }}>ESC</kbd> Close</span>
          </div>
          <span style={{ fontSize: '10px', letterSpacing: '0.04em' }}>
            2.56M DUCKDB TICKETS INDEXED
          </span>
        </div>
      </div>
    </div>
  );
}
