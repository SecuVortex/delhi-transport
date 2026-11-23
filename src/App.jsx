import React, { useState } from 'react';
import { useSettings } from './context/SettingsContext.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { BottomNav } from './components/layout/BottomNav.jsx';
import { OverviewPage } from './pages/OverviewPage.jsx';
import { JourneyPlannerPage } from './pages/JourneyPlannerPage.jsx';
import { LiveMapPage } from './pages/LiveMapPage.jsx';
import { BusRoutesPage } from './pages/BusRoutesPage.jsx';
import { TrafficAnalyticsPage } from './pages/TrafficAnalyticsPage.jsx';
import { AlertsPage } from './pages/AlertsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { HelpPage } from './pages/HelpPage.jsx';
import { ProofModal } from './components/common/ProofModal.jsx';
import { NAV_PAGES } from './constants/navigation.js';

const PAGE_TITLES = {
  [NAV_PAGES.JOURNEY]: 'Commuter Dashboard',
  [NAV_PAGES.OVERVIEW]: 'Operations Overview',
  [NAV_PAGES.ANALYTICS]: 'Operator Dashboard',
  [NAV_PAGES.LIVE_MAP]: 'Live Route Map',
  [NAV_PAGES.ROUTES]: 'Bus Routes',
  [NAV_PAGES.ALERTS]: 'Alerts',
  [NAV_PAGES.SETTINGS]: 'Settings',
  [NAV_PAGES.HELP]: 'Help / Crowding Guide',
  'validation': 'Validation & Ground Truth'
};

/**
 * Root Application Shell Component
 * Coordinates the polished MetroTransit left-sidebar multi-page application,
 * top header with Profile Switcher (Commuter Profile | Operator Profile),
 * active page routing, and ground-truth validation proof modal.
 */
export function App() {
  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const profileParam = searchParams.get('profile') || searchParams.get('role');
      if (profileParam === 'operator' || window.location.hash === '#operator') {
        return 'operator';
      }
      if (profileParam === 'commuter' || window.location.hash === '#commuter') {
        return 'commuter';
      }
      const saved = localStorage.getItem('delhi_transit_active_profile');
      if (saved === 'operator' || saved === 'commuter') {
        return saved;
      }
    } catch {
      // fallback safely
    }
    return 'commuter';
  });

  const [activePage, setActivePage] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const profileParam = searchParams.get('profile') || searchParams.get('role');
      if (profileParam === 'operator' || window.location.hash === '#operator') {
        return NAV_PAGES.ANALYTICS;
      }
      if (profileParam === 'commuter' || window.location.hash === '#commuter') {
        return NAV_PAGES.JOURNEY;
      }
      const saved = localStorage.getItem('delhi_transit_active_profile');
      if (saved === 'operator') {
        return NAV_PAGES.ANALYTICS;
      }
    } catch {
      // fallback safely
    }
    return NAV_PAGES.JOURNEY;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchedStop, setSearchedStop] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const { t } = useSettings();

  const handleSwitchProfile = (target) => {
    const next = target || (activeProfile === 'commuter' ? 'operator' : 'commuter');
    setActiveProfile(next);
    try {
      localStorage.setItem('delhi_transit_active_profile', next);
    } catch {
      // ignore
    }

    // Switch default page cleanly when toggling profiles
    if (next === 'operator') {
      if (activePage !== NAV_PAGES.LIVE_MAP && activePage !== NAV_PAGES.OVERVIEW && activePage !== NAV_PAGES.SETTINGS) {
        setActivePage(NAV_PAGES.ANALYTICS);
      }
    } else {
      if (activePage !== NAV_PAGES.LIVE_MAP && activePage !== NAV_PAGES.ROUTES && activePage !== NAV_PAGES.HELP && activePage !== NAV_PAGES.SETTINGS) {
        setActivePage(NAV_PAGES.JOURNEY);
      }
    }
  };

  const handleNavigate = (page) => {
    if (page === 'validation') {
      setIsProofModalOpen(true);
      return;
    }
    setActivePage(page);
    setIsMobileOpen(false);
  };

  const getPageTitle = (page) => {
    switch (page) {
      case NAV_PAGES.JOURNEY: return t('commuter_dashboard');
      case NAV_PAGES.OVERVIEW: return t('operations_overview');
      case NAV_PAGES.ANALYTICS: return t('operator_dashboard');
      case NAV_PAGES.LIVE_MAP: return t('live_route_map');
      case NAV_PAGES.ROUTES: return t('bus_routes');
      case NAV_PAGES.ALERTS: return t('alerts');
      case NAV_PAGES.SETTINGS: return t('settings');
      case NAV_PAGES.HELP: return t('help_guide');
      case 'validation': return t('validation_proof');
      default: return 'MetroTransit';
    }
  };

  const pageTitle = getPageTitle(activePage);

  return (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Persistent MetroTransit Left Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        activeProfile={activeProfile}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="main-content-wrapper">
        <Header
          activePageLabel={pageTitle}
          onOpenMobile={() => setIsMobileOpen(true)}
          onNavigate={handleNavigate}
          activeProfile={activeProfile}
          onSelectProfile={handleSwitchProfile}
          onOpenProofModal={() => setIsProofModalOpen(true)}
          onSelectStop={(stopName) => {
            setSearchedStop(stopName);
            setActivePage(NAV_PAGES.JOURNEY);
            showToast(`Selected: ${stopName}`);
          }}
          onSelectRoute={(routeName) => {
            setActivePage(NAV_PAGES.LIVE_MAP);
            showToast(`Focusing corridor: ${routeName}`);
          }}
        />

        <main id="main-content" role="main" style={{ flex: 1 }}>
          {activePage === NAV_PAGES.OVERVIEW && (
            <OverviewPage
              onNavigate={handleNavigate}
              onOpenProofModal={() => setIsProofModalOpen(true)}
            />
          )}
          {activePage === NAV_PAGES.JOURNEY && (
            <JourneyPlannerPage
              initialStop={searchedStop}
              onClearInitialStop={() => setSearchedStop(null)}
            />
          )}
          {activePage === NAV_PAGES.LIVE_MAP && <LiveMapPage onNavigate={handleNavigate} />}
          {activePage === NAV_PAGES.ROUTES && <BusRoutesPage onNavigate={handleNavigate} />}
          {activePage === NAV_PAGES.ANALYTICS && (
            <TrafficAnalyticsPage
              onOpenProofModal={() => setIsProofModalOpen(true)}
            />
          )}
          {activePage === NAV_PAGES.ALERTS && <AlertsPage />}
          {activePage === NAV_PAGES.SETTINGS && <SettingsPage onShowToast={showToast} />}
          {activePage === NAV_PAGES.HELP && <HelpPage />}
        </main>
      </div>

      {/* Mobile Dedicated Bottom Navigation Bar */}
      <BottomNav
        activePage={activePage}
        onNavigate={(page) => {
          handleNavigate(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMenu={() => setIsMobileOpen(true)}
      />

      {/* Validation & Ground Truth Modal */}
      <ProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
      />

      {/* Accessible Feedback Toast Notice */}
      {toastMessage && (
        <div className="toast-notice" role="status" aria-live="polite" style={{ display: 'flex' }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
