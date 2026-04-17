import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, activeScreen, setActiveScreen, isProcessing }) => {
  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      <main className="flex-1 ml-[240px] flex flex-col min-h-screen relative">
        {children}
        
        {/* 🔥 AI INGESTION OVERLAY (Glassmorphism) */}
        {isProcessing && (
          <div className="absolute inset-0 z-[100] backdrop-blur-md bg-surface/40 flex items-center justify-center fade-in">
             <div className="bg-surface-container-high/90 p-10 rounded-3xl border border-outline-variant/30 shadow-2xl flex flex-col items-center gap-6 max-w-md text-center mx-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary animate-pulse">auto_awesome</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-2 text-on-surface">Intelligence Ingestion</h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Gemini 2.5 is currently analyzing global news signals and recalculating fleet risk vectors...
                  </p>
                </div>
                <div className="flex gap-2 w-full mt-4">
                   <div className="h-1 flex-1 bg-primary rounded-full animate-pulse"></div>
                   <div className="h-1 flex-1 bg-primary/40 rounded-full animate-pulse [animation-delay:200ms]"></div>
                   <div className="h-1 flex-1 bg-primary/20 rounded-full animate-pulse [animation-delay:400ms]"></div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
