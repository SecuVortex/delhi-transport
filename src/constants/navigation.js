/**
 * Application Navigation Constants
 * Defines top-level pages, labels, badges, and icon names.
 */

export const NAV_PAGES = {
  OVERVIEW: 'overview',
  JOURNEY: 'journey',
  LIVE_MAP: 'live-map',
  ROUTES: 'routes',
  ANALYTICS: 'analytics',
  ALERTS: 'alerts',
  SETTINGS: 'settings',
  HELP: 'help'
};

export const PRIMARY_NAV_ITEMS = [
  {
    id: NAV_PAGES.OVERVIEW,
    label: 'Overview',
    icon: 'LayoutDashboard'
  },
  {
    id: NAV_PAGES.JOURNEY,
    label: 'Journey Planner',
    icon: 'Route'
  },
  {
    id: NAV_PAGES.LIVE_MAP,
    label: 'Live Map',
    icon: 'Map'
  },
  {
    id: NAV_PAGES.ROUTES,
    label: 'Bus Routes',
    icon: 'Bus'
  },
  {
    id: NAV_PAGES.ANALYTICS,
    label: 'Traffic Analytics',
    icon: 'BarChart3'
  },
  {
    id: NAV_PAGES.ALERTS,
    label: 'Alerts',
    icon: 'AlertTriangle',
    badge: '3',
    badgeWarning: true
  }
];

export const FOOTER_NAV_ITEMS = [
  {
    id: NAV_PAGES.SETTINGS,
    label: 'Settings',
    icon: 'Settings'
  },
  {
    id: NAV_PAGES.HELP,
    label: 'Help',
    icon: 'HelpCircle'
  }
];
