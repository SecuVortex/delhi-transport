import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { getSystemHealth } from '../../services/trafficService.js';
import { ProofModal } from '../common/ProofModal.jsx';
import { GlobalSearchModal } from '../common/GlobalSearchModal.jsx';

/**
 * Top Navigation Bar Component
 * Minimal, sticky, accessible, with real backend DuckDB connection status,
 * Proof Modal access, and editorial monochrome global search modal trigger.
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
  const { resolvedTheme, toggleTheme, t } = useSettings();
  const currentProfile = activeProfile || activeRole || 'commuter';
  const handleProfileChange = onSelectProfile || onSelectRole;

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [internalProofOpen, setInternalProofOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const handleOpenProof = () => {
    if (onOpenProofModal) {
      onOpenProofModal();
    } else {
      setInternalProofOpen(true);
    }
  };
  const [healthStatus, setHealthStatus] = useState({
    isOnline: false,
    latencyMs: null,
    totalTickets: 2232041,
    gtfsMode: 'inferred',
    dbReady: true
  });

  // Query backend health once on mount (REST only, NO polling loop)
  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      const startTime = performance.now();
      try {
        const data = await getSystemHealth();
        const latency = Math.round(performance.now() - startTime);
        if (isMounted) {
          setHealthStatus({
            isOnline: data.status === 'ok' || data.db_ready,
            latencyMs: latency,
            totalTickets: data.total_tickets || 2232041,
            gtfsMode: data.gtfs_mode || 'inferred',
            dbReady: data.db_ready ?? true
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
      <div className="header-left">
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

        <nav className="breadcrumb-container" aria-label="Breadcrumb">
          <span>Platform</span>
          <span>/</span>
          <span className="breadcrumb-active">{activePageLabel}</span>
        </nav>

        {/* Live Backend Connection Indicator */}
        <div
          className="sim-indicator"
          title={`Backend status: ${healthStatus.isOnline ? 'Online (DuckDB In-Memory)' : 'Offline'}. Total tickets: ${healthStatus.totalTickets.toLocaleString()}. Latency: ${healthStatus.latencyMs ? `${healthStatus.latencyMs}ms` : 'n/a'}.`}
          style={{ cursor: 'pointer' }}
          onClick={handleOpenProof}
        >
          <span
            className="sim-indicator-dot"
            style={{
              backgroundColor: healthStatus.isOnline ? '#16A34A' : '#DC2626'
            }}
          />
          <span>
            {healthStatus.isOnline ? 'Live: DuckDB' : 'Backend Offline'}
            {healthStatus.latencyMs ? ` (${healthStatus.latencyMs}ms)` : ''}
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Prominent Validation & Proof Ground Truth Button */}
        <button
          type="button"
          onClick={handleOpenProof}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text)',
            fontSize: '11.5px',
            fontWeight: 700,
            padding: '4px 10px',
            height: '30px',
            cursor: 'pointer'
          }}
          title="Inspect October 2026 ground-truth peak curves, weekly stability, and DuckDB metrics"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {t('validation_proof') || 'Validation & Proof'}
          <span
            style={{
              fontSize: '10px',
              background: '#DCFCE7',
              color: '#166534',
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: 700
            }}
          >
            2.56M
          </span>
        </button>

        {/* Editorial Monochrome Global Search Trigger Button */}
        <button
          type="button"
          className="search-toggle-btn"
          onClick={() => setIsSearchModalOpen(true)}
          title="Search Delhi transit stops, routes, and hubs (Press / or ⌘K)"
          aria-label="Open Global Search"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-subtle, #f5f5f4)',
            border: '1px solid var(--border-line, #c8c8c8)',
            color: 'var(--text-muted, #66625c)',
            padding: '5px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            height: '32px'
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span style={{ color: 'var(--text-primary, #151413)', fontWeight: 500 }}>Search Delhi Transit</span>
          <span
            className="shortcut-pill"
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              background: 'var(--stage-bg, #ffffff)',
              border: '1px solid var(--border-line, #c8c8c8)',
              color: 'var(--text-muted, #66625c)',
              padding: '1px 5px',
              borderRadius: '3px',
              marginLeft: '4px'
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Notifications Popover Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="header-action-btn"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            aria-label="View notifications"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="notif-badge" />
          </button>

          {isNotifOpen && (
            <div className="popover-menu open" role="dialog" aria-label="Notifications panel">
              <div className="popover-header">
                <span>System Notifications</span>
                <span className="status-pill warning" style={{ fontSize: '11px' }}>
                  2 Active
                </span>
              </div>
              <div className="popover-list">
                <div
                  className="popover-item"
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigate('alerts');
                  }}
                >
                  <div className="popover-item-title">
                    <span>Anand Vihar Corridor High Load</span>
                    <span className="status-pill warning" style={{ fontSize: '10px' }}>
                      Crowded
                    </span>
                  </div>
                  <div className="popover-item-desc">
                    Evening peak load exceeding 85% capacity towards Connaught Place.
                  </div>
                  <div className="popover-item-time">10 min ago</div>
                </div>

                <div
                  className="popover-item"
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigate('analytics');
                  }}
                >
                  <div className="popover-item-title">
                    <span>DuckDB Analytical Engine Ready</span>
                    <span className="status-pill success" style={{ fontSize: '10px' }}>
                      Healthy
                    </span>
                  </div>
                  <div className="popover-item-desc">
                    All 2.55M tickets indexed and accessible for journey planning queries.
                  </div>
                  <div className="popover-item-time">Active</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Light / Dark Theme Toggle Button */}
        <button
          type="button"
          className="header-action-btn theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          title={resolvedTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {resolvedTheme === 'dark' ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F59E0B" strokeWidth="2">
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
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748B" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Profile Popover Trigger: User Role / Profile Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            aria-label="Switch User Role or Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer'
            }}
          >
            <div className="user-avatar-sm" style={{ fontWeight: 800, fontSize: '11px' }}>DT</div>
            <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text)' }}>
              {currentProfile === 'operator' ? (t('dtc_planner') || 'DTC Operator') : (t('everyday_commuter') || 'Everyday Commuter')}
            </span>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isProfileOpen && (
            <div
              className="popover-menu open"
              role="dialog"
              aria-label="User role and navigation menu"
              style={{
                width: '320px',
                right: 0,
                backgroundColor: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                zIndex: 1000
              }}
            >
              <div className="popover-header" style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                <span>{t('language_label') === 'डिस्प्ले भाषा' ? 'उपयोगकर्ता भूमिका चुनें' : 'Select User Role'}</span>
              </div>

              {/* Clickable Profile 1: Everyday Commuter */}
              <div style={{ padding: '8px' }}>
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
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: currentProfile === 'commuter' ? 'var(--color-surface-hover)' : 'transparent',
                    border: currentProfile === 'commuter' ? '1px solid var(--color-primary)' : '1px solid transparent',
                    marginBottom: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
                        <circle cx="6" cy="19" r="3" />
                        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                        <circle cx="18" cy="5" r="3" />
                      </svg>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
                        {t('everyday_commuter') || 'Everyday Commuter'}
                      </span>
                    </div>
                    {currentProfile === 'commuter' && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: 1.35, paddingLeft: '20px' }}>
                    Find the fastest or least-crowded bus, inspect middle stops &amp; crowding.
                  </div>
                </div>

                {/* Clickable Profile 2: DTC Bus Operator / Planner */}
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
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: currentProfile === 'operator' ? 'var(--color-surface-hover)' : 'transparent',
                    border: currentProfile === 'operator' ? '1px solid var(--color-primary)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 3v18h18" />
                        <path d="M18 17V9" />
                        <path d="M13 17V5" />
                        <path d="M8 17v-3" />
                      </svg>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
                        {t('dtc_planner') || 'DTC Bus Operator / Planner'}
                      </span>
                    </div>
                    {currentProfile === 'operator' && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: 1.35, paddingLeft: '20px' }}>
                    Spot overloaded corridors, test capacity assumptions &amp; deploy extra buses.
                  </div>
                </div>
              </div>

              {/* Clean Divider */}
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '2px 0' }} />

              {/* Below Divider: Validation & Proof (2.56M) and User Guide */}
              <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  className="nav-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleOpenProof();
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#1E293B',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Validation &amp; Proof</span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      background: '#DCFCE7',
                      color: '#166534',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}
                  >
                    2.56M
                  </span>
                </button>

                <button
                  type="button"
                  className="nav-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onNavigate) onNavigate('help');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>{t('help_guide') || 'User Guide'}</span>
                </button>

                <button
                  type="button"
                  className="nav-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onNavigate) onNavigate('settings');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>{t('settings')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Monochrome Global Search Overlay */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectStop={handleStopSelected}
        onSelectRoute={handleRouteSelected}
      />

      {/* Proof & Grounding Modal */}
      <ProofModal
        isOpen={internalProofOpen}
        onClose={() => setInternalProofOpen(false)}
        healthData={healthStatus}
      />
    </header>
  );
}
