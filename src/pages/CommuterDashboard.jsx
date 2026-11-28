import React, { useState, useEffect, useCallback } from 'react';
import { CommuterHeader } from '../components/commuter/CommuterHeader.jsx';
import { JourneySearch } from '../components/journey/JourneySearch.jsx';
import { RouteList } from '../components/journey/RouteList.jsx';
import { RouteDetails } from '../components/journey/RouteDetails.jsx';
import { CommuterMap } from '../components/commuter/CommuterMap.jsx';
import { planJourney } from '../services/journeyService.js';

/**
 * CommuterDashboard Component
 * Dedicated Everyday Commuter Dashboard with zero operator clutter.
 * 
 * Features:
 * - 'Everyday Commuter' profile badge
 * - 1-click 'Switch to Operator Profile' button
 * - Fix 1: Compact 1-Row Search Bar (results & map sit above the fold)
 * - Fix 2: Styled Tailwind Segmented Sort Pills (Fastest | Least Crowded | Leave Later) & clean chip spacing
 * - Fix 3: Fix Stuck Loading Text (shows 'Evaluating...' ONLY while loading, 'X Route Options Found' or empty state)
 * - Fix 4: 3 Comparison Cards (Fastest, More Comfortable, Leave 20 min Later for Seats) with Green/Amber/Red pills
 * - Fix 5: Real Multi-Stop Map (no fake diagonal line when empty, multi-stop stretch polylines colored by crowding)
 */
export function CommuterDashboard({
  onSwitchProfile,
  onSelectRole,
  onSwitchToOperator,
  onNavigate
}) {
  const [origin, setOrigin] = useState('Anand Vihar');
  const [destination, setDestination] = useState('Connaught Place');
  const [date, setDate] = useState('2026-11-22');
  const [time, setTime] = useState('18:00');
  const [dayType, setDayType] = useState('weekday');
  const [priority, setPriority] = useState('fastest');
  
  const [routes, setRoutes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedStretch, setSelectedStretch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const swapLocations = () => {
    const nextOrigin = destination;
    const nextDest = origin;
    setOrigin(nextOrigin);
    setDestination(nextDest);
    executeSearch({ origin: nextOrigin, destination: nextDest });
  };

  const executeSearch = useCallback(async (overrides = {}) => {
    const qOrigin = overrides.origin !== undefined ? overrides.origin : origin;
    const qDest = overrides.destination !== undefined ? overrides.destination : destination;
    const qDayType = overrides.dayType !== undefined ? overrides.dayType : dayType;
    const qTime = overrides.time !== undefined ? overrides.time : time;
    const qPriority = overrides.priority !== undefined ? overrides.priority : priority;

    if (!qOrigin || !qDest) return;
    setLoading(true);
    setError(null);
    try {
      const data = await planJourney({
        origin: qOrigin,
        destination: qDest,
        dayType: qDayType,
        departTime: qTime,
        passMultiplier: 1.2,
        busSize: 'auto',
        priority: qPriority
      });
      setRoutes(data.options || []);
      setSelectedIndex(0);
    } catch (err) {
      setError(err.message || 'Unable to load route options.');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [origin, destination, dayType, time, priority]);

  // Execute initial search on mount and when dayType/priority changes
  useEffect(() => {
    executeSearch();
  }, [priority, dayType]);

  const selectedRoute = routes[selectedIndex] || routes[0] || null;

  return (
    <div
      className="commuter-dashboard-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF'
      }}
    >
      {/* Distraction-Free Dedicated Commuter Header (Zero Operator Clutter) */}
      <CommuterHeader
        onSwitchProfile={onSwitchProfile}
        onSelectRole={onSelectRole}
        onSwitchToOperator={onSwitchToOperator}
        onNavigate={onNavigate}
      />

      <main
        id="main-content"
        role="main"
        style={{
          flex: 1,
          padding: '16px 20px 24px 20px',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Compact Hero Title */}
        <div style={{ marginBottom: '12px' }}>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: '0 0 2px 0'
            }}
          >
            Delhi Bus Journey Planner
          </h1>
          <p
            style={{
              fontSize: '12.5px',
              color: '#64748B',
              margin: 0
            }}
          >
            Crowding-aware transit routing powered by 2.55M October 2026 ground-truth journeys.
          </p>
        </div>

        {/* Fix 1 & Fix 2: Compact 1-Row Search Bar & Styled Segmented Pills */}
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
          onSearch={executeSearch}
          loading={loading}
        />

        {/* Error Notice */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              color: '#B91C1C',
              fontSize: '12px',
              marginBottom: '12px'
            }}
          >
            <span><strong>Connection Note:</strong> {error}</span>
            <button
              type="button"
              onClick={executeSearch}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* 2-Panel Results & Map Layout (Above the Fold) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(380px, 460px) 1fr',
            gap: '16px',
            alignItems: 'start',
            marginTop: '14px'
          }}
          className="commuter-2panel-grid"
        >
          {/* Left Column: Route Comparison Cards & Step-by-Step Itinerary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 230px)' }}>
            {/* Fix 3 & Fix 4: RouteList with stuck loading text fix and 3 comparison cards */}
            <RouteList
              routes={routes}
              selectedIndex={selectedIndex}
              onSelectIndex={(idx) => {
                setSelectedIndex(idx);
                setSelectedStretch(null);
              }}
              onSelectStretch={(stretch) => setSelectedStretch(stretch)}
              loading={loading}
              priority={priority}
            />

            {/* Step-by-Step Itinerary Details for Selected Card */}
            {selectedRoute && !loading && (
              <RouteDetails routeOption={selectedRoute} />
            )}
          </div>

          {/* Right Column: Fix 5 Real Multi-Stop Map */}
          <div
            style={{
              height: 'calc(100vh - 230px)',
              minHeight: '480px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <CommuterMap
              origin={origin}
              destination={destination}
              selectedRoute={selectedRoute}
              stretches={selectedRoute?.stretches || []}
              selectedStretch={selectedStretch}
              onSelectStretch={(stretch) => setSelectedStretch(stretch)}
              height="100%"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CommuterDashboard;
