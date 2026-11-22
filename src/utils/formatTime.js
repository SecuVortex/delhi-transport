/**
 * Time and Duration Formatting Utilities
 */

export function formatMinutes(totalMinutes) {
  if (typeof totalMinutes !== 'number' || totalMinutes <= 0) return '0 min';
  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
}

export function formatDelay(delayMinutes) {
  if (typeof delayMinutes !== 'number' || delayMinutes <= 0) {
    return 'On Schedule';
  }
  return `+${delayMinutes.toFixed(1)} min delay`;
}

export function formatTimeString(date) {
  const d = date instanceof Date ? date : new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
