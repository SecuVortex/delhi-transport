import { useState } from 'react';

/**
 * Custom hook for Live Map layer toggles, zoom state, and vehicle selection.
 */
export function useMapFilters() {
  const [layers, setLayers] = useState({
    buses: true,
    routes: true,
    traffic: true
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedBusId, setSelectedBusId] = useState('BUS-101A');
  const [simulationRunning, setSimulationRunning] = useState(true);

  const toggleLayer = (layerName) => {
    setLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.15, 1.8));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
  };

  const toggleSimulation = () => {
    setSimulationRunning((prev) => !prev);
  };

  return {
    layers,
    toggleLayer,
    zoomLevel,
    zoomIn,
    zoomOut,
    selectedBusId,
    setSelectedBusId,
    simulationRunning,
    toggleSimulation
  };
}
