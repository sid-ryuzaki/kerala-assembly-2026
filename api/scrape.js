export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const fetchRes = await fetch(url, {
      headers: {
        "User-Agent": "curl/8.7.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      }
    });

    if (!fetchRes.ok) {
      throw new Error(`Failed to fetch: ${fetchRes.status}`);
    }

    const html = await fetchRes.text();
    
    // Set CORS headers so the frontend can access it if needed (though on Vercel it's same-origin)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    
    res.status(200).send(html);
  } catch (error) {
    console.error('Error in Vercel function:', error);
    res.status(500).json({ error: 'Failed to fetch the URL' });
  }
}
