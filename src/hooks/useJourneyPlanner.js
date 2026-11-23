import { useState, useEffect, useCallback, useRef } from 'react';
import { planJourney, getVerifiedDemoPreset } from '../services/journeyService.js';

/**
 * Custom hook for journey planning state and search execution.
 * Preconfigured with verified Delhi corridor stops (Anand Vihar ISBT to Mandi House Roundabout).
 */
export function useJourneyPlanner(
  initialOrigin = 'Anand Vihar',
  initialDest = 'Connaught Place'
) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDest);
  const [date, setDate] = useState('2026-11-22');
  const [time, setTime] = useState('08:00');
  const [dayType, setDayType] = useState('weekday');
  const [passMultiplier, setPassMultiplier] = useState(1.2);
  const [busSize, setBusSize] = useState('auto');
  const [priority, setPriority] = useState('fastest');
  const [routes, setRoutes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
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
    const qPassMultiplier = overrides.passMultiplier !== undefined ? overrides.passMultiplier : passMultiplier;
    const qBusSize = overrides.busSize !== undefined ? overrides.busSize : busSize;
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
        passMultiplier: qPassMultiplier,
        busSize: qBusSize,
        priority: qPriority
      });
      setRoutes(data.options || []);
      setSelectedIndex(0);
    } catch (err) {
      setError(err.message || 'Unable to connect to journey planning service.');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [origin, destination, dayType, time, passMultiplier, busSize, priority]);

  const loadDemoPreset = async () => {
    let presetOrigin = 'Anand Vihar';
    let presetDest = 'Connaught Place';
    let presetTime = '08:00';
    try {
      const preset = await getVerifiedDemoPreset();
      if (preset?.origin && preset?.destination) {
        presetOrigin = preset.origin;
        presetDest = preset.destination;
        presetTime = preset.departTime || '08:00';
      }
    } catch {
      // fallback
    }
    setOrigin(presetOrigin);
    setDestination(presetDest);
    setTime(presetTime);
    setDayType('weekday');
    setPassMultiplier(1.2);
    setBusSize('auto');
    setPriority('fastest');
    executeSearch({
      origin: presetOrigin,
      destination: presetDest,
      time: presetTime,
      dayType: 'weekday',
      passMultiplier: 1.2,
      busSize: 'auto',
      priority: 'fastest'
    });
  };

  const isMountedRef = useRef(false);

  // Initial search on mount
  useEffect(() => {
    executeSearch();
  }, []);

  // Re-run search when priority or dayType changes (skip duplicate initial execution)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    executeSearch();
  }, [priority, dayType, passMultiplier, busSize]);

  const selectedRoute = routes[selectedIndex] || null;

  return {
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
  };
}
