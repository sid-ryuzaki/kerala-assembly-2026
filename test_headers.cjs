const fetch = require('node-fetch');

async function testFetch() {
  try {
    const res = await fetch('https://results.eci.gov.in/ResultAcGenMay2026/partywiseresult-S11.htm', {
      headers: {
        "User-Agent": "curl/8.7.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      }
    });
    const text = await res.text();
    console.log(res.status);
    console.log(text.substring(0, 300));
  } catch (e) {
    console.error(e);
  }
}

testFetch();
