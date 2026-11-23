import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { GlobalSearchModal } from '../common/GlobalSearchModal.jsx';
import { RunningBusLogo } from '../common/RunningBusLogo.jsx';

/**
 * Ultra-Clean Minimal Top Navigation Bar
 * Left:  Mobile Menu Toggle (mobile) + RunningBusLogo + MetroTransit Title
 * Right: ONLY 3 Controls:
 *   1. Search Toggle (🔍 /)
 *   2. Light / Dark Theme Toggle (☀️ / 🌙)
 *   3. English / Hindi Language Pill (EN | हिं)
 * (Role switching is cleanly accessible inside the Sidebar)
 */
export function Header({
  onOpenMobile,
  onNavigate,
  onSelectStop,
  onSelectRoute
}) {
  const { resolvedTheme, toggleTheme, language, setLanguage } = useSettings();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
    <header
      className="top-header"
      role="banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: 'var(--header-height, 64px)',
        padding: '0 20px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-line)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header, 30)'
      }}
    >
      {/* Left: Mobile Menu Toggle + RunningBusLogo + MetroTransit Title */}
      <div
        className="header-left"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: 0
        }}
      >
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('journey')}>
          <RunningBusLogo size={22} />
          <span
            style={{
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap'
            }}
          >
            MetroTransit
          </span>
        </div>
      </div>

      {/* Right: Exactly 3 Essential Controls (Search, Theme, Language) */}
      <div
        className="header-right"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}
      >
        {/* 1. Global Search Toggle (🔍 /) */}
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

        {/* 2. Light / Dark Mode Toggle (☀️ / 🌙) */}
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

        {/* 3. English / Hindi Language Toggle (EN | हिं) */}
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
      </div>

      {/* Global Instant Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectStop={handleStopSelected}
        onSelectRoute={handleRouteSelected}
      />
    </header>
  );
}

export default Header;
