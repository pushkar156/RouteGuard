import React from 'react';
import MultiMapComponent from '../components/MultiMapComponent';
import { getRiskInfo } from '../data/shipments';

const MapPage = ({ shipments, riskEvents, selectedShipment, setSelectedShipment, simulationActive }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-surface-container-lowest relative text-on-surface fade-in">
      {simulationActive && (
        <div className="w-full bg-primary-container text-on-primary-container py-2 px-8 flex items-center justify-center font-bold text-sm tracking-wide gap-2 shrink-0 z-[60] shadow-md absolute top-0 left-0">
          <span className="material-symbols-outlined">warning</span>
          ⚠ Simulation active — scores are hypothetical
        </div>
      )}

      {/* Top Bar Floating above Map */}
      <header className={`absolute ${simulationActive ? 'top-10' : 'top-0'} left-0 right-0 flex items-center justify-between px-8 h-20 bg-glass z-40`}>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Global Fleet Tracking</h2>
          <p className="text-[11px] text-secondary flex items-center gap-1.5 uppercase tracking-wide">
             <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> {riskEvents.length} active events · Mapping
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 bg-surface-container-lowest rounded-lg border border-outline-variant/50 focus-within:ring-1 focus-within:ring-primary">
            <span className="material-symbols-outlined absolute left-3 top-1.5 text-secondary text-lg">search</span>
            <input 
              className="w-full bg-transparent border-none pl-10 pr-4 py-1.5 text-xs text-on-surface focus:ring-0 outline-none placeholder:text-outline transition-all" 
              placeholder="Search shipments..." 
              type="text"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden pt-20">
        {/* Left Panel: Lists (380px) */}
        <div className="w-[380px] bg-surface-container-low border-r border-outline-variant/30 flex flex-col h-full overflow-hidden shrink-0 z-[30] relative shadow-2xl">
           <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary">Fleet Status</h3>
                  <span className="text-[10px] text-outline">{shipments.length} Tracking</span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 divide-y divide-outline-variant/20">
                  {shipments.map((shipment) => {
                    const rInfo = getRiskInfo(shipment.riskScore);
                    const isSelected = selectedShipment === shipment.id;
                    return (
                      <div 
                        key={shipment.id}
                        onClick={() => setSelectedShipment(shipment.id)}
                        className={`p-3 flex items-center gap-4 cursor-pointer transition-colors ${isSelected ? 'bg-surface-container-high' : 'hover:bg-surface-container-highest'}`}
                      >
                         <div className={`w-8 h-8 rounded bg-surface-container flex items-center justify-center text-${rInfo.color}`}>
                           <span className="material-symbols-outlined text-lg">{shipment.mode}</span>
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-0.5">
                             <span className="text-[11px] font-bold text-on-surface truncate">{shipment.id}</span>
                             <span className={`text-[9px] px-1.5 py-0.5 bg-${rInfo.color}/20 text-${rInfo.color} rounded font-bold`}>{shipment.riskScore}% Risk</span>
                           </div>
                           <p className="text-[10px] text-on-surface-variant truncate">{shipment.origin} → {shipment.destination}</p>
                         </div>
                      </div>
                    )
                  })}
                </div>
              </section>
           </div>
        </div>

        {/* Leaflet Map Area */}
        <div className="flex-1 relative bg-surface-container-lowest z-[1]">
           <MultiMapComponent 
              shipments={shipments} 
              riskEvents={riskEvents} 
              selectedShipment={selectedShipment} 
              onSelectShipment={setSelectedShipment} 
           />

           {/* Floating Legend */}
            <div className="absolute top-6 right-6 bg-glass p-4 rounded-xl shadow-2xl z-[1000] w-52 pointer-events-none">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3">Map Legend</h3>
                <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-error ring-4 ring-error/20"></div>
                        <span className="text-[10px] font-medium text-on-surface">High Risk Threshold</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-tertiary ring-4 ring-tertiary/20"></div>
                        <span className="text-[10px] font-medium text-on-surface">Potential Disruption</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></div>
                        <span className="text-[10px] font-medium text-on-surface">Nominal Path</span>
                    </div>
                    <div className="h-px bg-outline-variant/30 my-2"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-[2px] bg-error border-dashed border-b"></div>
                        <span className="text-[10px] font-medium text-on-surface">Dashed - Reroute required</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
