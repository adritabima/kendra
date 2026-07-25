import json
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from time import time
from urllib.parse import quote, urlparse


SITE_ROOT = Path(__file__).resolve().parent
TWELVE_DATA_API_KEY = os.getenv('TWELVE_DATA_API_KEY', 'fa3735bf9bc943bd96395fb5a73536b1')
TWELVE_DATA_URL = 'https://api.twelvedata.com/quote'
YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'
# Five Twelve Data calls per refresh stay safely under a typical free-key limit.
CACHE_TTL_SECONDS = 75
market_cache = {}
market_cache_time = 0
cache_lock = Lock()

# Twelve Data does not offer native Indian index quotes on this account. Those
# four exact indices use the Yahoo index feed; all other values use Twelve Data.
DATA_SOURCES = {
    'sensex': ('yahoo', '^BSESN', '^BSESN'),
    'nifty': ('yahoo', '^NSEI', '^NSEI'),
    'smallcap100': ('yahoo', '^CNXSC', '^CNXSC'),
    'banknifty': ('yahoo', '^NSEBANK', '^NSEBANK'),
    'gold': ('twelve', 'XAU/USD', 'GC=F'),
    'silver': ('twelve', 'XAG/USD', 'SI=F'),
    'crudeoil': ('twelve', 'USO', 'CL=F'),
    'naturalgas': ('twelve', 'UNG', 'NG=F'),
    'liciindex': ('twelve', 'LICI', 'LICI.NS'),
    'flexiGrowth': ('twelve', 'LICI', 'LICI.NS'),
    'flexiSmartGrowth': ('twelve', 'LICI', 'LICI.NS'),
    'nivesPlus': ('twelve', 'LICI', 'LICI.NS'),
    'siip': ('twelve', 'LICI', 'LICI.NS'),
}


def as_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def fetch_twelve_quote(symbol):
    request = urllib.request.Request(
        f'{TWELVE_DATA_URL}?symbol={quote(symbol, safe="/")}',
        headers={'Authorization': f'apikey {TWELVE_DATA_API_KEY}', 'User-Agent': 'AdritaBimaKendra/1.0'},
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))

    if data.get('status') == 'error':
        return None

    price = as_float(data.get('close') or data.get('price'))
    previous_close = as_float(data.get('previous_close'))
    change = as_float(data.get('change'))
    percent = as_float(data.get('percent_change'))
    if price is None:
        return None
    if change is None:
        change = price - previous_close if previous_close is not None else 0
    if percent is None:
        percent = (change / previous_close) * 100 if previous_close else 0
    return {'price': price, 'change': change, 'percent': percent}


def fetch_yahoo_quote(symbol):
    request = urllib.request.Request(
        f'{YAHOO_CHART_URL}/{quote(symbol, safe="")}?interval=1m&range=1d',
        headers={'User-Agent': 'Mozilla/5.0'},
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))

    result = data.get('chart', {}).get('result', [None])[0]
    if not result:
        return None
    meta = result.get('meta', {})
    closes = result.get('indicators', {}).get('quote', [{}])[0].get('close', [])
    price = next((value for value in reversed(closes) if value is not None), None)
    price = as_float(price or meta.get('regularMarketPrice') or meta.get('chartPreviousClose'))
    previous_close = as_float(meta.get('chartPreviousClose'))
    if price is None:
        return None
    change = price - previous_close if previous_close is not None else 0
    percent = (change / previous_close) * 100 if previous_close else 0
    return {'price': price, 'change': change, 'percent': percent}


def fetch_source(source):
    provider, symbol, fallback_symbol = source
    try:
        if provider == 'twelve':
            try:
                result = fetch_twelve_quote(symbol)
            except (OSError, ValueError, KeyError, json.JSONDecodeError):
                result = None
            # Gracefully preserve dashboard updates if a plan does not include
            # an instrument or the account is temporarily rate-limited.
            return result or fetch_yahoo_quote(fallback_symbol)
        return fetch_yahoo_quote(symbol)
    except (OSError, ValueError, KeyError, json.JSONDecodeError):
        return None


def fetch_market_data():
    global market_cache, market_cache_time
    now = time()
    with cache_lock:
        if market_cache and now - market_cache_time < CACHE_TTL_SECONDS:
            return market_cache

    unique_sources = set(DATA_SOURCES.values())
    fetched = {}
    with ThreadPoolExecutor(max_workers=len(unique_sources)) as executor:
        futures = {executor.submit(fetch_source, source): source for source in unique_sources}
        for future in as_completed(futures):
            fetched[futures[future]] = future.result()

    quotes = {key: fetched.get(source) or {} for key, source in DATA_SOURCES.items()}
    with cache_lock:
        market_cache = quotes
        market_cache_time = now
    return quotes


class MarketHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_ROOT), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != '/api/market':
            if parsed.path == '/':
                self.path = '/index.html'
            return super().do_GET()

        payload = fetch_market_data()
        body = json.dumps(payload).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    server = ThreadingHTTPServer(('0.0.0.0', 5000), MarketHandler)
    print('Market site is running at http://localhost:5000/market.html')
    server.serve_forever()
