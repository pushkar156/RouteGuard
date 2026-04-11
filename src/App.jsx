import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import SimulatorPage from './pages/SimulatorPage';
import AlertsPage from './pages/AlertsPage';
import { initialShipments, initialAlerts, initialRiskEvents } from './data/shipments';

function App() {
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [shipments, setShipments] = useState(initialShipments.map(s => ({...s, riskScore: s.baseRiskScore})));
  const [alerts, setAlerts] = useState(initialAlerts);
  const [riskEvents, setRiskEvents] = useState(initialRiskEvents);

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
      {renderActiveScreen()}
    </Layout>
  );
}

export default App;
