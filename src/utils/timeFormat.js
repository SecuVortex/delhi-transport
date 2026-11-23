/**
 * Time formatting utility supporting 12-hour (6:00 PM IST) vs 24-hour (18:00 IST).
 * 
 * @param {string|Date} timeInput - Time string (e.g. '18:00', '08:30:00') or Date
 * @param {'12h'|'24h'} format - Selected time format
 * @param {boolean} includeSuffix - Whether to append ' IST' timezone indicator (default true)
 * @returns {string} Formatted time string
 */
export function formatTime(timeInput, format = '12h', includeSuffix = true) {
  if (!timeInput) return '';

  let hours = 0;
  let minutes = 0;

  if (timeInput instanceof Date) {
    hours = timeInput.getHours();
    minutes = timeInput.getMinutes();
  } else if (typeof timeInput === 'string') {
    const parts = timeInput.trim().split(':');
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
      return timeInput;
    }
  } else {
    return String(timeInput);
  }

  if (isNaN(hours) || isNaN(minutes)) return String(timeInput);

  const suffix = includeSuffix ? ' IST' : '';
  const padMin = String(minutes).padStart(2, '0');

  if (format === '24h') {
    const padHr = String(hours).padStart(2, '0');
    return `${padHr}:${padMin}${suffix}`;
  }

  // 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  let hr12 = hours % 12;
  if (hr12 === 0) hr12 = 12;

  return `${hr12}:${padMin} ${period}${suffix}`;
}

/**
 * Parses time string and adds minutes, returning formatted result
 */
export function addMinutesToTime(timeInput, minutesToAdd = 20, format = '12h') {
  if (!timeInput) return '';
  const parts = String(timeInput).split(':');
  if (parts.length < 2) return timeInput;

  let hr = parseInt(parts[0], 10);
  let min = parseInt(parts[1], 10);
  if (isNaN(hr) || isNaN(min)) return timeInput;

  let totalMin = hr * 60 + min + minutesToAdd;
  totalMin = (totalMin + 1440) % 1440; // clamp to 24h day

  const newHr = Math.floor(totalMin / 60);
  const newMin = totalMin % 60;

  return formatTime(`${newHr}:${newMin}`, format);
}
