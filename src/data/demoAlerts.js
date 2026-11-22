/**
 * Demonstration Service Alerts, Congestion Hotspots, and Departures Data
 */

export const DEMO_ALERTS = [
  {
    id: 'ALT-101',
    type: 'Route Detour',
    corridor: 'Main St & 3rd Ave',
    affectedRoutes: ['Route 104', 'Route 412'],
    severity: 'Moderate',
    severityClass: 'warning',
    reportedTime: '12 min ago',
    status: 'Active',
    description: 'Scheduled utility maintenance between 3rd Ave and Grand St. Buses rerouted via 4th Ave bypass. 2 stops temporarily closed.',
    impact: 'Estimated delay +6 to 8 minutes on Route 104.',
    expectedClearance: '18:30 Today'
  },
  {
    id: 'ALT-102',
    type: 'Heavy Congestion',
    corridor: 'West Expressway Corridor',
    affectedRoutes: ['Route 101', 'Route 205'],
    severity: 'Moderate',
    severityClass: 'warning',
    reportedTime: '24 min ago',
    status: 'Active',
    description: 'High commuter vehicle volume approaching Innovation Hub ramp. Reduced corridor travel speeds to 18 km/h.',
    impact: 'Delays of 4 to 6 minutes expected.',
    expectedClearance: '18:45 Today'
  },
  {
    id: 'ALT-103',
    type: 'Emergency Road Closure',
    corridor: 'Harbor Bridge Outer Lane',
    affectedRoutes: ['Route 104'],
    severity: 'Severe',
    severityClass: 'error',
    reportedTime: '45 min ago',
    status: 'Investigating',
    description: 'Single lane closure on Harbor Bridge westbound approach due to stalled commercial vehicle. Traffic control on site.',
    impact: 'Severe bus headway variance. Route 104 running with +10 min gap.',
    expectedClearance: '17:15 Today'
  },
  {
    id: 'ALT-104',
    type: 'Platform Maintenance',
    corridor: 'Civic Center Station Bay 2',
    affectedRoutes: ['Route 102'],
    severity: 'Advisory',
    severityClass: 'neutral',
    reportedTime: '1 hr ago',
    status: 'Active',
    description: 'Escalator repair at Bay 2. Boarding shifted to adjacent Bay 3. Wheelchair elevator remains fully operational.',
    impact: 'No service delay. Minor passenger walking adjustment.',
    expectedClearance: '20:00 Today'
  },
  {
    id: 'ALT-105',
    type: 'Signal Timing Disruption',
    corridor: 'Financial District Intersection 7',
    affectedRoutes: ['Route 101', 'Route 310'],
    severity: 'Advisory',
    severityClass: 'neutral',
    reportedTime: '2 hrs ago',
    status: 'Resolved',
    description: 'Traffic signal phase synchronization failure resolved by municipal traffic management center.',
    impact: 'Normal transit schedule restored.',
    expectedClearance: 'Resolved'
  }
];

export const DEMO_HOTSPOTS = [
  {
    location: 'West Expressway & Tech Gate 1',
    congestionLevel: 'High (84%)',
    congestionClass: 'error',
    affectedRoutes: '101, 205',
    avgDelay: '+6.2 min',
    cause: 'Peak hour bottleneck',
    status: 'Congested'
  },
  {
    location: 'Main St & Grand Ave Junction',
    congestionLevel: 'Moderate (68%)',
    congestionClass: 'warning',
    affectedRoutes: '104, 412',
    avgDelay: '+4.8 min',
    cause: 'Utility construction detour',
    status: 'Detour in effect'
  },
  {
    location: 'Civic Center Rotary',
    congestionLevel: 'Moderate (54%)',
    congestionClass: 'warning',
    affectedRoutes: '101, 102, 205',
    avgDelay: '+3.1 min',
    cause: 'Signal cycle density',
    status: 'Active Monitoring'
  },
  {
    location: 'Harbor Blvd Approach',
    congestionLevel: 'Moderate (49%)',
    congestionClass: 'warning',
    affectedRoutes: '104',
    avgDelay: '+3.0 min',
    cause: 'Bridge lane restriction',
    status: 'Active Monitoring'
  },
  {
    location: 'Central Station Bus Loop',
    congestionLevel: 'Low (26%)',
    congestionClass: 'success',
    affectedRoutes: '101, 102, 310',
    avgDelay: '+0.5 min',
    cause: 'Optimal dispatch flow',
    status: 'Normal Flow'
  }
];

export const DEMO_NEARBY_STOPS = [
  { name: 'Central Station Bay 1', lines: ['101', '310'], nextArrival: '3 min', status: 'On Time', accessible: true },
  { name: 'Central Station Bay 2', lines: ['102'], nextArrival: '6 min', status: 'On Time', accessible: true },
  { name: 'Financial Plaza North', lines: ['101', '104'], nextArrival: '2 min', status: '+2 min', accessible: true },
  { name: 'State Library Stop', lines: ['101'], nextArrival: '8 min', status: 'On Time', accessible: false },
  { name: 'Civic Center Hub', lines: ['101', '102', '205'], nextArrival: '4 min', status: '+1 min', accessible: true }
];

export const DEMO_JOURNEY_RESULTS = [
  {
    id: 'res-1',
    title: 'Fastest Route - Single Transfer',
    tag: 'Recommended',
    totalTime: '28 min',
    depTime: '12:15',
    arrTime: '12:43',
    transfers: 1,
    walkingDist: '350m (4 min)',
    fare: '$2.75',
    buses: ['Bus 101', 'Bus 205'],
    steps: [
      { type: 'walk', label: 'Walk to Central Station Platform B', detail: '350 meters, approx 4 min' },
      { type: 'bus', label: 'Board Bus 101 towards Civic Center', detail: 'Depart 12:19 from Platform B (5 stops, 14 min)' },
      { type: 'transfer', label: 'Transfer at Civic Center Interchange', detail: 'Platform B to Platform D, 3 min connection window' },
      { type: 'bus', label: 'Board Bus 205 towards West Tech Park', detail: 'Depart 12:36 (3 stops, 7 min)' },
      { type: 'walk', label: 'Arrive at West Technology Park Gate 1', detail: 'Walk 120m to destination entrance' }
    ]
  },
  {
    id: 'res-2',
    title: 'Direct Route - No Transfers',
    tag: 'Direct Service',
    totalTime: '36 min',
    depTime: '12:20',
    arrTime: '12:56',
    transfers: 0,
    walkingDist: '580m (7 min)',
    fare: '$2.25',
    buses: ['Bus 104'],
    steps: [
      { type: 'walk', label: 'Walk to Market Street Arcade Stop', detail: '580 meters, approx 7 min' },
      { type: 'bus', label: 'Board Bus 104 direct to Tech Corridor Bypass', detail: 'Depart 12:27 (11 stops, 26 min)' },
      { type: 'walk', label: 'Arrive at destination', detail: 'Walk 200m to entrance' }
    ]
  },
  {
    id: 'res-3',
    title: 'Least Walking Option',
    tag: 'Accessible Path',
    totalTime: '34 min',
    depTime: '12:18',
    arrTime: '12:52',
    transfers: 1,
    walkingDist: '160m (2 min)',
    fare: '$2.75',
    buses: ['Bus 102', 'Bus 205'],
    steps: [
      { type: 'walk', label: 'Walk to Central Station Terminal Bay 2', detail: '160 meters, step-free tactile path' },
      { type: 'bus', label: 'Board Bus 102 towards Civic Center', detail: 'Depart 12:20 (4 stops, 12 min)' },
      { type: 'transfer', label: 'Step-free transfer at Civic Center Center Bay', detail: 'Cross platform, 4 min window' },
      { type: 'bus', label: 'Board Bus 205 to Tech Park South', detail: 'Depart 12:36 (4 stops, 14 min)' },
      { type: 'walk', label: 'Arrive at destination', detail: 'Step-free entrance' }
    ]
  }
];
