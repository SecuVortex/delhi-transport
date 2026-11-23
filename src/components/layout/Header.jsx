import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { getSystemHealth } from '../../services/trafficService.js';
import { ProofModal } from '../common/ProofModal.jsx';
import { GlobalSearchModal } from '../common/GlobalSearchModal.jsx';
import { RunningBusLogo } from '../common/RunningBusLogo.jsx';

/**
 * Top Navigation Bar Component (Fitts's Law & Hick's Law Optimized)
 * High-frequency controls right at hand with zero crowding:
 * Left:  Brand + subtle live backend indicator dot.
 * Right: Search Toggle (🔍 /) -> Theme Toggle (☀️/🌙) -> Language Pill (EN | हिं) -> Role Dropdown (Commuter ▾ / Operator ▾).
 */
export function Header({
  activePageLabel,
  onOpenMobile,
  onNavigate,
  activeProfile = 'commuter',
  onSelectProfile,
  activeRole,
  onSelectRole,
  onOpenProofModal,
  onSelectStop,
  onSelectRoute
}) {
  const { resolvedTheme, toggleTheme, language, setLanguage, t } = useSettings();
  const currentProfile = activeProfile || activeRole || 'commuter';
  const handleProfileChange = onSelectProfile || onSelectRole;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [internalProofOpen, setInternalProofOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const handleOpenProof = () => {
    if (onOpenProofModal) {
      onOpenProofModal();
    } else {
      setInternalProofOpen(true);
    }
  };

  const [healthStatus, setHealthStatus] = useState({
    isOnline: true,
    latencyMs: 42,
    totalTickets: 2232041,
    gtfsMode: 'inferred',
    dbReady: true
  });

  // Query backend health once on mount (REST only, NO polling loops)
  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      const startTime = performance.now();
      try {
        const data = await getSystemHealth();
        const latency = Math.round(performance.now() - startTime);
        if (isMounted) {
          setHealthStatus({
            isOnline: Boolean(data?.status === 'ok' || data?.db_ready),
            latencyMs: latency,
            totalTickets: data?.total_tickets || 2232041,
            gtfsMode: data?.gtfs_mode || 'inferred',
            dbReady: data?.db_ready ?? true
          });
        }
      } catch {
        if (isMounted) {
          setHealthStatus((prev) => ({
            ...prev,
            isOnline: false,
            latencyMs: null
          }));
        }
      }
    };
    checkBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut '/' or 'Ctrl+K' / 'Cmd+K' to open global search
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (
        (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K'))
      ) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to dismiss profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStopSelected = (stopName) => {
    setIsSearchModalOpen(false);
    if (onSelectStop) {
      onSelectStop(stopName);
    } else if (onNavigate) {
      onNavigate('journey');
    }
  };

  const handleRouteSelected = (routeName) => {
    setIsSearchModalOpen(false);
    if (onSelectRoute) {
      onSelectRoute(routeName);
    } else if (onNavigate) {
      onNavigate('live-map');
    }
  };

  return (
    <header className="top-header" role="banner">
      {/* Left: Hamburger (mobile), Brand + Subtle Live Backend Indicator */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open mobile navigation"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* Brand & Breadcrumb */}
        <div className="header-brand-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <RunningBusLogo size={20} />
          <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            MetroTransit
          </span>
          <span className="breadcrumb-slash" style={{ color: 'var(--border-line)', fontSize: '13px' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }} className="breadcrumb-active">
            {activePageLabel}
          </span>
        </div>

        {/* Subtle Live Backend Dot Indicator */}
        <button
          type="button"
          className="live-status-pill"
          onClick={handleOpenProof}
          title={`Backend: ${healthStatus.isOnline ? 'Online (DuckDB In-Memory)' : 'Offline'}. 2.56M tickets. Latency: ${healthStatus.latencyMs ? `${healthStatus.latencyMs}ms` : 'n/a'}. Click to view ground-truth validation.`}
          aria-label="Backend status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
            borderRadius: '999px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-line)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            height: '24px',
            marginLeft: '4px',
            flexShrink: 0
          }}
        >
          <span
            className="live-status-dot"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: healthStatus.isOnline ? '#16A34A' : '#DC2626',
              boxShadow: healthStatus.isOnline ? '0 0 0 2px rgba(22, 163, 74, 0.25)' : 'none',
              flexShrink: 0
            }}
          />
          <span className="live-status-text" style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
            {healthStatus.isOnline ? 'Live' : 'Offline'}
          </span>
        </button>
      </div>

      {/* Right (Spaced cleanly with gap-2, zero crowding):
          1. Search Toggle (🔍 /)
          2. Theme Toggle (☀️/🌙)
          3. Language Pill (EN | हिं)
          4. User Role Switcher Dropdown (Everyday Commuter ▾ / DTC Operator ▾)
      */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* 1. Global Search Toggle */}
        <button
          type="button"
          className="search-toggle-btn"
          onClick={() => setIsSearchModalOpen(true)}
          title="Search Delhi transit stops, routes & hubs (Press / or ⌘K)"
          aria-label="Open Global Search"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-line)',
            color: 'var(--text-muted)',
            padding: '4px 10px',
            borderRadius: 'var(--btn-radius, 8px)',
            fontSize: '12px',
            cursor: 'pointer',
            height: '32px',
            transition: 'all 160ms ease'
          }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }} className="search-btn-label">
            Search
          </span>
          <span
            className="search-btn-slash"
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-line)',
              borderRadius: '4px',
              padding: '1px 4px',
              marginLeft: '2px'
            }}
          >
            /
          </span>
        </button>

        {/* 2. Theme Toggle (1-Click Light ↔ Dark) */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          title={resolvedTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--btn-radius, 8px)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-line)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 160ms ease'
          }}
        >
          {resolvedTheme === 'dark' ? (
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#F59E0B" strokeWidth="2.2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* 3. Language Pill (EN | हिं) */}
        <button
          type="button"
          className="lang-pill-btn"
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          title="Switch Language / भाषा बदलें (English | हिन्दी)"
          aria-label="Toggle interface language"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-line)',
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            height: '32px',
            transition: 'all 160ms ease'
          }}
        >
          <span style={{ color: language === 'en' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: language === 'en' ? 700 : 500 }}>
            EN
          </span>
          <span style={{ opacity: 0.35, color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: language === 'hi' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: language === 'hi' ? 700 : 500 }}>
            हिं
          </span>
        </button>

        {/* 4. User Role Switcher Dropdown (Everyday Commuter ▾ / DTC Operator ▾) */}
        <div ref={profileMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Switch User Role or Profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--btn-radius, 8px)',
              border: '1px solid var(--border-line)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              height: '32px',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 160ms ease'
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9.5px',
                fontWeight: 700
              }}
            >
              {currentProfile === 'operator' ? 'OP' : 'CM'}
            </div>
            <span className="profile-btn-label">
              {currentProfile === 'operator' ? (t('dtc_planner') || 'DTC Operator') : (t('everyday_commuter') || 'Everyday Commuter')}
            </span>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isProfileOpen && (
            <div
              className="popover-menu open"
              role="dialog"
              aria-label="User role switcher menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '290px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--card-radius, 12px)',
                border: '1px solid var(--border-line)',
                boxShadow: 'var(--shadow-elevated)',
                zIndex: 'var(--z-dropdown, 50)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '9px 12px',
                  borderBottom: '1px solid var(--border-line)',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)'
                }}
              >
                {language === 'hi' ? 'उपयोगकर्ता भूमिका चुनें' : 'Select User Role'}
              </div>

              <div style={{ padding: '6px' }}>
                {/* Profile 1: Everyday Commuter */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (handleProfileChange) handleProfileChange('commuter');
                    setIsProfileOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (handleProfileChange) handleProfileChange('commuter');
                      setIsProfileOpen(false);
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: currentProfile === 'commuter' ? 'var(--bg-subtle)' : 'transparent',
                    border: currentProfile === 'commuter' ? '1px solid var(--border-line)' : '1px solid transparent',
                    marginBottom: '4px',
                    transition: 'all 120ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                        {t('everyday_commuter') || 'Everyday Commuter'}
                      </span>
                    </div>
                    {currentProfile === 'commuter' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                    Find fastest &amp; least-crowded bus routes, inspect middle stops.
                  </div>
                </div>

                {/* Profile 2: DTC Operator / Planner */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (handleProfileChange) handleProfileChange('operator');
                    setIsProfileOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (handleProfileChange) handleProfileChange('operator');
                      setIsProfileOpen(false);
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: currentProfile === 'operator' ? 'var(--bg-subtle)' : 'transparent',
                    border: currentProfile === 'operator' ? '1px solid var(--border-line)' : '1px solid transparent',
                    transition: 'all 120ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                        {t('dtc_planner') || 'DTC Operator'}
                      </span>
                    </div>
                    {currentProfile === 'operator' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                    Spot corridor bottlenecks, test capacity assumptions &amp; deploy extra buses.
                  </div>
                </div>
              </div>

              {/* Bottom Nav to Validation & Proof */}
              <div style={{ borderTop: '1px solid var(--border-line)', padding: '6px 8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleOpenProof();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}
                >
                  <span>{t('validation_proof') || 'Validation & Ground Truth'}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#16A34A' }}>2.56M</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Instant Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectStop={handleStopSelected}
        onSelectRoute={handleRouteSelected}
      />

      {/* Validation & Ground Truth Proof Modal */}
      <ProofModal
        isOpen={internalProofOpen}
        onClose={() => setInternalProofOpen(false)}
      />
    </header>
  );
}

export default Header;
