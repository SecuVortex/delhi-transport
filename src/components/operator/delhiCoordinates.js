/**
 * Delhi Transit Stop Coordinates Directory
 * Provides geographic grounding for DTC bus stops and terminals.
 * Guards against null, undefined, or empty stop names.
 */

export const DELHI_STOP_COORDINATES = {
  // Eastern Radial & Anand Vihar Corridor
  'anand vihar': [28.6488, 77.2871],
  'anand vihar isbt': [28.6488, 77.2871],
  'mother dairy': [28.6310, 77.2990],
  'mother dairy patparganj': [28.6310, 77.2990],
  'nirman vihar': [28.6360, 77.2850],
  'nirman vihar metro station': [28.6360, 77.2850],
  'shakarpur': [28.6295, 77.2750],
  'shakarpur crossing': [28.6295, 77.2750],
  'ito': [28.6289, 77.2415],
  'ito delhi gate': [28.6289, 77.2415],
  'mandi house': [28.6260, 77.2340],
  'mandi house roundabout': [28.6260, 77.2340],
  'connaught place': [28.6313, 77.2144],
  'super bazar': [28.6313, 77.2144],

  // Northern Radial & Kashmere Gate Corridor
  'kashmere gate': [28.6665, 77.2294],
  'isbt kashmere gate': [28.6665, 77.2294],
  'isbt kashmere gate terminal': [28.6665, 77.2294],
  'delhi gate': [28.6406, 77.2403],
  'chauhan patti': [28.7450, 77.2620],
  'chauhan patti (terminal)': [28.7450, 77.2620],
  'timarpur': [28.6970, 77.2230],
  'bara hindu rao': [28.6630, 77.2050],
  'model town': [28.7050, 77.1930],
  'model town iii': [28.7050, 77.1930],
  'subhash place': [28.6930, 77.1520],
  'subhash place depot': [28.6930, 77.1520],
  'shalimar bagh': [28.7120, 77.1650],
  'shalimar bagh crossing': [28.7120, 77.1650],
  'kali mata mandir': [28.7180, 77.1710],
  'azadpur': [28.7070, 77.1750],
  'azadpur terminal': [28.7070, 77.1750],
  'wazirpur': [28.6980, 77.1620],
  'pitampura': [28.6990, 77.1380],
  'gujranwala town': [28.7020, 77.1950],
  'new delhi railway station': [28.6430, 77.2190],
  'new delhi railway station gate 1': [28.6430, 77.2190],

  // North-East / Trans-Yamuna
  'nand nagri': [28.6920, 77.3080],
  'nand nagri depot': [28.6920, 77.3080],
  'yamuna vihar': [28.6980, 77.2750],
  'c4 yamuna vihar terminal': [28.6980, 77.2750],
  'loni road': [28.7060, 77.2890],
  'dr. b.r. ambedkar collage': [28.7060, 77.2890],
  'shahdara': [28.6730, 77.2880],
  'dilshad garden': [28.6759, 77.3210],
  'mayur vihar': [28.6080, 77.2950],

  // South & South-West Corridors
  'aiims': [28.5672, 77.2100],
  'r k puram': [28.5650, 77.1750],
  'r k puram sec-1': [28.5650, 77.1750],
  's j hospital': [28.5710, 77.2070],
  'south extension': [28.5710, 77.2220],
  'south extension 1': [28.5710, 77.2220],
  'lajpat nagar': [28.5700, 77.2400],
  'nehru place': [28.5494, 77.2528],
  'nehru place terminal': [28.5494, 77.2528],
  'chirag delhi': [28.5420, 77.2270],
  'pushpa bhawan': [28.5350, 77.2280],
  'andrews ganj': [28.5660, 77.2290],
  'sarai kale khan': [28.5910, 77.2560],
  'okhla': [28.5300, 77.2700],
  'badarpur': [28.4900, 77.3000],
  'mehrauli': [28.5200, 77.1800],
  'qutub minar': [28.5245, 77.1855],
  'masood pur': [28.5380, 77.1510],
  'masood pur dairy': [28.5380, 77.1510],
  'chhattarpur': [28.5020, 77.1860],
  'chhattarpur more': [28.5020, 77.1860],
  'nanakpura': [28.5830, 77.1680],
  'nanakpura gurudwara': [28.5830, 77.1680],
  'dhaula kuan': [28.5900, 77.1600],

  // West & North-West Corridors
  'tilak nagar': [28.6366, 77.0963],
  'tilak nagar terminal': [28.6366, 77.0963],
  'dholi piao': [28.6320, 77.0850],
  'lajwanti garden': [28.6180, 77.1150],
  'janakpuri': [28.6210, 77.0870],
  'uttam nagar': [28.6210, 77.0580],
  'dwarka': [28.5920, 77.0460],
  'dwarkasec-9/10': [28.5820, 77.0620],
  'dwarkasec-9/10 x-ing': [28.5820, 77.0620],
  'dwarka sec-22/23': [28.5630, 77.0420],
  'dwarka sec-22/23 crossing': [28.5630, 77.0420],
  'rohini': [28.7180, 77.0650],
  'rohini sector 21': [28.7180, 77.0650],
  'karol bagh': [28.6514, 77.1907],
  'kapashera': [28.5250, 77.0850]
};

export const DELHI_BOUNDS = {
  minLat: 28.40,
  maxLat: 28.90,
  minLng: 76.80,
  maxLng: 77.40
};

/**
 * Clamps coordinates strictly within Delhi transit operating boundaries.
 */
export function clampToDelhiBounds(lat, lng) {
  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 28.6250;
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : 77.2150;
  return [
    Math.max(DELHI_BOUNDS.minLat, Math.min(DELHI_BOUNDS.maxLat, safeLat)),
    Math.max(DELHI_BOUNDS.minLng, Math.min(DELHI_BOUNDS.maxLng, safeLng))
  ];
}

/**
 * Safely resolves coordinates [lat, lng] for any Delhi stop.
 * Guards against null, undefined, or empty names and returns valid Delhi bounds.
 */
export function getStopCoordinates(stopName, defaultLat = 28.6200, defaultLng = 77.2100) {
  if (!stopName || typeof stopName !== 'string') {
    return clampToDelhiBounds(defaultLat, defaultLng);
  }

  const normalized = stopName.trim().toLowerCase();

  // Exact or partial substring match
  for (const [key, coords] of Object.entries(DELHI_STOP_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      if (Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return clampToDelhiBounds(coords[0], coords[1]);
      }
    }
  }

  // Deterministic fallback inside Delhi transit boundaries
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.16;
  const lngOffset = ((Math.abs(hash >> 3) % 1000) / 1000 - 0.5) * 0.20;

  const lat = 28.6250 + latOffset;
  const lng = 77.2150 + lngOffset;

  return clampToDelhiBounds(
    isNaN(lat) ? defaultLat : lat,
    isNaN(lng) ? defaultLng : lng
  );
}
