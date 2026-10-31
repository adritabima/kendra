(() => {
  const refreshMs = 30000;
  const keys = ['nifty', 'sensex', 'banknifty', 'smallcap100', 'india_vix', 'lici'];
  const apiBase = typeof window.MARKET_API_BASE !== 'undefined'
    ? window.MARKET_API_BASE
    : ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://127.0.0.1:8000' : '');

  const formatNumber = (value, maximumFractionDigits = 2) => Number(value ?? 0).toLocaleString('en-IN', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  });

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  }

  function applyTrendState(element, value, positiveClass = 'green', negativeClass = 'red') {
    if (!element) return;
    element.classList.remove('green', 'red');
    element.classList.add(value >= 0 ? positiveClass : negativeClass);
  }

  function renderFallbackSnapshot() {
    const statusValue = document.getElementById('market-status-value');
    const statusCaption = document.getElementById('market-status-caption');

    if (statusValue) {
      statusValue.textContent = 'OPEN';
      statusValue.classList.remove('red');
      statusValue.classList.add('green');
    }

    if (statusCaption) {
      statusCaption.textContent = '09:15 AM - 03:30 PM';
    }

    setText('[data-market-key="marketcap"]', '₹ 0');
    setText('[data-market-key="vix"]', '0');
    setText('[data-market-key="vix-change"]', '0.00 (0.00%)');
    setText('[data-market-key="breadth"]', '0 / 0');
    setText('[data-market-key="breadth-status"]', 'Positive Breadth');

    document.querySelectorAll('[data-market-key="vix-change"]').forEach((element) => {
      applyTrendState(element, 0);
    });
  }

  function renderQuotes(quotes) {
    const strip = document.getElementById('market-api-quotes');
    if (strip) {
      strip.innerHTML = Object.entries(quotes).map(([key, quote]) => {
        const direction = Number(quote.change) >= 0 ? 'up' : 'down';
        const sign = Number(quote.change) >= 0 ? '+' : '';
        return `<article class="api-quote-card ${direction}">
          <strong>${key.replaceAll('_', ' ').toUpperCase()}</strong>
          <span>₹${formatNumber(quote.price)}</span>
          <small>${sign}${formatNumber(quote.percent)}% · ${String(quote.provider || 'SOURCE').replaceAll('_', ' ')}</small>
        </article>`;
      }).join('');
    }

    const vix = quotes.india_vix;
    if (vix) {
      document.querySelectorAll('[data-market-key="vix"]').forEach((element) => {
        element.textContent = formatNumber(vix.price);
      });

      document.querySelectorAll('[data-market-key="vix-change"]').forEach((element) => {
        const changeText = `${vix.change >= 0 ? '+' : ''}${formatNumber(vix.change)} (${vix.percent >= 0 ? '+' : ''}${formatNumber(vix.percent)}%)`;
        element.textContent = changeText;
        applyTrendState(element, Number(vix.change || 0));
      });
    }

    const marketCapValue = quotes.nifty?.price || quotes.sensex?.price;
    if (marketCapValue) {
      const capText = `₹ ${formatNumber(marketCapValue * 1000000000, 0)}`;
      setText('[data-market-key="marketcap"]', capText);
    }

    const breadth = quotes.smallcap100 || quotes.nifty;
    if (breadth) {
      const direction = Number(breadth.change) >= 0 ? 'Positive Breadth' : 'Negative Breadth';
      setText('[data-market-key="breadth-status"]', direction);
      setText('[data-market-key="breadth"]', `${formatNumber(Math.abs(breadth.change), 0)} / ${formatNumber(Math.abs(breadth.percent), 0)}`);
      document.querySelectorAll('[data-market-key="breadth-status"]').forEach((element) => {
        applyTrendState(element, Number(breadth.change || 0));
      });
    }
  }

  async function refreshMarket() {
    const status = document.getElementById('market-api-status');

    if (!apiBase) {
      renderFallbackSnapshot();
      if (status) {
        status.textContent = 'Live Python market service is not configured for this website yet. TradingView widgets remain available.';
      }
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/market?symbols=${keys.join(',')}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !Object.keys(payload.quotes || {}).length) {
        throw new Error('No quote providers responded');
      }

      renderQuotes(payload.quotes);

      if (status) {
        const sources = [...new Set(Object.values(payload.quotes).map((quote) => String(quote.provider || 'source').replaceAll('_', ' ')))].join(', ');
        status.textContent = `Updated ${new Date((payload.generated_at || Date.now() / 1000) * 1000).toLocaleTimeString('en-IN')} · Source: ${sources}`;
      }
    } catch (error) {
      renderFallbackSnapshot();
      if (status) {
        status.textContent = 'Live quote service is temporarily unavailable. TradingView widgets may still show market data.';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderFallbackSnapshot();
    refreshMarket();
    window.setInterval(refreshMarket, refreshMs);
  });
})();
