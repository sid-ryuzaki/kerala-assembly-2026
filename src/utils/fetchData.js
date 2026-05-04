import axios from 'axios';

// We use ScraperAPI in production to bypass WAF, and fallback to corsproxy for local if no key is present.
const getProxyUrl = (targetUrl) => {
  const apiKey = import.meta.env.VITE_SCRAPER_API_KEY;
  if (apiKey && apiKey !== 'your_api_key_here') {
    return `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render=true`;
  }
  return `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
};

export const fetchHtml = async (url) => {
  try {
    const response = await axios.get(getProxyUrl(url), {
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const parsePartyResults = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  // Find the table. Often tables have standard class names like 'table'
  // Or we can just grab all rows and filter
  const tables = doc.querySelectorAll('table');
  let dataRows = [];
  
  // Iterate tables to find the right one (party results usually has "Party" header)
  for (const table of tables) {
    if (table.textContent.includes('Party') && table.textContent.includes('Won') && table.textContent.includes('Leading')) {
      const rows = table.querySelectorAll('tbody tr');
      dataRows = Array.from(rows);
      break;
    }
  }
  
  // If we couldn't find it precisely, try a more generic approach or fallback
  if (dataRows.length === 0) {
     // Let's assume the main data table is the largest one or has specific tr class
     const allRows = Array.from(doc.querySelectorAll('tr'));
     // Filter rows that have exactly 4 columns: Party, Won, Leading, Total
     dataRows = allRows.filter(row => row.children.length >= 4);
  }

  const results = [];
  
  for (const row of dataRows) {
    const cols = row.querySelectorAll('td');
    // Usually columns: Party (0), Won (1), Leading (2), Total (3)
    if (cols.length >= 4) {
      const party = cols[0].textContent.trim();
      if (!party || party.toLowerCase().includes('total')) continue;
      
      const won = parseInt(cols[1].textContent.trim(), 10) || 0;
      const leading = parseInt(cols[2].textContent.trim(), 10) || 0;
      
      results.push({
        party,
        won,
        leading,
        total: won + leading
      });
    }
  }
  
  // Sort by total descending and take top 5
  results.sort((a, b) => b.total - a.total);
  return results.slice(0, 5);
};

export const parseConstituencyResults = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  // ECI tables for constituency usually list candidates with columns:
  // Candidate (0), Party (1), EVM Votes (2), Postal Votes (3), Total (4), % (5)
  // Or similar structure. We need Candidate, Party, Margin.
  
  const tables = doc.querySelectorAll('table');
  let dataRows = [];
  
  for (const table of tables) {
     if (table.textContent.includes('Candidate') && table.textContent.includes('Party')) {
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length > 0) {
           dataRows = Array.from(rows);
           break;
        }
     }
  }

  if (dataRows.length === 0) {
     const allRows = Array.from(doc.querySelectorAll('tr'));
     dataRows = allRows.filter(row => row.children.length >= 6);
  }

  const candidates = [];
  
  for (const row of dataRows) {
    const cols = row.querySelectorAll('td');
    // S.N.(0), Candidate(1), Party(2), EVM(3), Postal(4), Total(5), %(6)
    if (cols.length >= 7) {
      const name = cols[1].textContent.trim();
      const party = cols[2].textContent.trim();
      const votesText = cols[5].textContent.trim();
      
      // Remove commas from votes
      const votes = parseInt(votesText.replace(/,/g, ''), 10) || 0;
      
      if (name && name.toLowerCase() !== 'total' && name.toLowerCase() !== 'candidate') {
         candidates.push({ name, party, votes });
      }
    }
  }
  
  // Sort by votes descending
  candidates.sort((a, b) => b.votes - a.votes);
  const topCandidates = candidates.slice(0, 3);
  
  // Calculate lead/loss relative to the winner or runner up
  if (topCandidates.length > 0) {
     const maxVotes = topCandidates[0].votes;
     topCandidates.forEach((c, index) => {
        if (index === 0) {
           // Lead over second
           const runnerUpVotes = topCandidates.length > 1 ? topCandidates[1].votes : 0;
           c.margin = c.votes - runnerUpVotes;
           c.status = 'Leading';
        } else {
           // Loss from first
           c.margin = maxVotes - c.votes;
           c.status = 'Trailing';
        }
     });
  }
  
  return topCandidates;
};
