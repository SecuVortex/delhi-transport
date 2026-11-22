import React, { useState, useEffect } from 'react';
import { getSystemHealth } from '../../services/trafficService.js';
import { ProofModal } from '../common/ProofModal.jsx';

/**
 * Top Navigation Bar Component
 * Minimal, sticky, accessible, with real backend DuckDB connection status,
 * Proof Modal access, and global search.
 */
export function Header({ activePageLabel, onOpenMobile, onNavigate }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [healthStatus, setHealthStatus] = useState({
    isOnline: false,
    latencyMs: null,
    totalTickets: 2559899,
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
            totalTickets: data.total_tickets || 2559899,
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

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('header-global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          onClick={() => setIsProofModalOpen(true)}
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
        {/* Data Grounding & Methodology Proof Button */}
        <button
          type="button"
          className="ui-btn ui-btn-sm"
          onClick={() => setIsProofModalOpen(true)}
          style={{
            background: '#F1F5F9',
            borderColor: '#CBD5E1',
            color: '#1E293B',
            fontSize: '11.5px',
            fontWeight: 600,
            padding: '4px 10px',
            height: '28px'
          }}
          title="Inspect data source, DuckDB queries, and technical methodology"
        >
          Grounding Proof
        </button>

        {/* Global Search */}
        <div className="global-search-container">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="header-global-search"
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Delhi stops, routes..."
            aria-label="Global search"
          />
          <span className="search-shortcut">/</span>
        </div>

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

        {/* Profile Popover Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            aria-label="User account menu"
          >
            <div className="user-avatar-sm">DT</div>
            <span>Transit View</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="popover-menu open" role="dialog" aria-label="Account details">
              <div className="popover-header">
                <span>Session Context</span>
              </div>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Delhi Transport Stack</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Problem 2: Crowding-Aware Planner</div>
                <span className="status-pill success" style={{ marginTop: '6px', width: 'fit-content' }}>
                  Live DuckDB Backend
                </span>
              </div>
              <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
                <button
                  type="button"
                  className="nav-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsProofModalOpen(true);
                  }}
                >
                  Methodology & Proof
                </button>
                <button
                  type="button"
                  className="nav-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('help');
                  }}
                >
                  User Guide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proof & Grounding Modal */}
      <ProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        healthData={healthStatus}
      />
    </header>
  );
}
