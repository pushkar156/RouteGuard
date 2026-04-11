import React from 'react';

const Header = () => {
  return (
    <header className="flex flex-col justify-center px-8 w-full h-24 bg-transparent mb-8">
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Shipment Dashboard</h1>
          <p className="text-sm text-secondary">10 active shipments · 3 high risk</p>
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
  );
};

export default Header;
