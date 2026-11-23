import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { TermsModal, PrivacyModal } from '../components/common/LegalModals.jsx';

/**
 * Platform Preferences & Settings Page Component
 * Connects directly to SettingsContext with live persistence across both profiles.
 */
export function SettingsPage({ onShowToast }) {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    timeFormat,
    setTimeFormat,
    notifications,
    updateNotification,
    resetSettings,
    triggerTestNotification,
    t
  } = useSettings();

  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem('metrotransit_theme', theme);
      localStorage.setItem('metrotransit_lang', language);
      localStorage.setItem('metrotransit_time_format', timeFormat);
      localStorage.setItem('metrotransit_notifications', JSON.stringify(notifications));
    } catch {}

    setIsSaved(true);
    if (onShowToast) onShowToast(t('saved_success') || 'Configuration saved successfully!');
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleReset = () => {
    resetSettings();
    setIsSaved(false);
    if (onShowToast) onShowToast('Preferences restored to defaults.');
  };

  return (
    <div className="settings-page">
      <PageLayout
        title={t('settings_title')}
        subtitle={t('settings_subtitle')}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button variant="secondary" size="sm" onClick={handleReset}>
              {t('restore_defaults')}
            </Button>
            <button
              type="button"
              className="btn-save-config"
              onClick={handleSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                fontSize: '12.5px',
                fontWeight: 700,
                borderRadius: 'var(--btn-radius, 8px)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                border: 'none',
                lineHeight: 1.4
              }}
            >
              {isSaved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Saved ✓</span>
                </>
              ) : (
                <span>{t('save_configuration')}</span>
              )}
            </button>
          </div>
        }
      >
        <div className="ui-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', borderRadius: 'var(--card-radius, 12px)', border: '1px solid var(--border-line)', background: 'var(--bg-card)' }}>
          {/* 1. Theme: Light & Dark Mode */}
          <div className="settings-section">
            <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
              {t('appearance_section')}
            </div>
            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-line)' }}>
              <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {t('theme_label')}
                </span>
                <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('theme_desc')}
                </span>
              </div>
              {/* Segmented Theme Pills */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-line)',
                  borderRadius: 'var(--btn-radius, 8px)',
                  padding: '3px',
                  gap: '3px'
                }}
              >
                {[
                  { id: 'light', label: t('light_mode'), icon: 'sun' },
                  { id: 'dark', label: t('dark_mode'), icon: 'moon' },
                  { id: 'system', label: t('system_mode'), icon: 'monitor' }
                ].map((opt) => {
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className="segmented-btn"
                      onClick={() => setTheme(opt.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isSelected ? 'var(--btn-bg)' : 'transparent',
                        color: isSelected ? 'var(--btn-text)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Language Switcher: English / हिन्दी */}
          <div className="settings-section">
            <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
              {t('language_section')}
            </div>
            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-line)' }}>
              <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {t('language_label')}
                </span>
                <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('language_desc')}
                </span>
              </div>
              {/* Segmented Language Pills */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-line)',
                  borderRadius: 'var(--btn-radius, 8px)',
                  padding: '3px',
                  gap: '3px'
                }}
              >
                {[
                  { id: 'en', label: 'English (EN)' },
                  { id: 'hi', label: 'हिन्दी (Hindi)' }
                ].map((opt) => {
                  const isSelected = language === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className="segmented-btn"
                      onClick={() => setLanguage(opt.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isSelected ? 'var(--btn-bg)' : 'transparent',
                        color: isSelected ? 'var(--btn-text)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Stop & Crowding Notifications */}
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('notifications_section')}
              </div>
              <button
                type="button"
                onClick={() => triggerTestNotification(onShowToast)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--btn-radius, 8px)',
                  border: '1px solid var(--border-line)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Trigger a live sample crowding surge alert"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span>{t('test_notification_btn')}</span>
              </button>
            </div>

            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-line)' }}>
              <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {t('crowding_surge_title')}
                </span>
                <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('crowding_surge_desc')}
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.crowdingSurgeAlerts}
                  onChange={(e) => updateNotification('crowdingSurgeAlerts', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-line)' }}>
              <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {t('departure_reminder_title')}
                </span>
                <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('departure_reminder_desc')}
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.departureReminders}
                  onChange={(e) => updateNotification('departureReminders', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-line)' }}>
              <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {t('alert_threshold_title')}
                </span>
                <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('alert_threshold_desc')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: '65', label: 'Standing Room (>65%)' },
                  { id: '85', label: 'Crowded (>85%)' }
                ].map((opt) => {
                  const isSelected = notifications.alertThreshold === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateNotification('alertThreshold', opt.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--btn-radius, 8px)',
                        border: `1px solid ${isSelected ? 'var(--btn-bg)' : 'var(--border-line)'}`,
                        backgroundColor: isSelected ? 'var(--btn-bg)' : 'var(--bg-subtle)',
                        color: isSelected ? 'var(--btn-text)' : 'var(--text-primary)',
                        fontSize: '11.5px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Time & Display Format Setting */}
          <div className="settings-section">
            <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
              {t('time_format_section')}
            </div>
            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-line)' }}>
              <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {t('time_format_label')}
                </span>
                <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('time_format_desc')}
                </span>
              </div>
              {/* Segmented Time Format Pills */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-line)',
                  borderRadius: 'var(--btn-radius, 8px)',
                  padding: '3px',
                  gap: '3px'
                }}
              >
                {[
                  { id: '12h', label: t('time_12h') },
                  { id: '24h', label: t('time_24h') }
                ].map((opt) => {
                  const isSelected = timeFormat === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className="segmented-btn"
                      onClick={() => setTimeFormat(opt.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isSelected ? 'var(--btn-bg)' : 'transparent',
                        color: isSelected ? 'var(--btn-text)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Terms of Use & Privacy Policy (About & Legal) */}
          <div className="settings-section">
            <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              {t('about_legal_section')}
            </div>
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--card-radius, 12px)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                MetroTransit calculates transit crowdedness and corridor bottlenecks using 2.56M anonymized electronic ticketing records
                from October 2026 across Delhi. Zero personal data or user accounts are collected; all preferences reside strictly on your local device.
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--btn-radius, 8px)',
                    border: '1px solid var(--border-line)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{t('terms_of_use')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--btn-radius, 8px)',
                    border: '1px solid var(--border-line)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>{t('privacy_policy')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Modals */}
        <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      </PageLayout>
    </div>
  );
}
