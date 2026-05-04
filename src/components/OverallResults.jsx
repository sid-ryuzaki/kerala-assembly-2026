import React, { useEffect, useState } from 'react';
import { fetchHtml, parsePartyResults } from '../utils/fetchData';
import { RefreshCw, TrendingUp } from 'lucide-react';

const OVERALL_URL = 'https://results.eci.gov.in/ResultAcGenMay2026/partywiseresult-S11.htm';

export default function OverallResults({ data, loading, error, onRefresh }) {
  const maxTotal = data.length > 0 ? Math.max(...data.map(d => d.total)) : 100;
  // We only show top 5 here as requested
  const displayData = data.slice(0, 5);

  return (
    <div className="glass-panel">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2><TrendingUp size={24} className="text-accent" /> Kerala Overall Assembly Status</h2>
        <button className={`btn-refresh ${loading ? 'loading' : ''}`} onClick={onRefresh} disabled={loading}>
          <RefreshCw size={16} />
        </button>
      </div>

      {error ? (
        <div className="text-danger flex-center" style={{ height: '200px' }}>
          <p>{error}</p>
        </div>
      ) : loading && displayData.length === 0 ? (
        <div>
          {[...Array(5)].map((_, i) => (
             <div key={i} className="skeleton-row"></div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Party</th>
                <th>Won</th>
                <th>Leading</th>
                <th>Total (Lead + Won)</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((party, index) => (
                <tr key={index}>
                  <td>
                    <strong>{party.party}</strong>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${(party.total / maxTotal) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="text-success">{party.won}</td>
                  <td className="text-warning">{party.leading}</td>
                  <td><strong>{party.total}</strong></td>
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="text-center text-secondary">No data available yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
