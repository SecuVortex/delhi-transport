/**
 * Demonstration Route Catalog Data
 * All transit frequencies, alignments, and stop sequences.
 */

export const DEMO_ROUTES = [
  {
    id: 'R-101',
    number: '101',
    name: 'Downtown Express',
    origin: 'Central Station',
    destination: 'West Technology Park',
    corridor: 'Radial',
    stopsCount: 14,
    duration: '28 min',
    frequency: 'Every 8 min',
    operatingHours: '05:30 - 23:45',
    status: 'Active',
    color: '#2563EB',
    delayAvg: '+1.5 min',
    onTimeRate: '96.2%',
    stops: [
      { name: 'Central Station Platform B', time: '0 min', transfer: 'Metro Line 1, Bus 102, 310', accessible: true },
      { name: 'Financial Plaza & 4th Ave', time: '4 min', transfer: 'Bus 104', accessible: true },
      { name: 'Civic Center West', time: '9 min', transfer: 'Bus 102, 205', accessible: true },
      { name: 'State Library & Pine St', time: '14 min', transfer: 'None', accessible: true },
      { name: 'Medical District North', time: '19 min', transfer: 'Bus 205', accessible: true },
      { name: 'Innovation Hub', time: '24 min', transfer: 'Bus 412', accessible: true },
      { name: 'West Technology Park Gate 1', time: '28 min', transfer: 'Shuttle A', accessible: true }
    ]
  },
  {
    id: 'R-102',
    number: '102',
    name: 'University Line',
    origin: 'Central Station',
    destination: 'University Campus North',
    corridor: 'Radial',
    stopsCount: 18,
    duration: '34 min',
    frequency: 'Every 10 min',
    operatingHours: '06:00 - 00:30',
    status: 'Active',
    color: '#64748B',
    delayAvg: '+2.1 min',
    onTimeRate: '93.5%',
    stops: [
      { name: 'Central Station Platform C', time: '0 min', transfer: 'Bus 101, 310', accessible: true },
      { name: 'Market Street Arcade', time: '5 min', transfer: 'Bus 104', accessible: true },
      { name: 'Civic Center South', time: '10 min', transfer: 'Bus 101, 205', accessible: true },
      { name: 'Arts Quarter', time: '16 min', transfer: 'None', accessible: false },
      { name: 'University Health Hospital', time: '22 min', transfer: 'Bus 412', accessible: true },
      { name: 'Campus Student Union', time: '29 min', transfer: 'Campus Loop', accessible: true },
      { name: 'University Campus North Terminal', time: '34 min', transfer: 'None', accessible: true }
    ]
  },
  {
    id: 'R-104',
    number: '104',
    name: 'Crosstown Rapid',
    origin: 'Civic Center',
    destination: 'East Harbor Terminal',
    corridor: 'Crosstown',
    stopsCount: 16,
    duration: '36 min',
    frequency: 'Every 12 min',
    operatingHours: '05:45 - 23:00',
    status: 'Detour',
    color: '#D97706',
    delayAvg: '+5.4 min',
    onTimeRate: '88.1%',
    stops: [
      { name: 'Civic Center Transit Hub', time: '0 min', transfer: 'Bus 101, 102', accessible: true },
      { name: 'Old Town Square', time: '7 min', transfer: 'None', accessible: true },
      { name: 'Grand Avenue (Detour bypass)', time: '15 min', transfer: 'Bus 205', accessible: true },
      { name: 'Harbor Gate West', time: '26 min', transfer: 'Ferry Line 1', accessible: true },
      { name: 'East Harbor Terminal', time: '36 min', transfer: 'Ferry Lines 1, 2', accessible: true }
    ]
  },
  {
    id: 'R-205',
    number: '205',
    name: 'Metro Ring Corridor',
    origin: 'Harbor Point',
    destination: 'Tech Corridor Loop',
    corridor: 'Circulator',
    stopsCount: 22,
    duration: '42 min',
    frequency: 'Every 15 min',
    operatingHours: '06:00 - 22:30',
    status: 'Active',
    color: '#16A34A',
    delayAvg: '+1.0 min',
    onTimeRate: '97.0%',
    stops: [
      { name: 'Harbor Point Pier 3', time: '0 min', transfer: 'Ferry Terminal', accessible: true },
      { name: 'South Industrial Park', time: '9 min', transfer: 'Bus 412', accessible: true },
      { name: 'Civic Center East', time: '18 min', transfer: 'Bus 101, 104', accessible: true },
      { name: 'Medical District South', time: '27 min', transfer: 'Bus 101', accessible: true },
      { name: 'Northgate Interchange', time: '35 min', transfer: 'Regional Rail', accessible: true },
      { name: 'Tech Corridor Loop', time: '42 min', transfer: 'Bus 101', accessible: true }
    ]
  },
  {
    id: 'R-310',
    number: '310',
    name: 'Airport Direct',
    origin: 'Central Station',
    destination: 'International Airport T1',
    corridor: 'Express',
    stopsCount: 8,
    duration: '22 min',
    frequency: 'Every 15 min',
    operatingHours: '04:30 - 01:00',
    status: 'Active',
    color: '#2563EB',
    delayAvg: '+0.8 min',
    onTimeRate: '98.5%',
    stops: [
      { name: 'Central Station Express Bay 1', time: '0 min', transfer: 'All Rail', accessible: true },
      { name: 'Financial District Air Lounge', time: '5 min', transfer: 'Bus 101', accessible: true },
      { name: 'Airport Parkway Station', time: '15 min', transfer: 'Park & Ride', accessible: true },
      { name: 'International Airport T1 Ground Transport', time: '22 min', transfer: 'Terminals 1, 2, 3', accessible: true }
    ]
  },
  {
    id: 'R-412',
    number: '412',
    name: 'South Valley Feeder',
    origin: 'Civic Center',
    destination: 'Valley Heights Interchange',
    corridor: 'Feeder',
    stopsCount: 20,
    duration: '38 min',
    frequency: 'Every 20 min',
    operatingHours: '06:15 - 22:00',
    status: 'Active',
    color: '#64748B',
    delayAvg: '+3.1 min',
    onTimeRate: '91.8%',
    stops: [
      { name: 'Civic Center Platform D', time: '0 min', transfer: 'Bus 101, 102', accessible: true },
      { name: 'Valley View Commons', time: '12 min', transfer: 'None', accessible: true },
      { name: 'Highland Park Hub', time: '24 min', transfer: 'Bus 205', accessible: true },
      { name: 'Valley Heights Interchange', time: '38 min', transfer: 'Suburban Bus 70', accessible: true }
    ]
  }
];
