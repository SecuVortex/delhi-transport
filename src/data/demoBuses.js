/**
 * Demonstration Active Bus Fleet Telemetry Data
 * Explicitly documented as simulated demonstration telemetry.
 */

export const DEMO_BUSES = [
  {
    id: 'BUS-101A',
    routeNumber: '101',
    routeName: 'Downtown Express',
    direction: 'Northbound to Tech Park',
    location: '5th Ave & Pine St',
    nextStop: 'State Library & Pine St',
    eta: '2 min',
    status: 'Delayed (+3 min)',
    statusType: 'warning',
    occupancy: 'Moderate (62%)',
    speed: '28 km/h',
    lastPing: '8 sec ago',
    x: 320,
    y: 210
  },
  {
    id: 'BUS-101B',
    routeNumber: '101',
    routeName: 'Downtown Express',
    direction: 'Southbound to Central Station',
    location: 'Innovation Hub Parkway',
    nextStop: 'Medical District North',
    eta: '4 min',
    status: 'On Schedule',
    statusType: 'success',
    occupancy: 'Light (34%)',
    speed: '34 km/h',
    lastPing: '14 sec ago',
    x: 480,
    y: 160
  },
  {
    id: 'BUS-102A',
    routeNumber: '102',
    routeName: 'University Line',
    direction: 'Northbound to Campus',
    location: 'Arts Quarter Way',
    nextStop: 'University Health Hospital',
    eta: '3 min',
    status: 'On Schedule',
    statusType: 'success',
    occupancy: 'High (84%)',
    speed: '22 km/h',
    lastPing: '5 sec ago',
    x: 290,
    y: 290
  },
  {
    id: 'BUS-104C',
    routeNumber: '104',
    routeName: 'Crosstown Rapid',
    direction: 'Eastbound to Harbor',
    location: 'Grand Avenue Detour Corridor',
    nextStop: 'Harbor Gate West',
    eta: '7 min',
    status: 'Delayed (+6 min)',
    statusType: 'error',
    occupancy: 'High (78%)',
    speed: '16 km/h',
    lastPing: '11 sec ago',
    x: 420,
    y: 260
  },
  {
    id: 'BUS-205A',
    routeNumber: '205',
    routeName: 'Metro Ring Corridor',
    direction: 'Clockwise to Tech Loop',
    location: 'South Industrial Gateway',
    nextStop: 'Civic Center East',
    eta: '5 min',
    status: 'On Schedule',
    statusType: 'success',
    occupancy: 'Moderate (55%)',
    speed: '31 km/h',
    lastPing: '19 sec ago',
    x: 230,
    y: 350
  },
  {
    id: 'BUS-310B',
    routeNumber: '310',
    routeName: 'Airport Direct',
    direction: 'Express to Airport T1',
    location: 'Airport Expressway Km 4',
    nextStop: 'International Airport T1',
    eta: '6 min',
    status: 'On Schedule',
    statusType: 'success',
    occupancy: 'Moderate (48%)',
    speed: '65 km/h',
    lastPing: '3 sec ago',
    x: 580,
    y: 320
  }
];
