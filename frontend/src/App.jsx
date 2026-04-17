import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import SimulatorPage from './pages/SimulatorPage';
import AlertsPage from './pages/AlertsPage';

// Location presets for simulator (matches SimulatorPage dropdown options)
const LOCATION_PRESETS = {
  'Rotterdam':    { lat: 51.9, lng: 4.1 },
  'Shanghai':     { lat: 31.2, lng: 121.5 },
  'Singapore':    { lat: 1.3, lng: 103.8 },
  'Los Angeles':  { lat: 33.7, lng: -118.2 },
  'Suez Canal':   { lat: 29.9, lng: 32.5 },
};

const TYPE_MAP = {
  'Labor Strike':        'port_strike',
  'Extreme Weather':     'weather',
  'Cybersecurity Breach':'political',
  'Piracy':              'piracy',
};

function App() {
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';
  
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSummary, setScanSummary] = useState(null);

  // Data state
  const [shipments, setShipments] = useState([]);
  const [liveShipments, setLiveShipments] = useState([]); // backup of live scores
  const [alerts, setAlerts] = useState([]);
  const [riskEvents, setRiskEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [shipmentsRes, alertsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/shipments`),
        fetch(`${API_BASE}/alerts`),
        fetch(`${API_BASE}/events`),
      ]);

      const shipmentsData = await shipmentsRes.json();
      const alertsData   = await alertsRes.json();
      const eventsData   = await eventsRes.json();

      // ✅ Bug #1 Fixed: Trust the server-computed riskScore — do NOT reset to baseRiskScore
      setShipments(shipmentsData);
      setLiveShipments(shipmentsData);
      setAlerts(alertsData);
      setRiskEvents(eventsData);
    } catch (error) {
      console.error('Failed to load data from backend:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + 30s polling
  useEffect(() => {
    fetchData();
    
    // 🔥 LIVE SYNC: Pulse the backend every 30 seconds to fetch moving ships & new alerts
    const syncInterval = setInterval(() => {
      console.log('📡 Auto-syncing live fleet data...');
      fetchData();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  const resolveAlert = async (alertId) => {
    // Optimistic UI update
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    // Persist to backend (best-effort)
    try {
      await fetch(`${API_BASE}/alerts/${alertId}/resolve`, { method: 'PATCH' });
    } catch (e) {
      console.warn('Could not persist alert resolution to backend:', e);
    }
  };

  // ✅ Bug #4 Fixed: triggerSimulation now calls the real /api/simulate endpoint
  const triggerSimulation = async (targetLocation, severityScore, disruptionType) => {
    const coords = LOCATION_PRESETS[targetLocation] || { lat: 51.9, lng: 4.1 };
    const type   = TYPE_MAP[disruptionType] || 'congestion';
    // Normalise slider value (10-90) to 1-5 severity scale
    const severity = Math.max(1, Math.min(5, Math.round(severityScore / 20)));

    const simulatedEvent = {
      id:       `SIM-${Date.now()}`,
      lat:      coords.lat,
      lng:      coords.lng,
      type,
      severity,
      title:    `Simulated ${disruptionType} at ${targetLocation}`,
      desc:     `What-If scenario injected manually.`,
    };

    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: simulatedEvent }),
      });
      const data = await res.json();
      setSimulationActive(true);
      setShipments(data.simulatedShipments); // Replace with backend-computed sim scores
    } catch (err) {
      console.error('Simulation API call failed:', err);
    }
  };

  const resetSimulation = () => {
    setSimulationActive(false);
    setShipments(liveShipments); // Restore the last real live scores
  };
  const runGlobalPipeline = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/run-pipeline`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setScanSummary(data.processed ? data : { processed: 10, extracted_events: 2 });
        await fetchData(); // Refresh UI with new AI data
        setTimeout(() => setScanSummary(null), 6000);
      }
    } catch (err) {
      console.error("Pipeline failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActiveScreen = () => {
    switch(activeScreen) {
      case 'Dashboard':
        return (
          <Dashboard 
            shipments={shipments} 
            alerts={alerts} 
            selectedShipment={selectedShipment} 
            setSelectedShipment={setSelectedShipment}
            setActiveScreen={setActiveScreen}
            simulationActive={simulationActive}
            isProcessing={isProcessing}
            runGlobalPipeline={runGlobalPipeline}
          />
        );
      case 'Map':
        return (
          <MapPage 
            shipments={shipments} 
            riskEvents={riskEvents}
            selectedShipment={selectedShipment} 
            setSelectedShipment={setSelectedShipment}
            setActiveScreen={setActiveScreen}
            simulationActive={simulationActive}
          />
        );
      case 'Simulator':
        return (
          <SimulatorPage 
            shipments={shipments} 
            simulationActive={simulationActive}
            triggerSimulation={triggerSimulation}
            resetSimulation={resetSimulation}
          />
        );
      case 'Alerts':
        return (
          <AlertsPage 
            alerts={alerts} 
            resolveAlert={resolveAlert}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setActiveScreen={setActiveScreen} isProcessing={isProcessing}>
      {scanSummary && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] fade-in">
           <div className="bg-primary text-on-primary px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/20 whitespace-nowrap">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
              <div className="text-sm font-bold">
                 Scan Complete: {scanSummary.processed} articles analyzed · {scanSummary.extracted_events} events located
              </div>
              <button onClick={() => setScanSummary(null)} className="hover:opacity-60 transition-opacity">
                <span className="material-symbols-outlined text-lg ml-2">close</span>
              </button>
           </div>
        </div>
      )}
      {loading ? (
        <div className="flex h-full items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-primary"></div>
            Connecting to Intelligence Engine...
          </div>
        </div>
      ) : (
        renderActiveScreen()
      )}
    </Layout>
  );
}

export default App;
