import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { JourneySearch } from '../components/journey/JourneySearch.jsx';
import { RouteList } from '../components/journey/RouteList.jsx';
import { RouteDetails } from '../components/journey/RouteDetails.jsx';
import { DelhiLeafletMap } from '../components/map/DelhiLeafletMap.jsx';
import { useJourneyPlanner } from '../hooks/useJourneyPlanner.js';

const RECENT_SEARCHES_KEY = 'metrotransit_recent_searches';

const DEFAULT_RECENT = [
  { origin: 'Anand Vihar', destination: 'Connaught Place' },
  { origin: 'Kapashera Border', destination: 'Nehru Place Terminal' },
  { origin: 'Rohini Sector 21', destination: 'Lajpat Nagar' }
];

/**
 * Journey Planner Page Component
 * Two-panel layout: route options and itinerary on the left, interactive Delhi Leaflet map on the right,
 * with recent searches history, 1-click Demo Preset, and live crowding indicators.
 */
export function JourneyPlannerPage() {
  const {
    origin,
    setOrigin,
    destination,
    setDestination,
    date,
    setDate,
    time,
    setTime,
    dayType,
    setDayType,
    passMultiplier,
    setPassMultiplier,
    busSize,
    setBusSize,
    priority,
    setPriority,
    routes,
    selectedRoute,
    selectedIndex,
    setSelectedIndex,
    swapLocations,
    executeSearch,
    loadDemoPreset,
    loading,
    error
  } = useJourneyPlanner();

  const [showModelDrawer, setShowModelDrawer] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_RECENT;
    } catch {
      return DEFAULT_RECENT;
    }
  });

  const handleSearchWithHistory = () => {
    executeSearch();

    if (origin && destination) {
      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (s) => !(s.origin === origin && s.destination === destination)
        );
        const updated = [{ origin, destination }, ...filtered].slice(0, 5);
        try {
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const applyRecentSearch = (item) => {
    setOrigin(item.origin);
    setDestination(item.destination);
    executeSearch();
  };

  const handlePrintItinerary = () => {
    window.print();
  };

  return (
    <PageLayout
      title="Journey Planner"
      subtitle="Crowdedness-aware transit routing across Delhi bus corridors powered by October 2026 ticketing data."
      actions={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowModelDrawer(!showModelDrawer)}
            title="Configure operator crowding multiplier and bus capacity assumptions"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Model Parameters ({passMultiplier}x, {busSize})
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePrintItinerary}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            Print Itinerary
          </Button>
        </div>
      }
    >
      {/* Model Assumptions Panel (Operator Drawer) */}
      {showModelDrawer && (
        <div className="ui-card" style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #CBD5E1', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Crowding Model Assumptions
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '8px' }}>
                Live parameters forwarded to backend inference engine
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowModelDrawer(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748B' }}
            >
              &times;
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Passenger Multiplier: {passMultiplier}x
              </label>
              <input
                type="range"
                min="1.0"
                max="1.4"
                step="0.05"
                value={passMultiplier}
                onChange={(e) => setPassMultiplier(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                1.0x (base ticketing) to 1.4x (unregistered/passengers multiplier)
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Bus Capacity Profile
              </label>
              <select
                className="form-select"
                value={busSize}
                onChange={(e) => setBusSize(e.target.value)}
                style={{ width: '100%', fontSize: '12px' }}
              >
                <option value="auto">Auto (GTFS Route Capacity Default)</option>
                <option value="12m">12m Standard Floor Bus (65 max capacity)</option>
                <option value="9m">9m Midi Feeder Bus (42 max capacity)</option>
              </select>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Controls crowding denominator load ratio
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Search Bar */}
      <JourneySearch
        origin={origin}
        onOriginChange={setOrigin}
        destination={destination}
        onDestinationChange={setDestination}
        date={date}
        onDateChange={setDate}
        time={time}
        onTimeChange={setTime}
        dayType={dayType}
        onDayTypeChange={setDayType}
        priority={priority}
        onPriorityChange={setPriority}
        onSwap={swapLocations}
        onSearch={handleSearchWithHistory}
        onDemoPreset={loadDemoPreset}
      />

      {/* Error / Fallback Banner */}
      {error && (
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#B91C1C', fontSize: '12.5px', marginBottom: '14px' }}>
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Recent Searches History Strip */}
      {recentSearches.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 4px', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            Recent Queries:
          </span>
          {recentSearches.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="station-chip"
              onClick={() => applyRecentSearch(item)}
              title={`Load route from ${item.origin} to ${item.destination}`}
            >
              <span>{item.origin}</span>
              <span style={{ margin: '0 4px', color: 'var(--color-text-secondary)' }}>&rarr;</span>
              <span>{item.destination}</span>
            </button>
          ))}
        </div>
      )}

      <div className="planner-layout">
        {/* Left Panel: Alternatives & Itinerary */}
        <div className="planner-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {loading ? 'Evaluating Delhi Bus Schedules...' : `${routes.length} Recommended Route Options`}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              Sorted by: {priority}
            </span>
          </div>

          <RouteList
            routes={routes}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
          />

          <RouteDetails routeOption={selectedRoute} />
        </div>

        {/* Right Panel: Synchronized Delhi Leaflet Map */}
        <div className="planner-map-container" style={{ minHeight: '440px', height: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <DelhiLeafletMap
            origin={origin}
            destination={destination}
            stretches={selectedRoute?.stretches || []}
            crowdingPill={selectedRoute?.crowding_pill || 'GREEN'}
          />
        </div>
      </div>
    </PageLayout>
  );
}
