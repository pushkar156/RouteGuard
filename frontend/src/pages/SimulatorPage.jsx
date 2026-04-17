import React, { useState } from 'react';
import MapComponent from '../components/MapComponent';

// Helper to get coordinates for the map
const TARGET_COORDS = {
  'Rotterdam': [51.9, 4.1],
  'Shanghai': [31.2, 121.5],
  'Singapore': [1.3, 103.8],
  'Los Angeles': [33.7, -118.2],
  'Suez Canal': [29.9, 32.5],
};

const SimulatorPage = ({ shipments, simulationActive, triggerSimulation, resetSimulation }) => {
  const [targetLocation, setTargetLocation] = useState('Rotterdam');
  const [severity, setSeverity] = useState(40);
  const [disruptionType, setDisruptionType] = useState('Labor Strike');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrigger = async () => {
    setIsLoading(true);
    // Add a slight artificial delay for psychological UX (shows the 'work' being done)
    await new Promise(r => setTimeout(r, 800)); 
    await triggerSimulation(targetLocation, parseInt(severity, 10), disruptionType);
    setIsLoading(false);
  };

  const getDeltaBadge = (base, current) => {
    const diff = current - base;
    if (diff > 0) {
      const percentage = Math.round((diff / base) * 100);
      let colorClass = 'bg-error-container text-on-error-container';
      if (current < 70 && current >= 40) colorClass = 'bg-tertiary-container/30 text-tertiary';
      return <span className={`px-2.5 py-1 rounded-md text-[11px] font-black ${colorClass}`}>+{percentage}%</span>;
    }
    return <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface-variant rounded-md text-[11px] font-black">0%</span>;
  };

  const impactedList = shipments.filter(s => s.riskScore !== s.baseRiskScore);
  const totalImpact = impactedList.reduce((acc, curr) => acc + (curr.riskScore - curr.baseRiskScore), 0);
  const meanIncrease = impactedList.length > 0 ? (totalImpact / impactedList.length).toFixed(1) : '0.0';

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-auto fade-in">
      <header className="w-full flex justify-center px-8 h-24 mb-4 shrink-0 flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">What-If Simulator</h2>
            <p className="text-sm text-secondary">Trigger a hypothetical disruption and watch network scores cascade</p>
          </div>
        </div>
      </header>

      <div className="px-8 pb-12 flex gap-8">
        {/* Left Panel */}
        <section className="w-[40%] space-y-6">
          <div className="bg-glass rounded-xl shadow-sm overflow-hidden">
             {/* Target Visualization Map */}
             <div className="h-64 bg-surface-container-highest relative group">
                <MapComponent 
                  center={TARGET_COORDS[targetLocation]} 
                  routes={[
                    { 
                      position: TARGET_COORDS[targetLocation], 
                      name: targetLocation, 
                      severity: 'CRITICAL',
                      isPulse: true 
                    }
                  ]} 
                />
                <div className="absolute top-4 left-4 z-[1000] bg-error text-on-error px-3 py-1 rounded-full text-[10px] font-black tracking-widest animate-pulse flex items-center gap-1">
                   <span className="material-symbols-outlined text-xs">gps_fixed</span>
                   TARGET ACQUIRED
                </div>
             </div>

             <div className="p-8">
               <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant">Simulation Parameters</h3>
              {simulationActive && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  SIMULATION ACTIVE
                </span>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Target Node</label>
                <select 
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-on-surface text-sm p-4 appearance-none focus:ring-2 focus:ring-primary outline-none"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                >
                  <option value="Rotterdam">Rotterdam</option>
                  <option value="Shanghai">Shanghai</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Los Angeles">Los Angeles</option>
                  <option value="Suez Canal">Suez Canal</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Disruption Type</label>
                <select
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-on-surface text-sm p-4 appearance-none focus:ring-2 focus:ring-primary outline-none"
                  value={disruptionType}
                  onChange={(e) => setDisruptionType(e.target.value)}
                >
                  <option>Labor Strike</option>
                  <option>Extreme Weather</option>
                  <option>Cybersecurity Breach</option>
                  <option>Piracy</option>
                </select>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Severity Injection Points</label>
                  <span className="text-2xl font-bold text-primary">+{severity}</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="90" step="10"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" 
                />
              </div>

              <div className="pt-6 space-y-4">
                <button 
                  onClick={handleTrigger}
                  disabled={isLoading}
                  className="w-full py-4 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm tracking-tight shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent"></span> Running Simulation...</>
                  ) : 'Trigger Disruption'}
                </button>
                <button 
                  onClick={resetSimulation}
                  className="w-full py-4 rounded-lg text-secondary text-sm font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Reset Network
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Right Panel */}
        <section className="w-[60%] space-y-6">
          <div className="bg-surface-container-low rounded-xl p-1 border border-outline-variant/10">
            <div className="p-6 pb-2">
               <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-4">Simulated Shipment Impact</h3>
            </div>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-surface-container-low/60 backdrop-blur-[2px] flex items-center justify-center fade-in">
                   <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant/30 shadow-lg text-xs font-bold text-primary">
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      AI Recalculating Fleet Risk...
                   </div>
                </div>
              )}
              <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                  <th className="px-6 py-4 font-bold">Shipment ID</th>
                  <th className="px-6 py-4 font-bold">Route</th>
                  <th className="px-6 py-4 font-bold text-center">Baseline</th>
                  <th className="px-6 py-4 font-bold text-center">Simulated</th>
                  <th className="px-6 py-4 font-bold text-right">Delta</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-outline-variant/5">
                {shipments.map(s => {
                   const isImpacted = s.riskScore !== s.baseRiskScore;
                   return (
                     <tr key={s.id} className="hover:bg-surface-container-high transition-colors group">
                       <td className="px-6 py-5">
                         <div className="flex flex-col">
                           <span className="font-bold text-on-surface">{s.id}</span>
                         </div>
                       </td>
                       <td className="px-6 py-5 text-on-surface-variant text-xs">{s.origin} → {s.destination}</td>
                       <td className="px-6 py-5 text-center font-medium">{s.baseRiskScore}</td>
                       <td className={`px-6 py-5 text-center font-bold ${isImpacted ? 'text-error' : 'text-on-surface'}`}>{s.riskScore}</td>
                       <td className="px-6 py-5 text-right">
                         {getDeltaBadge(s.baseRiskScore, s.riskScore)}
                       </td>
                     </tr>
                   )
                })}
              </tbody>
            </table>
          </div>
         </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="bg-glass p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Mean Score Increase</p>
                  <p className="text-4xl font-black text-error tabular-nums">+{meanIncrease}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">trending_up</span>
                </div>
             </div>
             <div className="bg-glass p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Impacted Shipments</p>
                  <p className="text-4xl font-black text-tertiary tabular-nums">{impactedList.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">inventory_2</span>
                </div>
             </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default SimulatorPage;
