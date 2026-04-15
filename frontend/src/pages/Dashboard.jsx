import React from 'react';
import MapComponent from '../components/MapComponent';
import { getRiskInfo } from '../data/shipments';

const Dashboard = ({ shipments, alerts, selectedShipment, setSelectedShipment, setActiveScreen, simulationActive }) => {
  const unresolvedAlertsCount = alerts.filter(a => !a.resolved).length;
  const highRiskCount = shipments.filter(s => s.riskScore >= 70).length;

  const currentShipment = selectedShipment ? shipments.find(s => s.id === selectedShipment) : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {simulationActive && (
        <div className="w-full bg-primary-container text-on-primary-container py-2 px-8 flex items-center justify-center font-bold text-sm tracking-wide gap-2 shrink-0 z-10 shadow-md">
          <span className="material-symbols-outlined">warning</span>
          ⚠ Simulation active — scores are hypothetical
        </div>
      )}

      <header className="flex flex-col justify-center px-8 w-full h-24 bg-transparent shrink-0">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Shipment Dashboard</h1>
            <p className="text-sm text-secondary">{shipments.length} active shipments · {highRiskCount} high risk · {unresolvedAlertsCount} alerts</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input 
                className="bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary text-sm rounded-lg px-4 py-2 w-64 transition-all" 
                placeholder="Search shipments..." 
                type="text"
              />
              <span className="material-symbols-outlined absolute right-3 top-2 text-secondary text-xl">search</span>
            </div>
            <div className="flex items-center gap-4 text-secondary">
              <button className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <button className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="px-8 pb-12 flex-1 flex flex-col gap-8 overflow-y-auto z-0">
        {/* Shipment Table Container */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden shrink-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest/50">
                  <th className="px-6 py-4 text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">ID</th>
                  <th className="px-6 py-4 text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">Route</th>
                  <th className="px-6 py-4 text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">ETA</th>
                  <th className="px-6 py-4 text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">Risk Score</th>
                  <th className="px-6 py-4 text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">Risk Badge</th>
                  <th className="px-6 py-4 text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {shipments.map((shipment) => {
                  const riskInfo = getRiskInfo(shipment.riskScore);
                  const isSelected = selectedShipment === shipment.id;
                  
                  return (
                    <tr 
                      key={shipment.id} 
                      className={`transition-colors cursor-pointer group ${isSelected ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'}`}
                      onClick={() => setSelectedShipment(shipment.id)}
                    >
                      <td className="px-6 py-5 font-mono text-primary font-bold">{shipment.id}</td>
                      <td className="px-6 py-5">
                        {shipment.origin} <span className="text-secondary mx-1">→</span> {shipment.destination}
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">{shipment.eta}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className={`h-full bg-${riskInfo.color}`} style={{ width: `${shipment.riskScore}%` }}></div>
                          </div>
                          <span className={`text-xs font-bold text-${riskInfo.color}`}>{shipment.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 bg-${riskInfo.color}-container/20 text-${riskInfo.color} border border-${riskInfo.color}/30 text-[10px] font-bold uppercase rounded-full`}>
                          {riskInfo.level}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="material-symbols-outlined text-secondary">{shipment.mode}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">Total Shipments</span>
              <div className="text-5xl font-black tracking-tighter mt-2">{shipments.length}</div>
              <div className="mt-4 flex items-center gap-1 text-primary text-xs font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>Active global operations</span>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-20 text-secondary">inventory_2</span>
          </div>
          
          <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">High Risk</span>
              <div className="text-5xl font-black tracking-tighter mt-2 text-error">0{highRiskCount}</div>
              <div className="mt-4 flex items-center gap-1 text-error text-xs font-bold">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>Immediate action required</span>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-20 text-error">report_problem</span>
          </div>

          <div 
            className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group cursor-pointer hover:bg-surface-container-high transition-colors"
            onClick={() => setActiveScreen('Alerts')}
          >
            <div className="relative z-10">
              <span className="text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant">Unresolved Alerts</span>
              <div className="text-5xl font-black tracking-tighter mt-2 text-tertiary">0{unresolvedAlertsCount}</div>
              <div className="mt-4 flex items-center gap-1 text-tertiary text-xs font-bold">
                <span className="material-symbols-outlined text-sm">emergency_home</span>
                <span>Across system</span>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-20 text-tertiary">notifications_active</span>
          </div>
        </div>
      </div>

      {/* Detail Drawer Sidebar */}
      <aside 
        className={`fixed top-0 right-0 w-[380px] h-full bg-surface-container-high z-[60] shadow-2xl transform transition-transform border-l border-outline-variant/10 flex flex-col
        ${currentShipment ? 'translate-x-0' : 'translate-x-[100%]'}`}
      >
        {currentShipment && (
          <>
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">{currentShipment.id} Details</h2>
                <span className="text-xs text-secondary font-mono">{currentShipment.origin} → {currentShipment.destination}</span>
              </div>
              <button 
                onClick={() => setSelectedShipment(null)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* React Leaflet Map Component */}
              <div className="h-48 rounded-lg bg-surface-container-lowest overflow-hidden relative group cursor-pointer border border-transparent hover:border-primary/50 transition-colors"
                   onClick={() => setActiveScreen('Map')}
                   title="View on Main Map">
                <MapComponent center={currentShipment.coords[0]} routes={[
                  { position: currentShipment.coords[0], name: 'Origin', severity: '' },
                  { position: currentShipment.coords[currentShipment.coords.length - 1], name: 'Destination', severity: '' },
                  { path: currentShipment.coords, color: getRiskInfo(currentShipment.riskScore).color === 'error' ? '#ffb4ab' : '#ff8a65' }
                ]} />
                <div className="absolute top-2 right-2 bg-surface/80 p-1 rounded backdrop-blur">
                   <span className="material-symbols-outlined text-sm text-primary">open_in_full</span>
                </div>
              </div>
              
              <section>
                <h3 className="text-[0.6875rem] uppercase tracking-[0.05em] font-bold text-on-surface-variant mb-4">Affecting Risk Events</h3>
                <div className="space-y-4">
                  {currentShipment.events && currentShipment.events.length > 0 ? currentShipment.events.map((event, idx) => (
                     <div key={idx} className="bg-surface-container-lowest p-4 rounded-lg">
                       <div className="flex justify-between items-start mb-2">
                         <span className="text-sm font-bold text-on-surface">{event.name}</span>
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                            ${event.severity === 'CRITICAL' ? 'text-error bg-error/10 border border-error/20' : 'text-tertiary bg-tertiary/10 border border-tertiary/20'} `}>
                           {event.severity}
                         </span>
                       </div>
                       <div className="w-full h-1 bg-surface-container-highest rounded-full mb-3">
                         <div className={`h-full ${event.severity === 'CRITICAL' ? 'bg-error' : 'bg-tertiary'}`} style={{ width: `${event.percent}%` }}></div>
                       </div>
                       <p className="text-xs text-on-surface-variant leading-relaxed">
                         {event.desc}
                       </p>
                     </div>
                  )) : (
                    <div className="text-sm text-on-surface-variant">No critical events reported for this route.</div>
                  )}
                </div>
              </section>
            </div>
            {currentShipment.riskScore > 50 && (
              <div className="p-6 bg-surface-container-highest shrink-0">
                <button className="w-full py-3 bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
                    Recalculate Primary Route
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
};

export default Dashboard;
