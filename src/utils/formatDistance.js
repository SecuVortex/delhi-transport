/**
 * Distance and Pedestrian Calculation Utilities
 */

export function formatMeters(meters) {
  if (typeof meters !== 'number' || meters <= 0) return '0 m';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function calculateWalkingMinutes(meters, speedKmh = 4.5) {
  if (!meters || meters <= 0) return 0;
  const speedMpm = (speedKmh * 1000) / 60; // meters per minute
  return Math.ceil(meters / speedMpm);
}
