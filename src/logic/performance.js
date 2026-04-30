import { safeNumber } from './format.js';
import { MATCH_CATEGORIES } from './matchCriteria.js';

// ─── Stats helper ─────────────────────────────────────────────────────────────
function calcStats(rows) {
  const settled  = rows.filter((r) => r.status === 'win' || r.status === 'loss');
  const wins     = rows.filter((r) => r.status === 'win');
  const losses   = rows.filter((r) => r.status === 'loss');
  const pending  = rows.filter((r) => r.status === 'pending');

  const profit   = wins.reduce((s, r) => s + (safeNumber(r.odds, 1) - 1), 0)
                 - losses.length;
  const roi      = settled.length > 0 ? (profit / settled.length) * 100 : 0;
  const winRate  = settled.length > 0 ? (wins.length / settled.length) * 100 : 0;
  const avgOdds  = settled.length > 0
    ? settled.reduce((s, r) => s + safeNumber(r.odds, 1), 0) / settled.length
    : 0;

  return {
    total:    rows.length,
    settled:  settled.length,
    wins:     wins.length,
    losses:   losses.length,
    pending:  pending.length,
    profit:   Math.round(profit * 100) / 100,
    roi:      Math.round(roi * 10) / 10,
    winRate:  Math.round(winRate * 10) / 10,
    avgOdds:  Math.round(avgOdds * 100) / 100,
  };
}

// ─── Category summary (for history summary cards) ────────────────────────────
export function buildCategorySummary(rows) {
  return MATCH_CATEGORIES.map((cat) => {
    const catRows = cat.key === 'all' ? rows : rows.filter((r) => r.categories?.includes(cat.key));
    return { key: cat.key, label: cat.label, stats: calcStats(catRows) };
  });
}

export function getRowsForCategory(rows, category) {
  if (!category || category === 'all') return rows;
  return rows.filter((r) => r.categories?.includes(category));
}

// ─── Period performance ───────────────────────────────────────────────────────
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoWeek(d) {
  const date  = new Date(d);
  const day   = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return `${date.getFullYear()}-W${String(Math.ceil(((date - yearStart) / 86400000 + 1) / 7)).padStart(2, '0')}`;
}

function isoMonth(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isoYear(d) {
  return String(new Date(d).getFullYear());
}

export function buildPeriodPerformance(rows, period) {
  const now = Date.now();

  if (period === 'last7') {
    // Group by day for last 7 days
    const groups = {};
    for (let i = 6; i >= 0; i--) {
      const d    = new Date(now - i * 86400000);
      const key  = startOfDay(d).toISOString().slice(0, 10);
      groups[key] = [];
    }
    for (const row of rows) {
      const d = new Date(row.eventDate || row.settledAt || 0);
      const key = startOfDay(d).toISOString().slice(0, 10);
      if (groups[key]) groups[key].push(row);
    }
    return Object.entries(groups).map(([key, gr]) => ({
      key,
      label: new Intl.DateTimeFormat('ro-RO', { day: '2-digit', month: '2-digit' }).format(new Date(key)),
      stats: calcStats(gr),
    }));
  }

  const keyFn = period === 'weekly' ? isoWeek
              : period === 'monthly' ? isoMonth
              : isoYear;

  const groups = {};
  for (const row of rows) {
    const key = keyFn(row.eventDate || row.settledAt || 0);
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, gr]) => ({ key, label: key, stats: calcStats(gr) }));
}
