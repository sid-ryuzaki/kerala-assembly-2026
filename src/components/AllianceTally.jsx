import React, { useMemo } from 'react';
import { Users } from 'lucide-react';

const ALLIANCES = {
  LDF: ['Communist Party of India (Marxist)', 'Communist Party of India', 'Kerala Congress (M)', 'Janata Dal (Secular)', 'Nationalist Congress Party', 'Indian National League', 'Democratic Kerala Congress', 'Congress (Secular)', 'National Secular Conference'],
  UDF: ['Indian National Congress', 'Indian Union Muslim League', 'Kerala Congress', 'Revolutionary Socialist Party', 'Nationalist Congress Kerala'],
  NDA: ['Bharatiya Janata Party', 'Bharath Dharma Jana Sena', 'All India Anna Dravida Munnetra Kazhagam']
};

const getAlliance = (partyName) => {
  const normalized = partyName.toLowerCase();
  for (const [alliance, parties] of Object.entries(ALLIANCES)) {
    if (parties.some(p => normalized.includes(p.toLowerCase()))) {
      return alliance;
    }
  }
  return 'OTHERS';
};

export default function AllianceTally({ data, loading }) {
  const tally = useMemo(() => {
    const sums = { LDF: 0, UDF: 0, NDA: 0, OTHERS: 0 };
    if (!data) return sums;
    
    data.forEach(party => {
      const alliance = getAlliance(party.party);
      sums[alliance] += party.total;
    });
    return sums;
  }, [data]);

  const maxTotal = Math.max(tally.LDF, tally.UDF, tally.NDA, 1);

  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ margin: 0 }}><Users size={24} className="text-accent" /> Total Alliance Tally</h2>
      
      {loading ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton-row" style={{ flex: 1, height: '80px' }}></div>)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {['LDF', 'UDF', 'NDA'].map((alliance) => {
             let colorVar = 'var(--accent-color)';
             if (alliance === 'LDF') colorVar = 'var(--danger-color)';
             if (alliance === 'UDF') colorVar = '#3b82f6';
             if (alliance === 'NDA') colorVar = 'var(--warning-color)';
             
             return (
              <div key={alliance} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', borderTop: `4px solid ${colorVar}` }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{alliance}</h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>{tally[alliance]}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
