import { useState, useEffect, useCallback } from 'react';
import { planJourney } from '../services/journeyService.js';

/**
 * Custom hook for journey planning state and search execution.
 * Preconfigured with the verified Delhi Demo Preset (Anand Vihar to Connaught Place).
 */
export function useJourneyPlanner(
  initialOrigin = 'Anand Vihar',
  initialDest = 'Connaught Place'
) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDest);
  const [date, setDate] = useState('2026-11-22');
  const [time, setTime] = useState('18:00');
  const [dayType, setDayType] = useState('weekday');
  const [passMultiplier, setPassMultiplier] = useState(1.2);
  const [busSize, setBusSize] = useState('auto');
  const [priority, setPriority] = useState('fastest');
  const [routes, setRoutes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const executeSearch = useCallback(async () => {
    if (!origin || !destination) return;
    setLoading(true);
    setError(null);
    try {
      const data = await planJourney({
        origin,
        destination,
        dayType,
        departTime: time,
        passMultiplier,
        busSize,
        priority
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

  const loadDemoPreset = () => {
    setOrigin('Anand Vihar');
    setDestination('Connaught Place');
    setTime('18:00');
    setDayType('weekday');
    setPassMultiplier(1.2);
    setBusSize('auto');
  };

  useEffect(() => {
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
