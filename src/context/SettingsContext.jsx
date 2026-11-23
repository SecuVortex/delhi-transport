import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTranslation } from '../utils/i18n.js';
import { formatTime as formatTimeUtil, addMinutesToTime as addMinutesUtil } from '../utils/timeFormat.js';

const STORAGE_KEY = 'metrotransit_platform_settings';

const DEFAULT_SETTINGS = {
  theme: 'light', // 'light' | 'dark' | 'system'
  language: 'en', // 'en' | 'hi'
  timeFormat: '12h', // '12h' | '24h'
  notifications: {
    crowdingSurgeAlerts: true,
    departureReminders: true,
    alertThreshold: '85' // '65' or '85'
  }
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(parsed.notifications || {})
          }
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  // Synchronize theme with DOM (document.documentElement.classList.toggle('dark'))
  useEffect(() => {
    const applyTheme = () => {
      let active = settings.theme;
      if (active === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = prefersDark ? 'dark' : 'light';
      }

      setResolvedTheme(active);

      if (active === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Persist settings to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota errors
    }
  }, [settings]);

  // Translation helper
  const t = useCallback((key) => {
    return getTranslation(key, settings.language);
  }, [settings.language]);

  // Time formatter using current timeFormat setting
  const formatTime = useCallback((timeInput, includeSuffix = true) => {
    return formatTimeUtil(timeInput, settings.timeFormat, includeSuffix);
  }, [settings.timeFormat]);

  const addMinutesToTime = useCallback((timeInput, minutes = 20) => {
    return addMinutesUtil(timeInput, minutes, settings.timeFormat);
  }, [settings.timeFormat]);

  // Setters
  const setTheme = useCallback((theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  }, []);

  const setLanguage = useCallback((language) => {
    setSettings((prev) => ({ ...prev, language }));
  }, []);

  const setTimeFormat = useCallback((timeFormat) => {
    setSettings((prev) => ({ ...prev, timeFormat }));
  }, []);

  const updateNotification = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Test Notification trigger
  const triggerTestNotification = useCallback(async (onToast = null) => {
    const alertMsg = settings.language === 'hi'
      ? 'परीक्षण अलर्ट: रूट 740UP (आनंद विहार → मंडी हाउस) पर 85% से अधिक भीड़भाड़ देखी गई।'
      : 'Test Alert: Route 740UP (Anand Vihar to Mandi House) exceeds 85% passenger load.';

    // 1. Always show in-app accessible toast immediately
    if (onToast) {
      onToast(alertMsg);
    }

    // 2. Try Native Browser Notification API if permitted (non-blocking)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification('MetroTransit Delhi Alert', {
            body: alertMsg,
            icon: '/favicon.ico'
          });
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification('MetroTransit Delhi Alert', {
                body: alertMsg,
                icon: '/favicon.ico'
              });
            }
          }).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  }, [settings.language]);

  const value = {
    settings,
    theme: settings.theme,
    resolvedTheme,
    language: settings.language,
    timeFormat: settings.timeFormat,
    notifications: settings.notifications,
    t,
    formatTime,
    addMinutesToTime,
    setTheme,
    toggleTheme,
    setLanguage,
    setTimeFormat,
    updateNotification,
    resetSettings,
    triggerTestNotification
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      settings: DEFAULT_SETTINGS,
      theme: 'light',
      resolvedTheme: 'light',
      language: 'en',
      timeFormat: '12h',
      notifications: DEFAULT_SETTINGS.notifications,
      t: (k) => k,
      formatTime: (t) => t,
      addMinutesToTime: (t) => t,
      setTheme: () => {},
      toggleTheme: () => {},
      setLanguage: () => {},
      setTimeFormat: () => {},
      updateNotification: () => {},
      resetSettings: () => {},
      triggerTestNotification: () => {}
    };
  }
  return ctx;
}
