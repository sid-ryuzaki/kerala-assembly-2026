import React, { useState, useEffect } from 'react';
import OverallResults from './components/OverallResults';
import ConstituencyResults from './components/ConstituencyResults';
import { Activity, Clock } from 'lucide-react';

function App() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // The individual components handle their own data fetching, 
      // but we can update the global refresh time here.
      // To force a re-render/re-fetch of children, we could use a key or state trigger.
      setLastRefreshed(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="header flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-dot animate-pulse"></div>
          <h1>Kerala Election Tracker</h1>
        </div>
        <div className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          <Clock size={16} />
          <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
        </div>
      </header>

      <main className="layout-grid">
        <section>
          <OverallResults key={lastRefreshed.getTime()} />
        </section>
        <section>
          <ConstituencyResults key={lastRefreshed.getTime() + 1} />
        </section>
      </main>
      
      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <p>Data sourced from Election Commission of India. Updated automatically.</p>
      </footer>
    </>
  );
}

export default App;
