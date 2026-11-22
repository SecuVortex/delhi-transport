import React, { useState } from 'react';
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
import { NAV_PAGES, PRIMARY_NAV_ITEMS, FOOTER_NAV_ITEMS } from './constants/navigation.js';

/**
 * Root Application Component
 * Coordinates sidebar navigation, top header, active page view, mobile bottom navigation, and toast notifications.
 */
export function App() {
  const [activePage, setActivePage] = useState(NAV_PAGES.OVERVIEW);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const getPageTitle = (pageKey) => {
    const item =
      PRIMARY_NAV_ITEMS.find((n) => n.id === pageKey) ||
      FOOTER_NAV_ITEMS.find((n) => n.id === pageKey);
    return item ? item.label : 'Overview';
  };

  return (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Persistent Left Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setIsMobileOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="main-content-wrapper">
        <Header
          activePageLabel={getPageTitle(activePage)}
          onOpenMobile={() => setIsMobileOpen(true)}
          onNavigate={setActivePage}
        />

        <main id="main-content" role="main" style={{ flex: 1 }}>
          {activePage === NAV_PAGES.OVERVIEW && <OverviewPage onNavigate={setActivePage} />}
          {activePage === NAV_PAGES.JOURNEY && <JourneyPlannerPage />}
          {activePage === NAV_PAGES.LIVE_MAP && <LiveMapPage onNavigate={setActivePage} />}
          {activePage === NAV_PAGES.ROUTES && <BusRoutesPage onNavigate={setActivePage} />}
          {activePage === NAV_PAGES.ANALYTICS && <TrafficAnalyticsPage />}
          {activePage === NAV_PAGES.ALERTS && <AlertsPage />}
          {activePage === NAV_PAGES.SETTINGS && <SettingsPage onShowToast={showToast} />}
          {activePage === NAV_PAGES.HELP && <HelpPage />}
        </main>
      </div>

      {/* Mobile Dedicated Bottom Navigation Bar */}
      <BottomNav
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMenu={() => setIsMobileOpen(true)}
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
