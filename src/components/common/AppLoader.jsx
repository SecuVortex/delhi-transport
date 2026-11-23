import React, { useState, useEffect } from 'react';
import { RunningBusLogo } from './RunningBusLogo.jsx';

/**
 * Fast, Classy Website Loading Splash Component
 * Shown during initial app hydration or when Render backend is waking up.
 * Never sticks: auto-clears cleanly within 1.2s or fades out smoothly in 220ms.
 */
export function AppLoader({ onDismiss }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting to Delhi Transit DuckDB...');

  useEffect(() => {
    // If backend takes longer than 3s, show courteous cold-start notice
    const coldStartTimer = setTimeout(() => {
      setStatusMessage('Waking up live server on Render...');
    }, 3000);

    // Initial smooth splash duration (max 1.2s)
    const splashTimer = setTimeout(() => {
      setFadingOut(true);
      const hideTimer = setTimeout(() => {
        setHidden(true);
        if (onDismiss) onDismiss();
      }, 240); // 240ms matches CSS transition
      return () => clearTimeout(hideTimer);
    }, 1200);

    return () => {
      clearTimeout(coldStartTimer);
      clearTimeout(splashTimer);
    };
  }, [onDismiss]);

  if (hidden) return null;

  return (
    <div
      className={`app-loader-overlay ${fadingOut ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-page, #f8f8f7)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        pointerEvents: fadingOut ? 'none' : 'auto',
        transition: 'opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none'
      }}
      aria-live="polite"
      aria-busy={!fadingOut}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '24px',
          textAlign: 'center'
        }}
      >
        {/* Animated Running Yellow Bus Logo */}
        <div style={{ transform: 'scale(1.15)', marginBottom: '8px' }}>
          <RunningBusLogo size={44} />
        </div>

        {/* Brand Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary, #151413)'
            }}
          >
            MetroTransit
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-muted, #5c5852)'
            }}
          >
            Crowdedness-Aware Delhi Bus Intelligence
          </span>
        </div>

        {/* Sleek Monochrome / Yellow Shimmer Progress Bar */}
        <div
          style={{
            width: '180px',
            height: '3px',
            backgroundColor: 'var(--border-line, #e2e2df)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
            marginTop: '8px'
          }}
        >
          <div
            className="loader-shimmer-bar"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '45%',
              backgroundColor: '#FACC15',
              borderRadius: '999px',
              animation: 'loaderSlide 1s ease-in-out infinite alternate'
            }}
          />
        </div>

        {/* Status Line */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-muted, #5c5852)',
            marginTop: '4px',
            letterSpacing: '0.01em'
          }}
        >
          {statusMessage}
        </span>
      </div>

      <style>{`
        @keyframes loaderSlide {
          0% { left: 0%; width: 30%; }
          100% { left: 70%; width: 45%; }
        }
      `}</style>
    </div>
  );
}
