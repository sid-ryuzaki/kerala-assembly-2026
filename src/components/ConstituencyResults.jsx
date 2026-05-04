import React, { useEffect, useState } from 'react';
import { fetchHtml, parseConstituencyResults } from '../utils/fetchData';
import { RefreshCw, MapPin, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CONSTITUENCIES = [
  { name: 'Vattiyoorkavu', url: 'https://results.eci.gov.in/ResultAcGenMay2026/ConstituencywiseS11133.htm' },
  { name: 'Nemom', url: 'https://results.eci.gov.in/ResultAcGenMay2026/ConstituencywiseS11135.htm' },
  { name: 'Dharmadam', url: 'https://results.eci.gov.in/ResultAcGenMay2026/ConstituencywiseS1112.htm' },
  { name: 'Kazhakootam', url: 'https://results.eci.gov.in/ResultAcGenMay2026/ConstituencywiseS11132.htm' }
];

export default function ConstituencyResults() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchPromises = CONSTITUENCIES.map(async (constituency) => {
        try {
          const html = await fetchHtml(constituency.url);
          const data = parseConstituencyResults(html);
          return { name: constituency.name, data, error: null };
        } catch (err) {
          return { name: constituency.name, data: [], error: 'Failed to load' };
        }
      });
      
      const res = await Promise.all(fetchPromises);
      const resultsMap = {};
      res.forEach(item => {
        resultsMap[item.name] = item;
      });
      setResults(resultsMap);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch constituency results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2><MapPin size={24} className="text-accent" /> Key Constituencies</h2>
        <button className={`btn-refresh ${loading ? 'loading' : ''}`} onClick={loadData} disabled={loading}>
          <RefreshCw size={16} />
        </button>
      </div>

      {error ? (
        <div className="text-danger flex-center" style={{ height: '200px' }}>
          <p>{error}</p>
        </div>
      ) : loading && Object.keys(results).length === 0 ? (
        <div>
           {[...Array(3)].map((_, i) => (
             <div key={i} className="skeleton-row" style={{ height: '120px', marginBottom: '1.5rem' }}></div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {CONSTITUENCIES.map((constituency, idx) => {
            const constituencyData = results[constituency.name];
            
            return (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  {constituency.name}
                </h3>
                
                {constituencyData?.error ? (
                  <p className="text-danger">{constituencyData.error}</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Party</th>
                          <th>Votes</th>
                          <th>Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {constituencyData?.data?.map((candidate, cIdx) => (
                          <tr key={cIdx}>
                            <td><strong>{candidate.name}</strong></td>
                            <td className="text-secondary">{candidate.party}</td>
                            <td>{candidate.votes.toLocaleString()}</td>
                            <td>
                              <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                                {candidate.status === 'Leading' ? (
                                  <span className="text-success" style={{ display: 'flex', alignItems: 'center' }}>
                                    <ArrowUpRight size={16} /> +{candidate.margin.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-danger" style={{ display: 'flex', alignItems: 'center' }}>
                                    <ArrowDownRight size={16} /> -{candidate.margin.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!constituencyData?.data || constituencyData.data.length === 0) && (
                          <tr>
                            <td colSpan="4" className="text-center text-secondary">No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
