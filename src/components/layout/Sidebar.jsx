import React from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';

const COMMUTER_NAV_ITEMS = [
  { id: 'journey', key: 'commuter_dashboard', defaultLabel: 'Commuter Dashboard', icon: 'Route' },
  { id: 'live-map', key: 'live_route_map', defaultLabel: 'Live Route Map', icon: 'Map' },
  { id: 'routes', key: 'bus_routes', defaultLabel: 'Bus Routes', icon: 'Bus' },
  { id: 'help', key: 'help_guide', defaultLabel: 'Help / Crowding Guide', icon: 'HelpCircle' },
  { id: 'settings', key: 'settings', defaultLabel: 'Settings', icon: 'Settings' }
];

const OPERATOR_NAV_ITEMS = [
  { id: 'analytics', key: 'operator_dashboard', defaultLabel: 'Operator Dashboard', icon: 'BarChart3' },
  { id: 'overview', key: 'operations_overview', defaultLabel: 'Operations Overview', icon: 'LayoutDashboard' },
  { id: 'live-map', key: 'live_map', defaultLabel: 'Live Map', icon: 'Map' },
  { id: 'validation', key: 'validation_proof', defaultLabel: 'Validation & Proof', icon: 'ShieldCheck' },
  { id: 'settings', key: 'settings', defaultLabel: 'Settings', icon: 'Settings' }
];

/**
 * Persistent Left Sidebar Component
 * Supports expanded and collapsed states, switching cleanly between Commuter and Operator profiles.
 */
export function Sidebar({
  activePage,
  onNavigate,
  activeProfile = 'commuter',
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) {
  const { t } = useSettings();
  const navItems = activeProfile === 'operator' ? OPERATOR_NAV_ITEMS : COMMUTER_NAV_ITEMS;

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      aria-label="Main Navigation"
    >
      <div className="sidebar-header">
        <div
          className="sidebar-logo"
          onClick={() => {
            onNavigate(activeProfile === 'operator' ? 'overview' : 'journey');
            if (isMobileOpen) onCloseMobile();
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 6v6" />
              <path d="M15 6v6" />
              <path d="M2 12h19.6" />
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="sidebar-logo-info">
              <div className="sidebar-logo-text">MetroTransit</div>
              <div className="sidebar-logo-sub">
                {activeProfile === 'operator' ? 'Operations Intelligence' : t('everyday_commuter')}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav-group" aria-label="Primary Navigation">
          {!isCollapsed && (
            <div className="sidebar-nav-label">
              {activeProfile === 'operator' ? t('operator_portal') : t('commuter_portal')}
            </div>
          )}

          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const label = t(item.key) || item.defaultLabel;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobileOpen) onCloseMobile();
                }}
                aria-label={label}
              >
                <NavIcon name={item.icon} />
                {!isCollapsed && <span className="nav-text">{label}</span>}
                {!isCollapsed && item.badge && (
                  <span
                    className="badge-count"
                    style={item.badgeWarning ? { color: 'var(--color-warning)' } : undefined}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div style={{
            padding: '8px 12px',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderTop: '1px solid var(--color-border)'
          }}>
            <div className="user-avatar-sm" style={{
              background: activeProfile === 'operator' ? '#0F172A' : '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700
            }}>
              {activeProfile === 'operator' ? 'DP' : 'EC'}
            </div>
            <div className="sidebar-logo-info">
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                {activeProfile === 'operator' ? t('dtc_planner') : t('everyday_commuter')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {activeProfile === 'operator' ? 'Network Intelligence' : 'Delhi Metro & Bus'}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavIcon({ name }) {
  if (name === 'LayoutDashboard') {
    return (
      <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    );
  }
  if (name === 'Route') {
    return (
      <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="6" cy="19" r="3" />
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
        <circle cx="18" cy="5" r="3" />
      </svg>
    );
  }
  if (name === 'Map') {
    return (
      <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </svg>
    );
  }
  if (name === 'Bus') {
    return (
      <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 6v6" />
        <path d="M15 6v6" />
        <path d="M2 12h19.6" />
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    );
  }
  if (name === 'BarChart3') {
    return (
      <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    );
  }
  if (name === 'ShieldCheck' || name === 'CheckCircle') {
    return (
      <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );
  }
  if (name === 'AlertTriangle') {
    return (
      <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  if (name === 'Settings') {
    return (
      <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }
  return (
    <svg className="lucide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
