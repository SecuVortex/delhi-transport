import { apiClient } from './apiClient.js';
import { DEMO_JOURNEY_RESULTS } from '../data/demoAlerts.js';

/**
 * Helper to compute arrival time string given HH:MM departure and duration in minutes
 */
function computeArrivalTime(departTimeStr = '18:00', durationMin = 25) {
  const parts = departTimeStr.split(':');
  const hours = parseInt(parts[0] || '18', 10);
  const mins = parseInt(parts[1] || '00', 10);
  const totalMins = hours * 60 + mins + durationMin;
  const arrHours = Math.floor(totalMins / 60) % 24;
  const arrMins = totalMins % 60;
  return `${String(arrHours).padStart(2, '0')}:${String(arrMins).padStart(2, '0')}`;
}

/**
 * Journey Planning Service
 * Queries the live FastAPI /plan endpoint on the local network.
 * Falls back to mock data only if VITE_USE_MOCK_FALLBACK is enabled.
 */
export async function planJourney({
  origin = 'Anand Vihar',
  destination = 'Connaught Place',
  dayType = 'weekday',
  departTime = '18:00',
  passMultiplier = 1.2,
  busSize = 'auto',
  priority = 'fastest'
} = {}) {
  try {
    const raw = await apiClient.planJourney({
      origin,
      destination,
      dayType,
      departTime,
      passMultiplier,
      busSize
    });

    if (raw && Array.isArray(raw.options) && raw.options.length > 0) {
      const options = raw.options.map((opt, index) => {
        const duration = opt.duration_min || 25;
        const arrTime = computeArrivalTime(departTime, duration);
        const stretches = opt.stretches || [];
        const pill = (opt.crowding_pill || 'GREEN').toUpperCase();

        const tag =
          pill === 'GREEN'
            ? 'Seats Available'
            : pill === 'AMBER'
            ? 'Moderate Load'
            : 'Crowded';

        const steps = stretches.map((st, i) => ({
          type: 'transit',
          label: `Board towards ${st.to_stop_name}`,
          detail: `From ${st.from_stop_name} to ${st.to_stop_name} (${st.crowding_level || pill})`
        }));

        if (steps.length === 0) {
          steps.push({
            type: 'transit',
            label: `Direct Transit to ${opt.to_stop_id}`,
            detail: `From ${opt.from_stop_id} to ${opt.to_stop_id} (${pill})`
          });
        }

        return {
          id: `opt-${index}`,
          title: `${opt.from_stop_id} to ${opt.to_stop_id}`,
          from_stop_id: opt.from_stop_id,
          to_stop_id: opt.to_stop_id,
          duration_min: duration,
          totalTime: `${duration} min`,
          depTime: departTime,
          arrTime: arrTime,
          crowding_pill: pill,
          load_ratio: opt.load_ratio !== undefined ? opt.load_ratio : 0.05,
          confidence: opt.confidence || 'MEDIUM',
          stretches: stretches,
          tag: tag,
          transfers: stretches.length > 1 ? stretches.length - 1 : 0,
          walkingDist: '200m (3 min)',
          fare: 'Rs 15',
          buses: [opt.from_stop_id.split(' ')[0] || 'Bus'],
          steps: steps
        };
      });

      // Priority sort
      if (priority === 'direct') {
        options.sort((a, b) => a.transfers - b.transfers);
      } else if (priority === 'minWalk') {
        options.sort((a, b) => parseInt(a.walkingDist, 10) - parseInt(b.walkingDist, 10));
      } else {
        options.sort((a, b) => a.duration_min - b.duration_min);
      }

      return {
        origin,
        destination,
        pass_multiplier: raw.pass_multiplier,
        bus_size: raw.bus_size,
        options
      };
    }

    throw new Error('No routes returned from live backend.');
  } catch (err) {
    if (apiClient.useMockFallback) {
      console.warn('API call failed, falling back to mock journey data:', err.message);
      return {
        origin,
        destination,
        options: DEMO_JOURNEY_RESULTS
      };
    }
    throw err;
  }
}

/**
 * Autocomplete search for Delhi bus stops
 */
export async function searchStops(query = '', limit = 15) {
  try {
    const res = await apiClient.searchStops(query, limit);
    return res.stops || [];
  } catch (err) {
    if (apiClient.useMockFallback) {
      return [
        'Anand Vihar Isbt',
        'Connaught Place',
        'Kapashera Border',
        'Nehru Place Terminal',
        'Lajpat Nagar',
        'Rohini Sector 21'
      ];
    }
    return [];
  }
}
