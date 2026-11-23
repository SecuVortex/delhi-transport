import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { RunningBusLogo } from './RunningBusLogo.jsx';

/**
 * Classy Website Loading Splash Component
 * Stays on screen for exactly 3 seconds (3000ms) on page load/refresh,
 * smoothly fills a yellow progress bar from 0% to 100% over 3s,
 * and fades out gracefully over 300ms with zero jitter.
 * Heading and subtitle are crisp and high-contrast in both Light and Dark mode.
 */
export function AppLoader({ onDismiss }) {
  const { resolvedTheme } = useSettings();
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting to Delhi Transit DuckDB...');

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    // Dynamic status messages during the 3-second initialization
    const msgTimer1 = setTimeout(() => {
      setStatusMessage('Indexing 1,400+ DTC & Cluster routes...');
    }, 1100);

    const msgTimer2 = setTimeout(() => {
      setStatusMessage('Syncing live GTFS crowding model...');
    }, 2100);

    const msgTimer3 = setTimeout(() => {
      setStatusMessage('Ready!');
    }, 2850);

    // Keep splash on screen for exactly 3000ms
    const splashTimer = setTimeout(() => {
      setFadingOut(true);
      const hideTimer = setTimeout(() => {
        setHidden(true);
        if (onDismiss) onDismiss();
      }, 300); // 300ms smooth fadeout
      return () => clearTimeout(hideTimer);
    }, 3000);

    return () => {
      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);
      clearTimeout(msgTimer3);
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
        backgroundColor: isDark ? '#0f0f10' : '#f8f8f7',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        pointerEvents: fadingOut ? 'none' : 'auto',
        transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)',
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
          textAlign: 'center',
          maxWidth: '320px',
          width: '100%'
        }}
      >
        {/* Animated Running Yellow Bus Logo */}
        <div style={{ transform: 'scale(1.2)', marginBottom: '8px' }}>
          <RunningBusLogo size={46} />
        </div>

        {/* Brand Name & Subtitle with guaranteed high contrast */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <h1
            className="text-[#151413] dark:text-[#f4f4f5]"
            style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: isDark ? '#f4f4f5' : '#151413',
              margin: 0,
              lineHeight: 1.2
            }}
          >
            MetroTransit
          </h1>
          <p
            className="text-[#5c5852] dark:text-[#a1a1aa]"
            style={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: isDark ? '#a1a1aa' : '#5c5852',
              margin: 0,
              lineHeight: 1.4
            }}
          >
            Crowdedness-Aware Delhi Bus Intelligence
          </p>
        </div>

        {/* Yellow Progress Bar filling smoothly from 0% to 100% over 3 seconds */}
        <div
          style={{
            width: '200px',
            height: '4px',
            backgroundColor: isDark ? '#27272a' : '#e2e2df',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
            marginTop: '10px'
          }}
        >
          <div
            className="loader-fill-bar"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              backgroundColor: '#FACC15',
              borderRadius: '999px',
              animation: 'fillProgress3s 3000ms linear forwards'
            }}
          />
        </div>

        {/* Status Line */}
        <span
          className="text-[#5c5852] dark:text-[#a1a1aa]"
          style={{
            fontSize: '11.5px',
            fontWeight: 500,
            color: isDark ? '#a1a1aa' : '#5c5852',
            marginTop: '4px',
            letterSpacing: '0.01em',
            minHeight: '16px'
          }}
        >
          {statusMessage}
        </span>
      </div>

      <style>{`
        @keyframes fillProgress3s {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default AppLoader;
