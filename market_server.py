"""Resilient market-data proxy for the Adrita Bima Kendra dashboard.

Run locally:  set TWELVE_DATA_API_KEY=your_key
              python market_server.py

For production, deploy this Python service (Render/Railway/PythonAnywhere, etc.)
behind HTTPS and set MARKET_API_BASE in market.html to that HTTPS address.
"""

from __future__ import annotations

import json
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, urlencode, urlparse
from urllib.request import Request, urlopen

PORT = int(os.getenv("MARKET_API_PORT", "8000"))
CACHE_SECONDS = max(15, int(os.getenv("MARKET_CACHE_SECONDS", "30")))
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "").strip()

SYMBOLS = {
    "nifty": {"yahoo": "^NSEI", "twelve": "NIFTY 50:NSE"},
    "sensex": {"yahoo": "^BSESN", "twelve": "SENSEX:BSE"},
    "banknifty": {"yahoo": "^NSEBANK", "twelve": "NIFTY BANK:NSE"},
    "smallcap100": {"yahoo": "^NSMIDCP", "twelve": "NIFTY SMALLCAP 100:NSE"},
    "india_vix": {"yahoo": "^INDIAVIX", "twelve": "INDIA VIX:NSE"},
    "lici": {"yahoo": "LICI.NS", "twelve": "LICI:NSE", "public": "LICI"},
}

_cache: dict[str, tuple[float, dict[str, Any]]] = {}


class ProviderError(RuntimeError):
    pass


def get_json(url: str, *, headers: dict[str, str] | None = None) -> dict[str, Any]:
    request = Request(url, headers={"User-Agent": "AdritaBimaKendraMarket/1.0", **(headers or {})})
    try:
        with urlopen(request, timeout=8) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, ValueError) as error:
        raise ProviderError(str(error)) from error


def normalise_quote(*, symbol: str, price: Any, previous_close: Any, timestamp: Any, source: str) -> dict[str, Any]:
    try:
        current = float(price)
    except (TypeError, ValueError) as error:
        raise ProviderError(f"{source} did not return a price") from error
    try:
        previous = float(previous_close)
    except (TypeError, ValueError):
        previous = current
    change = current - previous
    percent = (change / previous * 100) if previous else 0.0
    return {
        "symbol": symbol,
        "price": round(current, 4),
        "previous_close": round(previous, 4),
        "change": round(change, 4),
        "percent": round(percent, 4),
        "provider": source,
        "provider_timestamp": timestamp,
        "fetched_at": int(time.time()),
    }


def quote_twelve_data(key: str, config: dict[str, str]) -> dict[str, Any]:
    if not TWELVE_DATA_API_KEY:
        raise ProviderError("Twelve Data key is not configured")
    params = urlencode({"symbol": config["twelve"], "apikey": TWELVE_DATA_API_KEY})
    data = get_json(f"https://api.twelvedata.com/quote?{params}")
    if data.get("status") == "error" or data.get("code"):
        raise ProviderError(data.get("message", "Twelve Data rejected the request"))
    return normalise_quote(
        symbol=key,
        price=data.get("close") or data.get("price"),
        previous_close=data.get("previous_close"),
        timestamp=data.get("timestamp") or data.get("datetime"),
        source="twelve_data",
    )


def quote_yahoo(key: str, config: dict[str, str]) -> dict[str, Any]:
    ticker = quote(config["yahoo"], safe="")
    data = get_json(f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1m&range=1d")
    result = (data.get("chart", {}).get("result") or [None])[0]
    if not result:
        raise ProviderError((data.get("chart", {}).get("error") or {}).get("description", "Yahoo returned no quote"))
    meta = result.get("meta", {})
    return normalise_quote(
        symbol=key,
        price=meta.get("regularMarketPrice"),
        previous_close=meta.get("chartPreviousClose") or meta.get("previousClose"),
        timestamp=meta.get("regularMarketTime"),
        source="yahoo_finance",
    )


def quote_public_indian_api(key: str, config: dict[str, str]) -> dict[str, Any]:
    public_symbol = config.get("public")
    if not public_symbol:
        raise ProviderError("No public-API symbol mapping for this instrument")
    params = urlencode({"symbol": public_symbol, "res": "num"})
    data = get_json(f"http://65.0.104.9/stock?{params}")
    quote_data = data.get("data") or {}
    if data.get("status") != "success":
        raise ProviderError(data.get("message", "Public Indian API returned an error"))
    return normalise_quote(
        symbol=key,
        price=quote_data.get("last_price"),
        previous_close=quote_data.get("previous_close"),
        timestamp=quote_data.get("timestamp"),
        source="public_indian_market_api",
    )


def fetch_quote(key: str) -> dict[str, Any]:
    if key not in SYMBOLS:
        raise ProviderError("Unsupported symbol")
    cached = _cache.get(key)
    if cached and time.time() - cached[0] < CACHE_SECONDS:
        return {**cached[1], "cached": True}

    config = SYMBOLS[key]
    errors: list[str] = []
    for provider in (quote_twelve_data, quote_yahoo, quote_public_indian_api):
        try:
            result = provider(key, config)
            result["cached"] = False
            _cache[key] = (time.time(), result)
            return result
        except ProviderError as error:
            errors.append(f"{provider.__name__}: {error}")
    raise ProviderError("All providers failed. " + " | ".join(errors))


class MarketHandler(BaseHTTPRequestHandler):
    server_version = "AdritaMarketProxy/1.0"

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self.respond({"status": "ok", "cache_seconds": CACHE_SECONDS, "twelve_data_configured": bool(TWELVE_DATA_API_KEY)})
            return
        if parsed.path != "/api/market":
            self.respond({"error": "Not found"}, 404)
            return

        query = parse_qs(parsed.query)
        requested = [item.strip() for item in query.get("symbols", [""])[0].split(",") if item.strip()]
        keys = requested or list(SYMBOLS)
        quotes: dict[str, Any] = {}
        errors: dict[str, str] = {}
        for key in keys:
            try:
                quotes[key] = fetch_quote(key)
            except ProviderError as error:
                errors[key] = str(error)
        self.respond({"quotes": quotes, "errors": errors, "generated_at": int(time.time()), "cache_seconds": CACHE_SECONDS}, 200 if quotes else 503)

    def respond(self, payload: dict[str, Any], status: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", os.getenv("MARKET_API_ALLOWED_ORIGIN", "*"))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, _format: str, *_args: Any) -> None:
        return


if __name__ == "__main__":
    print(f"Market proxy running at http://127.0.0.1:{PORT}")
    ThreadingHTTPServer(("0.0.0.0", PORT), MarketHandler).serve_forever()
