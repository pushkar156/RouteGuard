export const initialRiskEvents = [
  { id: 'E1', lat: 31.2, lng: 121.5, type: 'cyclone', severity: 'high', title: 'Typhoon Songda', desc: 'Shanghai port operations suspended for 36h. Significant backlogs expected.' },
  { id: 'E2', lat: 51.9, lng: 4.1, type: 'engineering', severity: 'high', title: 'Rotterdam Port Strike', desc: 'Union action at ECT Delta terminal. Berth utilization at 0%. Diverting SHP-005 to Antwerp.' },
  { id: 'E3', lat: 29.9, lng: 32.5, type: 'policy', severity: 'medium', title: 'Suez Canal Congestion', desc: 'Increased wait times at Southern anchorage due to minor technical grounding. +12h delay.' }
];

export const initialAlerts = [
  { id: 'A1', shipmentId: 'SHP-001', eventId: 'E1', title: 'Typhoon Songda Impact', score: 92, timestamp: '12m ago', resolved: false, message: 'Hurricane force winds expected along path. Route recalculation required.' },
  { id: 'A2', shipmentId: 'SHP-005', eventId: 'E2', title: 'Rotterdam Diversion', score: 88, timestamp: '1h ago', resolved: false, message: 'Terminal offline. Suggest rerouting to Antwerp or Hamburg.' },
  { id: 'A3', shipmentId: 'SHP-008', eventId: 'E3', title: 'Suez Congestion', score: 45, timestamp: '3h ago', resolved: false, message: 'Minor grounding event has halted northbound convoy.' },
  { id: 'A4', shipmentId: 'SHP-022', eventId: null, title: 'Piracy Warning', score: 65, timestamp: '5h ago', resolved: false, message: 'Heightened piracy activity reported in Malacca Strait.' },
  { id: 'A5', shipmentId: 'SHP-012', eventId: null, title: 'Vessel Maintenance', score: 30, timestamp: '1d ago', resolved: true, message: 'Scheduled engine maintenance completed successfully.' }
];

export const initialShipments = [
  {
    id: 'SHP-001',
    name: 'SHP-001 (Vanguard)',
    origin: 'Shanghai',
    destination: 'Los Angeles',
    eta: 'Oct 12, 14:00',
    baseRiskScore: 92,
    mode: 'directions_boat',
    coords: [[31.2, 121.5], [34.0, -118.2]],
    events: [
      { name: 'Typhoon Songda', severity: 'CRITICAL', desc: 'Sustained winds of 140km/h expected in the Taiwan Strait. Vessel rerouting highly advised.', percent: 95 }
    ]
  },
  {
    id: 'SHP-005',
    name: 'SHP-005 (Mariner)',
    origin: 'Ningbo',
    destination: 'Rotterdam',
    eta: 'Oct 14, 09:30',
    baseRiskScore: 88,
    mode: 'directions_boat',
    coords: [[29.8, 121.5], [10, 105], [5, 80], [51.9, 4.1]],
    events: [
      { name: 'Rotterdam Labor Strike', severity: 'CRITICAL', desc: 'Labor dispute affecting terminal. Expected delay: 48-72 hours.', percent: 88 }
    ]
  },
  {
    id: 'SHP-008',
    name: 'SHP-008 (Navigator)',
    origin: 'Mumbai',
    destination: 'Genoa',
    eta: 'Oct 15, 12:00',
    baseRiskScore: 45,
    mode: 'directions_boat',
    coords: [[19.0, 72.8], [12, 45], [29, 32], [44.4, 8.9]],
    events: [
      { name: 'Suez Canal Congestion', severity: 'MODERATE', desc: 'Increased wait times at Southern anchorage. +12h delay.', percent: 45 }
    ]
  },
  {
    id: 'SHP-012',
    name: 'SHP-012 (Voyager)',
    origin: 'Busan',
    destination: 'Oakland',
    eta: 'Oct 10, 08:30',
    baseRiskScore: 12,
    mode: 'directions_boat',
    coords: [[35.1, 129.0], [37.8, -122.2]],
    events: []
  },
  {
    id: 'SHP-015',
    name: 'SHP-015 (Pioneer)',
    origin: 'Santos',
    destination: 'Hamburg',
    eta: 'Oct 18, 16:45',
    baseRiskScore: 15,
    mode: 'directions_boat',
    coords: [[-23.9, -46.3], [53.5, 9.9]],
    events: []
  },
  {
    id: 'SHP-022',
    name: 'SHP-022 (Explorer)',
    origin: 'Singapore',
    destination: 'Long Beach',
    eta: 'Oct 20, 11:00',
    baseRiskScore: 18,
    mode: 'directions_boat',
    coords: [[1.3, 103.8], [33.7, -118.1]],
    events: []
  },
  {
    id: 'SHP-029',
    name: 'SHP-029 (Trader)',
    origin: 'Durban',
    destination: 'Felixstowe',
    eta: 'Oct 22, 09:15',
    baseRiskScore: 22,
    mode: 'directions_boat',
    coords: [[-29.8, 31.0], [51.9, 1.3]],
    events: []
  },
  {
    id: 'SHP-031',
    name: 'SHP-031 (Merchant)',
    origin: 'Yokohama',
    destination: 'Savannah',
    eta: 'Oct 25, 14:30',
    baseRiskScore: 14,
    mode: 'directions_boat',
    coords: [[35.4, 139.6], [32.0, -81.0]],
    events: []
  },
  {
    id: 'SHP-038',
    name: 'SHP-038 (Carrier)',
    origin: 'Dubai',
    destination: 'Port Klang',
    eta: 'Oct 28, 07:00',
    baseRiskScore: 10,
    mode: 'directions_boat',
    coords: [[25.2, 55.2], [3.0, 101.4]],
    events: []
  },
  {
    id: 'SHP-044',
    name: 'SHP-044 (Hauler)',
    origin: 'Tanjung Pelepas',
    destination: 'Melbourne',
    eta: 'Oct 30, 20:00',
    baseRiskScore: 5,
    mode: 'directions_boat',
    coords: [[1.3, 103.5], [-37.8, 144.9]],
    events: []
  }
];

export const getRiskInfo = (score) => {
  if (score >= 70) return { level: 'High Risk', color: 'error' };
  if (score >= 40) return { level: 'Medium Risk', color: 'tertiary' };
  return { level: 'Low Risk', color: 'primary' };
};
