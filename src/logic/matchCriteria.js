import { safeNumber } from './format.js';

export const MATCH_CATEGORIES = [
  { key: 'all',     label: 'Toate'   },
  { key: 'top',     label: '⭐ Top'  },
  { key: 'over15',  label: '🔥 O1.5' },
  { key: 'btts',    label: '🤝 BTTS' },
  { key: 'under35', label: '🧊 U3.5' },
  { key: 'value',   label: '💰 Value'},
];

// ─── SmartScore (0–100) ───────────────────────────────────────────────────────
function calcSmartScore(match, benchmarks = {}) {
  const bet     = match.bestBet || {};
  const evPct   = safeNumber(bet.evPct, 0);
  const edgePct = safeNumber(bet.edgePct, 0);
  const prob    = safeNumber(bet.probability, 0);
  const conf    = safeNumber(match.confidence, 0);
  const odds    = safeNumber(bet.odds, 0);

  if (evPct < 0) return Math.max(0, 30 + evPct * 2);

  const confScore  = (conf / 100) * 25;
  const probScore  = Math.min(20, ((prob - 50) / 40) * 20);
  const evScore    = Math.min(25, evPct * 2.5);
  const edgeScore  = Math.min(15, edgePct * 1.5);
  const oddsScore  = odds >= 1.3 && odds <= 2.8 ? 10 : odds > 2.8 ? 5 : 3;

  const marketKey = bet.type
    ? { over15: 'over_15', btts: 'btts_yes', under35: 'under_35' }[bet.type]
    : null;
  const bmRoi = marketKey ? safeNumber(benchmarks?.[marketKey]?.roi_pct, 0) : 0;
  const bonus = Math.min(5, bmRoi * 0.5);

  return Math.min(100, Math.max(0, confScore + probScore + evScore + edgeScore + oddsScore + bonus));
}

// ─── Category flags ───────────────────────────────────────────────────────────
function buildCategoryFlags(match) {
  const bet     = match.bestBet || {};
  const evPct   = safeNumber(bet.evPct, 0);
  const edgePct = safeNumber(bet.edgePct, 0);
  const prob    = safeNumber(bet.probability, 0);
  const score   = safeNumber(match.smartScore, 0);

  return {
    top:     score >= 68 && evPct >= 3 && prob >= 62,
    over15:  safeNumber(match.probOver15, 0) >= 68,
    btts:    safeNumber(match.probBtts, 0) >= 62,
    under35: safeNumber(match.probUnder35, 0) >= 58,
    value:   evPct >= 5 && safeNumber(bet.odds, 0) >= 1.5 && edgePct >= 3,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function enrichMatchesWithCriteria(matches, benchmarks = {}) {
  return matches.map((match) => {
    const smartScore    = calcSmartScore(match, benchmarks);
    const enriched      = { ...match, smartScore };
    const categoryFlags = buildCategoryFlags(enriched);
    const isEligible    = Object.values(categoryFlags).some(Boolean);
    return { ...enriched, categoryFlags, analysisState: isEligible ? 'ELIGIBLE' : 'MONITOR' };
  });
}

export function getCategoryCounts(matches) {
  const counts = { all: matches.length };
  for (const cat of MATCH_CATEGORIES) {
    if (cat.key === 'all') continue;
    counts[cat.key] = matches.filter((m) => m.categoryFlags?.[cat.key]).length;
  }
  return counts;
}

export function getMatchesForCategory(matches, category) {
  if (!category || category === 'all') return matches;
  return matches.filter((m) => m.categoryFlags?.[category]);
}
