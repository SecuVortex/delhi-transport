import React, { useState, useEffect } from 'react';
import { getSystemHealth } from '../../services/trafficService.js';
import { ProofModal } from '../common/ProofModal.jsx';

/**
 * CommuterHeader Component
 * Dedicated, distraction-free top navigation for the Everyday Commuter Profile.
 * Features:
 * - Live DuckDB status indicator
 * - Top-right role switcher dropdown (Everyday Commuter ▾ / DTC Operator ▾)
 * - Validation & Proof and User Guide links below divider
 */
export function CommuterHeader({
  onSwitchProfile,
  onSelectRole,
  onSwitchToOperator,
  onNavigate
}) {
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState({
    isOnline: false,
    latencyMs: null,
    totalTickets: 2232041,
    dbReady: true
  });

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

  const handleSelectRole = (role) => {
    setIsProfileOpen(false);
    if (role === 'operator') {
      if (typeof onSwitchToOperator === 'function') {
        onSwitchToOperator();
      } else if (typeof onSwitchProfile === 'function') {
        onSwitchProfile('operator');
      } else if (typeof onSelectRole === 'function') {
        onSelectRole('operator');
      } else if (typeof onNavigate === 'function') {
        onNavigate('analytics');
      }
    } else {
      if (typeof onSwitchProfile === 'function') {
        onSwitchProfile('commuter');
      } else if (typeof onSelectRole === 'function') {
        onSelectRole('commuter');
      } else if (typeof onNavigate === 'function') {
        onNavigate('journey');
      }
    }
  };

  return (
    <header
      className="top-header"
      role="banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '56px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Brand & Commuter Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 6v6" />
              <path d="M15 6v6" />
              <path d="M2 12h19.6" />
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              Delhi Transit
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Crowd-Aware Bus Routing
            </div>
          </div>
        </div>

        {/* Live DuckDB Status Indicator */}
        <div
          className="sim-indicator"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            cursor: 'pointer'
          }}
          onClick={() => setIsProofModalOpen(true)}
          title={`Backend status: ${healthStatus.isOnline ? 'Online' : 'Offline'}. 2.55M Delhi tickets indexed.`}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: healthStatus.isOnline ? '#16A34A' : '#DC2626'
            }}
          />
          <span style={{ color: '#475569' }}>
            {healthStatus.isOnline ? 'Live: DuckDB' : 'Backend Offline'}
            {healthStatus.latencyMs ? ` (${healthStatus.latencyMs}ms)` : ''}
          </span>
        </div>
      </div>

      {/* Right Controls: Role Switcher Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Top-Right Component Dropdown: Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Switch User Role or Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <div className="user-avatar-sm" style={{ fontWeight: 800, fontSize: '11px' }}>DT</div>
            <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#0F172A' }}>
              Everyday Commuter
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
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                zIndex: 1000
              }}
            >
              <div className="popover-header" style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                <span>Select User Role</span>
              </div>

              {/* Clickable Profile 1: Everyday Commuter */}
              <div style={{ padding: '8px' }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectRole('commuter')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelectRole('commuter');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
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
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                        Everyday Commuter
                      </span>
                    </div>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.35, paddingLeft: '20px' }}>
                    Find the fastest or least-crowded bus, inspect middle stops &amp; crowding.
                  </div>
                </div>

                {/* Clickable Profile 2: DTC Bus Operator / Planner */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectRole('operator')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelectRole('operator');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5">
                        <path d="M3 3v18h18" />
                        <path d="M18 17V9" />
                        <path d="M13 17V5" />
                        <path d="M8 17v-3" />
                      </svg>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                        DTC Bus Operator / Planner
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.35, paddingLeft: '20px' }}>
                    Spot overloaded corridors, test capacity assumptions &amp; deploy extra buses.
                  </div>
                </div>
              </div>

              {/* Clean Divider */}
              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '2px 0' }} />

              {/* Below Divider: Validation & Proof (2.56M) and User Guide */}
              <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsProofModalOpen(true);
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
                    color: '#1E293B',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>User Guide</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation & Ground Truth Modal */}
      <ProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        healthData={healthStatus}
      />
    </header>
  );
}

export default CommuterHeader;
