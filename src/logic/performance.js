import { MATCH_CATEGORIES } from './matchCriteria.js';

function rowTime(row) {
  const value = row?.settledAt || row?.eventDate;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function profitUnits(row) {
  if (row.status === 'win') return row.odds > 1 ? row.odds - 1 : 0;
  if (row.status === 'loss') return -1;
  return 0;
}

export function computeStats(rows = []) {
  const settled = rows.filter((row) => row.status === 'win' || row.status === 'loss');
  const wins = settled.filter((row) => row.status === 'win').length;
  const losses = settled.length - wins;
  const pending = rows.filter((row) => row.status === 'pending').length;
  const profit = settled.reduce((sum, row) => sum + profitUnits(row), 0);
  const avgOdds = settled.length ? settled.reduce((sum, row) => sum + Number(row.odds || 0), 0) / settled.length : 0;

  return {
    total: rows.length,
    settled: settled.length,
    wins,
    losses,
    pending,
    winRate: settled.length ? (wins / settled.length) * 100 : 0,
    roi: settled.length ? (profit / settled.length) * 100 : 0,
    profit,
    avgOdds
  };
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getIsoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-S${String(weekNo).padStart(2, '0')}`;
}

export function getRowsForCategory(rows, categoryKey) {
  if (categoryKey === 'all') return rows.filter((row) => row.categories?.some((c) => ['top', 'over15', 'btts', 'under35', 'value'].includes(c)));
  return rows.filter((row) => row.categories?.includes(categoryKey));
}

export function buildPeriodPerformance(rows, period) {
  const now = startOfDay(new Date());

  if (period === 'last7') {
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(now);
      day.setDate(day.getDate() - (6 - index));
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const dayRows = rows.filter((row) => rowTime(row) >= day.getTime() && rowTime(row) < next.getTime());
      return {
        key: day.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat('ro-RO', { day: '2-digit', month: '2-digit' }).format(day),
        stats: computeStats(dayRows)
      };
    });
  }

  const buckets = new Map();
  rows.forEach((row) => {
    const d = new Date(rowTime(row));
    if (!Number.isFinite(d.getTime())) return;
    let key = '';
    if (period === 'weekly') key = getIsoWeekKey(d);
    if (period === 'monthly') key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (period === 'yearly') key = String(d.getFullYear());
    if (!key) return;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(row);
  });

  return [...buckets.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, period === 'weekly' ? 12 : 24)
    .map(([key, bucketRows]) => ({ key, label: key, stats: computeStats(bucketRows) }));
}

export function buildCategorySummary(rows) {
  return MATCH_CATEGORIES.map((category) => ({
    ...category,
    stats: computeStats(getRowsForCategory(rows, category.key))
  }));
}
