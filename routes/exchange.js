const express = require('express');
const router = express.Router();
const https = require('https');
const { getUsdToIqd, refresh: refreshFallbackRate } = require('../usd-iqd-rate');

function extractRate(html) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const descriptionTag = metaTags.find((tag) => {
    const name = tag.match(/\bname=["']([^"']+)["']/i);
    return name && name[1].toLowerCase() === 'description';
  });
  const description = descriptionTag && descriptionTag.match(/\bcontent=["']([^"']*)["']/i);
  const pageText = `${description ? description[1] : ''} ${html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')}`
    .replace(/\s+/g, ' ');
  const match = pageText.match(
    /1\s*(?:US\s*Dollar|USD)\s*=\s*([\d,]+(?:\.\d+)?)\s*(?:Iraqi\s*Dinar|IQD)\b/i
  );

  if (!match) {
    throw new Error('Could not find the USD to IQD rate on AlanChand');
  }

  const ratePerDollar = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(ratePerDollar) || ratePerDollar < 500 || ratePerDollar > 10000) {
    throw new Error('AlanChand returned an invalid USD to IQD rate');
  }

  return ratePerDollar;
}

function fetchAlanChandRate() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'alanchand.com',
      port: 443,
      path: '/en/exchange-rates/usd-iqd',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`AlanChand request failed with status ${res.statusCode}`));
            return;
          }

          const ratePerDollar = extractRate(data);
          resolve({
            success: true,
            rate: ratePerDollar * 100,
            ratePerDollar,
            source: 'alanchand.com'
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('AlanChand request timed out'));
    });

    req.end();
  });
}

// Get Alan Chand live rate
router.get('/rate', async (req, res) => {
  try {
    const result = await fetchAlanChandRate();
    res.json(result);
  } catch (alanChandError) {
    console.error('AlanChand exchange rate fetch failed:', alanChandError.message);

    try {
      let fallback = getUsdToIqd();
      if (!fallback.rate) fallback = await refreshFallbackRate();
      if (!fallback.rate) throw new Error('No cached or live fallback rate is available');

      res.json({
        success: true,
        rate: fallback.rate * 100,
        ratePerDollar: fallback.rate,
        source: 'open.er-api.com',
        updatedAt: fallback.updatedAt
      });
    } catch (fallbackError) {
      console.error('USD/IQD fallback failed:', fallbackError.message);
      res.status(502).json({
        success: false,
        error: `AlanChand: ${alanChandError.message}; fallback: ${fallbackError.message}`
      });
    }
  }
});

module.exports = router;
