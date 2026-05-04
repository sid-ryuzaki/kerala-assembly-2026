const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const port = 3001;

app.use(cors());

let browser;

async function initBrowser() {
  browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

initBrowser();

app.get('/scrape', async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const page = await browser.newPage();
    
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Some basic check or wait if Cloudflare is there, might need longer wait or specific selector
    try {
        await page.waitForSelector('table', { timeout: 10000 });
    } catch (e) {
        console.log("No table found within 10s, returning current HTML anyway.");
    }
    
    const html = await page.content();
    await page.close();
    
    res.send(html);
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ error: 'Failed to scrape the URL' });
  }
});

app.listen(port, () => {
  console.log(`Scraper proxy running at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
    if (browser) await browser.close();
    process.exit();
});
