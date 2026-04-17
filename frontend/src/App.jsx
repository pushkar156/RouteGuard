import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import SimulatorPage from './pages/SimulatorPage';
import AlertsPage from './pages/AlertsPage';
function App() {
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  
  // Data state
  const [shipments, setShipments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskEvents, setRiskEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipmentsRes, alertsRes, eventsRes] = await Promise.all([
          fetch('http://localhost:3001/api/shipments'),
          fetch('http://localhost:3001/api/alerts'),
          fetch('http://localhost:3001/api/events')
        ]);
        
        const shipmentsData = await shipmentsRes.json();
        const alertsData = await alertsRes.json();
        const eventsData = await eventsRes.json();

        setShipments(shipmentsData.map(s => ({...s, riskScore: s.baseRiskScore})));
        setAlerts(alertsData);
        setRiskEvents(eventsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resolveAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  };

  const triggerSimulation = (targetLocation, severityScore) => {
    setSimulationActive(true);
    setShipments(prev => prev.map(shipment => {
      // Simple dynamic bump: If the shipment is going to/from the target, increase its score
      if (shipment.origin.includes(targetLocation) || shipment.destination.includes(targetLocation)) {
        return { ...shipment, riskScore: Math.min(100, shipment.baseRiskScore + severityScore) };
      }
      return shipment;
    }));
  };

  const resetSimulation = () => {
    setSimulationActive(false);
    setShipments(prev => prev.map(shipment => ({ ...shipment, riskScore: shipment.baseRiskScore })));
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
    <Layout activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
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
