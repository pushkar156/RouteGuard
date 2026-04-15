import React, { useState, useEffect } from 'react';

const Sidebar = ({ activeScreen, setActiveScreen }) => {
  const [lastScan, setLastScan] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastScan(prev => prev >= 60 ? 0 : prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard' },
    { name: 'Map', icon: 'map' },
    { name: 'Simulator', icon: 'precision_manufacturing' },
    { name: 'Alerts', icon: 'notifications_active' },
  ];

  return (
    <aside className="w-[240px] h-screen flex-col flex bg-surface fixed left-0 top-0 overflow-y-auto overflow-x-hidden z-50">
      <div className="p-8">
        <div className="text-xl font-black tracking-tighter text-primary">RouteGuard</div>
      </div>
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeScreen === item.name;
          return (
            <button 
              key={item.name}
              onClick={() => setActiveScreen(item.name)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200
                ${isActive ? 'text-primary border-l-4 border-primary bg-surface-container-low font-bold' : 'text-secondary hover:text-primary hover:bg-surface-container-high font-medium'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-['Inter'] text-sm tracking-tight">{item.name}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto p-4 border-t border-outline-variant/10">
        <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30 flex items-center gap-4">
          <div className="relative">
             <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></div>
             <div className="absolute inset-0 bg-primary/30 animate-ping rounded-full"></div>
          </div>
          <div className="flex-1">
             <div className="flex items-center justify-between mb-0.5">
               <span className="text-[10px] font-bold text-on-surface uppercase tracking-wide">Analytic Engine</span>
               <span className="text-[9px] text-primary font-bold">Running</span>
             </div>
             <div className="flex items-center justify-between">
               <p className="text-[9px] text-outline">Last Scan: {lastScan}s ago</p>
               <p className="text-[9px] text-outline">Latency: 42ms</p>
             </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
