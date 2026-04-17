import React from 'react';

const AlertsPage = ({ alerts, resolveAlert }) => {
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-auto fade-in">
      <header className="w-full flex justify-center px-8 h-24 mb-4 shrink-0 flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Active Alerts</h2>
            <p className="text-sm text-secondary">
              {unresolvedAlerts.length} unresolved notifications · Global Fleet
            </p>
          </div>
          <div className="flex items-center gap-4 text-secondary">
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">filter_list</span></button>
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">settings</span></button>
          </div>
        </div>
      </header>

      <div className="px-8 pb-12 w-full max-w-5xl">
        {/* Unresolved Alerts Box */}
        <section className="mb-10">
          <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            Action Required ({unresolvedAlerts.length})
          </h3>
          <div className="space-y-4">
            {unresolvedAlerts.length > 0 ? unresolvedAlerts.map(alert => (
              <div key={alert.id} className="bg-glass border border-outline-variant/20 rounded-xl p-5 flex items-start justify-between group hover:border-primary/30 transition-colors shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${alert.score >= 70 ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'}`}>
                    <span className="material-symbols-outlined">{alert.score >= 70 ? 'error' : 'warning'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-on-surface">{alert.title}</h4>
                      <span className="text-[10px] text-on-surface-variant font-mono">{alert.timestamp}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-3">{alert.message}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded uppercase font-mono tracking-widest">{alert.shipmentId}</span>
                      {alert.score >= 70 && <span className="text-[10px] font-bold text-error">CRITICAL</span>}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => resolveAlert(alert.id)}
                  className="px-4 py-2 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-secondary font-bold font-['Inter'] text-xs rounded-lg transition-colors border border-outline-variant/30 hover:border-transparent flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Mark Resolved
                </button>
              </div>
            )) : (
               <div className="p-8 text-center bg-surface-container-low rounded-xl border border-outline-variant/10 text-on-surface-variant text-sm">
                 <span className="material-symbols-outlined text-4xl text-primary/40 mb-2 block">task_alt</span>
                 All caught up! No active alerts.
               </div>
            )}
          </div>
        </section>

        {/* Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/40"></span>
              Recently Resolved
            </h3>
            <div className="space-y-4 opacity-50 hover:opacity-100 transition-opacity">
              {resolvedAlerts.map(alert => (
                <div key={alert.id} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface line-through decoration-on-surface/30">{alert.title}</h4>
                    <p className="text-sm text-on-surface-variant">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
