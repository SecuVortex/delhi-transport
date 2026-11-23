import React, { useEffect } from 'react';

/**
 * Terms of Use Modal
 * Details operational scope, data provenance, and crowding prediction disclaimers.
 */
export function TermsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 'var(--z-modal, 60)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--card-radius, 12px)',
          border: '1px solid var(--border-line)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h2 id="terms-modal-title" className="modal-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Terms of Use &amp; Service Scope
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: 'var(--btn-radius, 8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              1. Platform Nature and Scope
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              MetroTransit is an open Delhi bus transit decision-support system built for commuters, DTC bus dispatchers, and urban transit planners.
              The application estimates bus crowdedness and journey times to assist passenger travel decisions and fleet dispatch planning.
            </p>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              2. Data Provenance &amp; Methodology
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Crowding predictions and bottleneck analytics are derived from <strong>2.56 million anonymized electronic ticketing machine (ETM) records</strong>
              from October 2026 across Delhi, integrated with static GTFS network schedules (7,552 distinct stops) and calibrated occupancy models.
            </p>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              3. Important Crowding &amp; Seat Availability Disclaimer
            </h3>
            <div
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.12)',
                borderLeft: '3px solid #D97706',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                marginTop: '6px'
              }}
            >
              <strong style={{ color: '#D97706' }}>Disclaimer:</strong> Crowding badges (<em>Seats Available</em>, <em>Standing Room</em>, <em>Crowded</em>)
              reflect empirical historical probability distributions for specified day types and hours. They do not constitute a live sensor-guaranteed
              headcount of empty seats on any physical vehicle at the exact instant of boarding. Commuters should plan accordingly.
            </div>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              4. Service Availability
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              This service is provided free of charge for public informational and research use. We make reasonable efforts to maintain
              high platform uptime, but do not warrant uninterrupted operation during municipal network outages.
            </p>
          </section>
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-line)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--btn-radius, 8px)',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Privacy Policy Modal
 * Details zero personal tracking, zero accounts, and local storage retention.
 */
export function PrivacyModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 'var(--z-modal, 60)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--card-radius, 12px)',
          border: '1px solid var(--border-line)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h2 id="privacy-modal-title" className="modal-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Privacy Policy &amp; Data Transparency
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: 'var(--btn-radius, 8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              1. Zero User Accounts &amp; Zero Personal Tracking
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              MetroTransit operates completely without authentication, user logins, cookies, or persistent device fingerprinting.
              We do <strong>not</strong> require names, phone numbers, email addresses, or government identification to plan journeys or view corridor analytics.
            </p>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              2. Local Storage Preference Retention
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Your personal interface preferences (color theme, language, 12h/24h time format, notification toggles, and recent search stops)
              are stored strictly in your local device's browser <code>localStorage</code>.
              These settings never leave your browser and are not transmitted to or stored on our servers.
            </p>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              3. Ticketing Data Anonymization
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              All backend analytics are computed from aggregated historical ticketing records where all passenger identity information
              has been completely stripped prior to ingestion into our analytical DuckDB database.
            </p>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              4. Third-Party Analytics &amp; Advertising
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              MetroTransit contains <strong>zero third-party trackers, zero advertising SDKs, and zero behavioral telemetry scripts</strong>.
              Map tiles are rendered directly from public OpenStreetMap community servers.
            </p>
          </section>
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-line)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--btn-radius, 8px)',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
