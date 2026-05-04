import React, { useState, useEffect } from 'react';
import OverallResults from './components/OverallResults';
import ConstituencyResults from './components/ConstituencyResults';
import AllianceTally from './components/AllianceTally';
import { fetchHtml, parsePartyResults } from './utils/fetchData';
import { Activity, Clock } from 'lucide-react';

const OVERALL_URL = 'https://results.eci.gov.in/ResultAcGenMay2026/partywiseresult-S11.htm';

function App() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [overallData, setOverallData] = useState([]);
  const [overallLoading, setOverallLoading] = useState(true);
  const [overallError, setOverallError] = useState(null);

  const loadOverallData = async () => {
    setOverallLoading(true);
    setOverallError(null);
    try {
      const html = await fetchHtml(OVERALL_URL);
      const parsedData = parsePartyResults(html);
      setOverallData(parsedData);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
      setOverallError('Failed to fetch overall results');
    } finally {
      setOverallLoading(false);
    }
  };

  useEffect(() => {
    loadOverallData();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadOverallData();
      // ConstituencyResults will handle its own refresh via key trick or we can trigger it
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

      <main className="layout-grid" style={{ paddingTop: '1.5rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <AllianceTally data={overallData} loading={overallLoading} />
        </div>
        <section>
          <OverallResults 
            data={overallData} 
            loading={overallLoading} 
            error={overallError} 
            onRefresh={loadOverallData} 
          />
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
