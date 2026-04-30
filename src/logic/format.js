export function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function percent(value) {
  const n = safeNumber(value, 0);
  if (n <= 1 && n >= 0) return n * 100;
  return n;
}

export function fmtPct(value, digits = 1) {
  const n = safeNumber(value, 0);
  return `${n.toFixed(digits)}%`;
}

export function fmtOdd(value) {
  const n = safeNumber(value, 0);
  return n > 0 ? n.toFixed(2) : '—';
}

export function fmtSigned(value, suffix = '') {
  const n = safeNumber(value, 0);
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}${suffix}`;
}

export function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('ro-RO', {
    timeZone: 'Europe/Bucharest',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function fmtDateOnly(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('ro-RO', {
    timeZone: 'Europe/Bucharest',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

export function parseLikelyScore(value) {
  const match = String(value || '').match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) return null;
  const home = Number(match[1]);
  const away = Number(match[2]);
  return { home, away, total: home + away, btts: home > 0 && away > 0 };
}
