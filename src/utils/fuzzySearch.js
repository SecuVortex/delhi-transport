import { DELHI_STOP_COORDINATES } from '../components/operator/delhiCoordinates.js';

/**
 * Common Acronyms and Aliases for Delhi Transit Hubs
 */
export const ALIAS_MAP = {
  'cp': 'Connaught Place',
  'av': 'Anand Vihar ISBT',
  'isbt': 'Anand Vihar ISBT',
  'kg': 'Kashmere Gate',
  'kgisbt': 'ISBT Kashmere Gate',
  'np': 'Nehru Place',
  'sj': 'S J Hospital',
  'sjh': 'S J Hospital',
  'ai': 'AIIMS',
  'aiims': 'AIIMS',
  'ndls': 'New Delhi Railway Station',
  'dhaula': 'Dhaula Kuan',
  'rk': 'R K Puram',
  'rkp': 'R K Puram',
  'lajpat': 'Lajpat Nagar',
  'saket': 'Saket Metro Station',
  'hauz': 'Hauz Khas',
  'hk': 'Hauz Khas',
  'karol': 'Karol Bagh',
  'kb': 'Karol Bagh',
  'janak': 'Janakpuri',
  'noida': 'Noida Sector 62',
  'dwarka': 'Dwarka Sector 21',
  'ito': 'ITO Delhi Gate',
  'rf': 'Red Fort',
  'redfort': 'Red Fort'
};

/**
 * Connected DTC Bus Routes per Hub
 */
export const STOP_CONNECTED_ROUTES = {
  'anand vihar': [
    { route: 'Bus 740UP', corridor: 'Anand Vihar ISBT → Mandi House' },
    { route: 'Bus 543DOWN', corridor: 'Anand Vihar → Safdarjung Terminal' },
    { route: 'Bus 85AUP', corridor: 'Anand Vihar → Punjabi Bagh Terminal' },
    { route: 'Bus 391UP', corridor: 'Anand Vihar → Kalyanpuri' }
  ],
  'mandi house': [
    { route: 'Bus 740UP', corridor: 'Anand Vihar → Mandi House' },
    { route: 'Bus 442UP', corridor: 'Mandi House → Nehru Place' },
    { route: 'Bus 370UP', corridor: 'Mandi House → Nand Nagri' }
  ],
  'connaught place': [
    { route: 'Bus 740UP', corridor: 'Anand Vihar → Shivaji Stadium (CP)' },
    { route: 'Bus 894UP', corridor: 'Connaught Place → Karampura Terminal' },
    { route: 'Bus 433UP', corridor: 'New Delhi Station → Badarpur Border' }
  ],
  'kashmere gate': [
    { route: 'Bus 921UP', corridor: 'Kashmere Gate ISBT → Model Town' },
    { route: 'Bus 108DOWN', corridor: 'Kashmere Gate → Nehru Place' },
    { route: 'Bus 502UP', corridor: 'Kashmere Gate → Mehrauli Terminal' }
  ],
  'aiims': [
    { route: 'Bus 442UP', corridor: 'AIIMS → Nehru Place Terminal' },
    { route: 'Bus 543DOWN', corridor: 'AIIMS → Anand Vihar ISBT' },
    { route: 'Bus 623UP', corridor: 'AIIMS → Vasant Kunj Sector C' }
  ],
  'dhaula kuan': [
    { route: 'Bus 773DOWN', corridor: 'Dhaula Kuan → Dwarka Sector 21' },
    { route: 'Bus 724UP', corridor: 'Dhaula Kuan → Uttam Nagar' },
    { route: 'Bus 790AUP', corridor: 'Dhaula Kuan → Red Fort' }
  ],
  'nehru place': [
    { route: 'Bus 442UP', corridor: 'Nehru Place → Mandi House' },
    { route: 'Bus 543DOWN', corridor: 'Nehru Place → Anand Vihar' },
    { route: 'Bus 425UP', corridor: 'Nehru Place → Daryaganj' }
  ],
  'red fort': [
    { route: 'Bus 790AUP', corridor: 'Red Fort → Mahipal Pur' },
    { route: 'Bus 012(NS)UP', corridor: 'Red Fort → Daryaganj' },
    { route: 'Bus 261UP', corridor: 'Red Fort → Nand Nagri' }
  ],
  'model town': [
    { route: 'Bus 921UP', corridor: 'Model Town → Mall Road Ring Road' },
    { route: 'Bus 100UP', corridor: 'Model Town → Central Secretariat' }
  ],
  'karampura': [
    { route: 'Bus 975DOWN', corridor: 'Karampura Terminal → Pitampura' },
    { route: 'Bus 894UP', corridor: 'Karampura → Connaught Place' }
  ],
  'pitampura': [
    { route: 'Bus 975DOWN', corridor: 'Pitampura → Karampura Terminal' },
    { route: 'Bus 901UP', corridor: 'Pitampura → Mangolpuri' }
  ],
  'dwarka': [
    { route: 'Bus 773DOWN', corridor: 'Dwarka Sector 21 → Dhaula Kuan' },
    { route: 'Bus 724UP', corridor: 'Dwarka → Central Secretariat' }
  ]
};

const MAJOR_DELHI_HUBS = [
  'Anand Vihar ISBT',
  'Mandi House Roundabout',
  'Connaught Place',
  'Kashmere Gate ISBT',
  'AIIMS Delhi Gate',
  'Dhaula Kuan Interchange',
  'Nehru Place Terminal',
  'Red Fort Chandni Chowk',
  'Karampura Terminal',
  'Model Town Ring Road'
];

/**
 * In-memory cache for all searchable stops
 */
let CACHED_STOP_LIST = null;

function getNormalizedStops() {
  if (CACHED_STOP_LIST) return CACHED_STOP_LIST;

  const rawKeys = Object.keys(DELHI_STOP_COORDINATES);
  const formatted = rawKeys.map((key) => {
    const title = key
      .split(' ')
      .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase()))
      .join(' ');
    return {
      key: key.toLowerCase(),
      name: title,
      coords: DELHI_STOP_COORDINATES[key]
    };
  });

  // Ensure popular canonical stops are always present
  const popularCanonical = [
    'Anand Vihar ISBT',
    'Mandi House Roundabout',
    'Connaught Place',
    'Kashmere Gate ISBT',
    'AIIMS',
    'Dhaula Kuan',
    'Nehru Place Terminal',
    'Red Fort',
    'Karampura Terminal',
    'Model Town Ring Road',
    'Mall Road Ring Road',
    'Pitampura',
    'Subhash Place Depot',
    'Azadpur Terminal',
    'New Delhi Railway Station',
    'Nand Nagri Depot',
    'Lajpat Nagar',
    'Saket Metro Station',
    'Hauz Khas',
    'Karol Bagh',
    'Janakpuri'
  ];

  popularCanonical.forEach((canon) => {
    const k = canon.toLowerCase();
    if (!formatted.some((s) => s.key === k)) {
      formatted.push({
        key: k,
        name: canon,
        coords: DELHI_STOP_COORDINATES[k] || [28.6139, 77.209]
      });
    }
  });

  CACHED_STOP_LIST = formatted;
  return CACHED_STOP_LIST;
}

/**
 * Computes Levenshtein Distance between two strings
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Smart Search Engine:
 * - Triggers on 1+ character input
 * - Resolves acronyms/aliases (e.g. cp -> Connaught Place, av -> Anand Vihar)
 * - Exact prefix match > Substring match > Fuzzy match (distance <= 2)
 * - Returns grouped: matchingStops, connectedRoutes, nearbyHubs
 */
export function searchDelhiTransit(query = '', limit = 10) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return {
      matchingStops: [],
      connectedRoutes: [],
      nearbyHubs: MAJOR_DELHI_HUBS.slice(0, 4)
    };
  }

  const rawQ = query.trim().toLowerCase();
  const allStops = getNormalizedStops();

  // Check if query is an acronym alias
  const aliasMatch = ALIAS_MAP[rawQ];
  const searchQ = aliasMatch ? aliasMatch.toLowerCase() : rawQ;

  const exactPrefixMatches = [];
  const substringMatches = [];
  const fuzzyMatches = [];

  const matchedNamesSet = new Set();

  for (const stop of allStops) {
    if (matchedNamesSet.has(stop.name)) continue;

    // 1. Prefix match
    if (stop.key.startsWith(searchQ) || stop.key.startsWith(rawQ)) {
      exactPrefixMatches.push(stop);
      matchedNamesSet.add(stop.name);
      continue;
    }

    // Word start match (e.g., "vihar" in "anand vihar")
    const words = stop.key.split(' ');
    if (words.some((w) => w.startsWith(searchQ) || w.startsWith(rawQ))) {
      exactPrefixMatches.push(stop);
      matchedNamesSet.add(stop.name);
      continue;
    }

    // 2. Substring match
    if (stop.key.includes(searchQ) || stop.key.includes(rawQ)) {
      substringMatches.push(stop);
      matchedNamesSet.add(stop.name);
      continue;
    }

    // 3. Typo-tolerant Fuzzy match (for queries of 3+ chars)
    if (rawQ.length >= 3) {
      const dist = levenshteinDistance(rawQ, stop.key.slice(0, rawQ.length));
      if (dist <= 1) {
        fuzzyMatches.push(stop);
        matchedNamesSet.add(stop.name);
      }
    }
  }

  // Combine matching stops
  const matchingStops = [
    ...exactPrefixMatches,
    ...substringMatches,
    ...fuzzyMatches
  ].slice(0, limit);

  // Extract connected bus routes for matching stops
  const connectedRoutes = [];
  const seenRoutes = new Set();

  for (const stop of matchingStops) {
    const k = stop.key;
    for (const [hubKey, routes] of Object.entries(STOP_CONNECTED_ROUTES)) {
      if (k.includes(hubKey) || hubKey.includes(k)) {
        for (const r of routes) {
          if (!seenRoutes.has(r.route)) {
            seenRoutes.add(r.route);
            connectedRoutes.push({
              ...r,
              servingStop: stop.name
            });
          }
        }
      }
    }
    if (connectedRoutes.length >= 6) break;
  }

  // Similar or nearby hubs (filter out already matched ones)
  const nearbyHubs = MAJOR_DELHI_HUBS.filter(
    (hub) => !matchingStops.some((ms) => ms.name.toLowerCase() === hub.toLowerCase())
  ).slice(0, 3);

  return {
    matchingStops,
    connectedRoutes,
    nearbyHubs
  };
}

/**
 * Formats a string to highlight query matches
 * Returns an array of parts: [{ text: 'Anand ', isMatch: false }, { text: 'Vihar', isMatch: true }]
 */
export function splitHighlightParts(text = '', query = '') {
  if (!text || !query) return [{ text, isMatch: false }];
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) {
    return [{ text, isMatch: false }];
  }
  const parts = [];
  if (idx > 0) {
    parts.push({ text: text.slice(0, idx), isMatch: false });
  }
  parts.push({ text: text.slice(idx, idx + q.length), isMatch: true });
  if (idx + q.length < text.length) {
    parts.push({ text: text.slice(idx + q.length), isMatch: false });
  }
  return parts;
}
