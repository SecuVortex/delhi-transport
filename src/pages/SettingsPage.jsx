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

  const handleSave = () => {
    if (onShowToast) onShowToast(t('saved_success'));
  };

  const handleReset = () => {
    resetSettings();
    if (onShowToast) onShowToast('Preferences restored to defaults.');
  };

  return (
    <div className="settings-page">
      <PageLayout
        title={t('settings_title')}
        subtitle={t('settings_subtitle')}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={handleReset}>
              {t('restore_defaults')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {t('save_configuration')}
            </Button>
          </div>
        }
      >
        <div className="ui-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Theme: Light & Dark Mode */}
          <div className="settings-section">
            <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
              {t('appearance_section')}
            </div>
            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                  {t('theme_label')}
                </span>
                <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                  {t('theme_desc')}
                </span>
              </div>
              {/* Segmented Theme Pills */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '2px',
                  gap: '2px'
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
                        padding: '5px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                        color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                        fontSize: '11.5px',
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
            <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
              {t('language_section')}
            </div>
            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                  {t('language_label')}
                </span>
                <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                  {t('language_desc')}
                </span>
              </div>
              {/* Segmented Language Pills */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '2px',
                  gap: '2px'
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
                        padding: '5px 14px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                        color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                        fontSize: '11.5px',
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
            <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700 }}>
              {t('notifications_section')}
            </div>
            <button
              type="button"
              onClick={() => triggerTestNotification(onShowToast)}
              style={{
                padding: '4px 10px',
                borderRadius: '5px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
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

          <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                {t('crowding_surge_title')}
              </span>
              <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
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

          <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                {t('departure_reminder_title')}
              </span>
              <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
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

          <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                {t('alert_threshold_title')}
              </span>
              <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
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
                      padding: '4px 10px',
                      borderRadius: '5px',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary-light, #EFF6FF)' : 'var(--color-background)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
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
          <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
            {t('time_format_section')}
          </div>
          <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div className="settings-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="settings-title" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                {t('time_format_label')}
              </span>
              <span className="settings-desc" style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                {t('time_format_desc')}
              </span>
            </div>
            {/* Segmented Time Format Pills */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '2px',
                gap: '2px'
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
                      padding: '5px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                      fontSize: '11.5px',
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
          <div className="ui-card-title" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
            {t('about_legal_section')}
          </div>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              MetroTransit calculates transit crowdedness and corridor bottlenecks using 2.56M anonymized electronic ticketing records
              from October 2026 across Delhi. Zero personal data or user accounts are collected; all preferences reside strictly on your local device.
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '5px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>{t('terms_of_use')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '5px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
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
