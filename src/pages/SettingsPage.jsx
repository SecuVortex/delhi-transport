import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { Button } from '../components/common/Button.jsx';

const STORAGE_KEY = 'metrotransit_user_settings';

const DEFAULT_SETTINGS = {
  highContrast: false,
  compactDensity: false,
  pushAlerts: true,
  delayThreshold: true,
  showTraffic: true,
  stepFreePriority: true,
  walkingSpeed: '4.5'
};

/**
 * Platform Preferences & Settings Page Component
 * Persistent configuration stored in browser localStorage.
 */
export function SettingsPage({ onShowToast }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply high-contrast mode to document root
  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings.highContrast]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      if (onShowToast) onShowToast('System configuration saved successfully.');
    } catch {
      if (onShowToast) onShowToast('Failed to save settings to local storage.');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      document.documentElement.classList.remove('high-contrast');
      if (onShowToast) onShowToast('Preferences restored to defaults.');
    } catch {
      if (onShowToast) onShowToast('Preferences restored to defaults.');
    }
  };

  return (
    <PageLayout
      title="Platform Preferences & Settings"
      subtitle="Configure interface appearance, notification triggers, map displays, and telemetry parameters."
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Restore Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      }
    >
      <div className="ui-card">
        {/* Appearance Section */}
        <div className="settings-section">
          <div className="ui-card-title">Interface & Appearance</div>

          <div className="settings-row">
            <div className="settings-text">
              <span className="settings-title">High Contrast Mode</span>
              <span className="settings-desc">
                Enforce maximum boundary contrast for enhanced readability (WCAG AAA).
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-text">
              <span className="settings-title">Compact Table Density</span>
              <span className="settings-desc">
                Reduce vertical row padding in schedules and analytical tables.
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.compactDensity}
                onChange={(e) => updateSetting('compactDensity', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Incident Notifications */}
        <div className="settings-section">
          <div className="ui-card-title">Incident Notifications</div>

          <div className="settings-row">
            <div className="settings-text">
              <span className="settings-title">Severe Incident Push Alerts</span>
              <span className="settings-desc">
                Dispatch immediate browser notifications for major road closures and detours.
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.pushAlerts}
                onChange={(e) => updateSetting('pushAlerts', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-text">
              <span className="settings-title">Delay Threshold Alert</span>
              <span className="settings-desc">
                Notify dispatchers when any monitored bus route delay exceeds 5 minutes.
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.delayThreshold}
                onChange={(e) => updateSetting('delayThreshold', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Map Display Preferences */}
        <div className="settings-section">
          <div className="ui-card-title">Map Display Preferences</div>

          <div className="settings-row">
            <div className="settings-text">
              <span className="settings-title">Show Real-Time Congestion Overlay by Default</span>
              <span className="settings-desc">
                Render colored traffic condition segments when opening the Live Map.
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showTraffic}
                onChange={(e) => updateSetting('showTraffic', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Routing Preferences */}
        <div className="settings-section">
          <div className="ui-card-title">Routing Calculations</div>

          <div className="settings-row">
            <div className="settings-text">
              <span className="settings-title">Prioritize Step-Free Access Paths</span>
              <span className="settings-desc">
                Select elevators and accessible ramps over stairs during journey calculation.
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.stepFreePriority}
                onChange={(e) => updateSetting('stepFreePriority', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-text">
              <span className="settings-title">Walking Speed Calibration</span>
              <span className="settings-desc">Calibrate walking distance calculation to transit stops.</span>
            </div>
            <select
              className="form-select"
              value={settings.walkingSpeed}
              onChange={(e) => updateSetting('walkingSpeed', e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="3.0">Relaxed (3.0 km/h)</option>
              <option value="4.5">Standard (4.5 km/h)</option>
              <option value="6.0">Brisk (6.0 km/h)</option>
            </select>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
