# Live market quote service

This website now includes `market_server.py`, a Python quote proxy with automatic fallbacks:

1. Twelve Data (primary; use an API key stored only in an environment variable)
2. Yahoo Finance chart endpoint
3. Public Indian Stock Market API (only for mapped shares, such as LICI)

The service caches successful results for 30 seconds by default. This is important because free providers impose rate limits. It returns the provider and timestamp with every quote, so the dashboard can show where the data came from.

## Run locally

In PowerShell, set your key for the current terminal session and start the service:

```powershell
$env:TWELVE_DATA_API_KEY = 'your-key'
python market_server.py
```

If `python` is not on PATH, use the installed Python executable or install Python 3.11+.

Open `http://127.0.0.1:8000/health` to check it. The quote endpoint is:

```
http://127.0.0.1:8000/api/market?symbols=nifty,sensex,banknifty,smallcap100,india_vix,lici
```

## Deploying the website

GitHub Pages can host the HTML, CSS, and JavaScript, but it cannot run Python. Deploy `market_server.py` separately to a Python host such as Render, Railway, or PythonAnywhere, using HTTPS.

Then set the deployed HTTPS URL before `market-live.js` loads in `market.html`:

```html
<script>window.MARKET_API_BASE = 'https://your-market-api.example';</script>
```

Set `MARKET_API_ALLOWED_ORIGIN` on the Python host to your website origin, for example `https://your-github-name.github.io`.

## Important data note

This design is resilient, but it cannot turn free data into an official exchange-grade real-time feed. Yahoo can throttle requests, and free-provider availability or delay can change. For trading or regulatory use, use a licensed NSE/BSE data vendor.
