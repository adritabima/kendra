document.addEventListener('DOMContentLoaded', initMarketData);

const MARKET_ITEMS = [
  { key: 'sensex', label: 'SENSEX', symbol: '^BSESN' },
  { key: 'nifty', label: 'NIFTY 50', symbol: '^NSEI' },
  { key: 'gold', label: 'GOLD', symbol: 'GC=F' },
  { key: 'silver', label: 'SILVER', symbol: 'SI=F' },
  { key: 'crudeoil', label: 'CRUDE OIL', symbol: 'CL=F' },
  { key: 'naturalgas', label: 'NATURAL GAS', symbol: 'NG=F' },
  { key: 'smallcap100', label: 'NIFTY SMALLCAP 100', symbol: '^NSMIDCP' },
  { key: 'banknifty', label: 'NIFTY BANK', symbol: '^NSEBANK' },
  { key: 'liciindex', label: 'LICI INDEX', symbol: 'LICI.NS' },
  { key: 'flexiGrowth', label: 'LICI INDEX PLUS FLEXI GROWTH NAV', symbol: 'LICI.NS' },
  { key: 'flexiSmartGrowth', label: 'LICI INDEX PLUS FLEXI SMART GROWTH NAV', symbol: 'LICI.NS' },
  { key: 'nivesPlus', label: 'LICI NIVES PLUS NAV', symbol: 'LICI.NS' },
  { key: 'siip', label: 'LICI SIIP NAV', symbol: 'LICI.NS' }
];

function initMarketData() {
  updateMarketStatus();
  updateMarketData();
  setInterval(updateMarketStatus, 60000);
  setInterval(updateMarketData, 60000);
}

async function updateMarketData() {
  let quotes;
  try {
    const response = await fetch(`/api/market?_=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Market API unavailable');
    quotes = await response.json();
  } catch (error) {
    return;
  }

  const items = MARKET_ITEMS.map((item) => ({ ...item, quote: quotes[item.key] }));

  items.forEach((item) => {
    const elements = document.querySelectorAll(`[data-market-key="${item.key}"]`);
    if (!elements.length) return;

    const price = item.quote?.price;
    const change = item.quote?.change ?? 0;
    const percent = item.quote?.percent ?? 0;

    const formattedPrice = price != null ? formatPrice(price) : '--';

    elements.forEach((element) => {
      if (price != null) {
        element.innerHTML = `${formattedPrice} ${renderTrend(change, percent)}`;
      } else {
        element.innerHTML = '--';
      }
      element.setAttribute('data-trend', change >= 0 ? 'up' : 'down');
    });
  });
}

function updateMarketStatus() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hour = now.getHours();
  const minute = now.getMinutes();
  const isOpen = (hour > 9 || (hour === 9 && minute >= 15)) && (hour < 15 || (hour === 15 && minute <= 30));

  const statusValue = document.getElementById('market-status-value');
  const statusCaption = document.getElementById('market-status-caption');

  if (statusValue) {
    statusValue.textContent = isOpen ? 'OPEN' : 'CLOSED';
    statusValue.className = isOpen ? 'green' : 'red';
  }

  if (statusCaption) {
    statusCaption.textContent = isOpen ? '09:15 AM - 03:30 PM' : 'Market closed for the day';
  }
}

function formatPrice(value) {
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function formatNumber(value, digits = 2) {
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: digits });
}

function renderTrend(change, percent) {
  const isUp = change >= 0;
  const arrow = isUp ? '▲' : '▼';
  const colorClass = isUp ? 'green' : 'red';
  return `<span class="${colorClass}">${arrow} ${formatNumber(percent, 2)}%</span>`;
}
