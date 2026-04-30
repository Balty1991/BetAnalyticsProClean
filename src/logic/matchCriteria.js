import { safeNumber } from './format.js';

export const MATCH_CATEGORIES = [
  { key: 'all', label: 'Toate' },
  { key: 'top', label: '⭐ Top' },
  { key: 'over15', label: '🔥 O1.5' },
  { key: 'btts', label: '🤝 BTTS' },
  { key: 'under35', label: '🧊 U3.5' },
  { key: 'value', label: '💰 Value' }
];

const EDGE_FALLBACK = {
  over15: 10,
  under35: 15,
  btts: 5
};

function getDynamicThresholds(modelBenchmarks) {
  return modelBenchmarks?.dynamic_thresholds || {};
}

function getMarketMinEdge(type, modelBenchmarks = {}) {
  const threshold = getDynamicThresholds(modelBenchmarks)?.[type];
  if (threshold?.disabled) return Number.POSITIVE_INFINITY;
  if (typeof threshold?.bootstrap_min_edge === 'number' && threshold.bootstrap_min_edge > 0) return threshold.bootstrap_min_edge;
  if (typeof threshold?.min_edge === 'number') return threshold.min_edge;
  return EDGE_FALLBACK[type] ?? 3;
}

function isMarketDisabled(type, modelBenchmarks = {}) {
  return getDynamicThresholds(modelBenchmarks)?.[type]?.disabled === true;
}

function isDisplayable(match) {
  const time = new Date(match.date).getTime();
  const now = Date.now();
  if (!Number.isFinite(time)) return true;
  if (String(match.status || '').toLowerCase() === 'finished') return false;
  return time > now - 90 * 60 * 1000;
}

function hasHardContradiction(match, type) {
  const score = match.likelyScore;
  if (!score) return false;
  if (type === 'over15' && score.total < 2) return true;
  if (type === 'under35' && score.total >= 4) return true;
  if (type === 'btts' && !score.btts) return true;
  return false;
}

function marketFit(match, type) {
  let score = 0;
  const reasons = [];
  const xgTotal = safeNumber(match.xgTotal, 0);
  const xgHome = safeNumber(match.xgHome, 0);
  const xgAway = safeNumber(match.xgAway, 0);
  const likely = match.likelyScore;

  if (type === 'over15') {
    if (match.probOver15 >= 82) { score += 10; reasons.push('Peste 1.5 foarte puternic'); }
    if (xgTotal >= 2.35) { score += 10; reasons.push('xG total bun'); }
    if (likely?.total >= 2) { score += 6; reasons.push('scor probabil ≥ 2 goluri'); }
    if (likely && likely.total < 2) score -= 14;
  }

  if (type === 'under35') {
    if (match.probUnder35 >= 68) { score += 13; reasons.push('Under 3.5 solid'); }
    if (xgTotal <= 3.05) { score += 10; reasons.push('xG total controlat'); }
    if (likely?.total <= 3) { score += 12; reasons.push('scor probabil ≤ 3 goluri'); }
    if (likely && likely.total > 3) score -= 16;
  }

  if (type === 'btts') {
    if (match.probBtts >= 62) { score += 12; reasons.push('BTTS solid'); }
    if (xgHome >= 1 && xgAway >= 1) { score += 12; reasons.push('ambele echipe au xG bun'); }
    if (likely?.btts) { score += 10; reasons.push('scor probabil susține BTTS'); }
    if (likely && !likely.btts) score -= 16;
    if (Math.abs(xgHome - xgAway) > 1) { score -= 10; reasons.push('dezechilibru ofensiv'); }
  }

  return { score, reasons: [...new Set(reasons)] };
}

function buildCandidate(match, type, modelBenchmarks = {}) {
  const bet = match.markets?.[type];
  if (!bet || isMarketDisabled(type, modelBenchmarks)) return null;
  if (bet.odds <= 1.01) return null;
  if (bet.evPct <= 0) return null;
  if (hasHardContradiction(match, type)) return null;

  const edge = safeNumber(bet.edgePct, 0);
  const minEdge = getMarketMinEdge(type, modelBenchmarks);
  const fit = marketFit(match, type);

  if (type === 'over15') {
    if (bet.probability < 72 || match.probOver15 < 74 || match.xgTotal < 2 || bet.odds < 1.2 || edge < minEdge || bet.evPct < 2) return null;
  }

  if (type === 'under35') {
    if (match.probUnder35 < 68 || edge < minEdge) return null;
  }

  if (type === 'btts') {
    if (bet.probability < 62 || match.probBtts < 62 || match.xgHome < 1 || match.xgAway < 1 || Math.abs(match.xgHome - match.xgAway) > 1 || edge < 3 || bet.evPct < 3) return null;
  }

  const ticketScore = Math.max(0, Math.min(100,
    bet.score * 0.55 +
    fit.score * 1.1 +
    safeNumber(match.confidence, 0) * 0.2 +
    Math.max(edge, 0) * 0.55 +
    Math.max(bet.evPct, 0) * 0.35
  ));

  return {
    ...bet,
    type,
    ticketScore,
    reasons: fit.reasons
  };
}

export function enrichMatchesWithCriteria(matches, modelBenchmarks = {}) {
  return matches.map((match) => {
    const candidates = ['over15', 'btts', 'under35']
      .map((type) => buildCandidate(match, type, modelBenchmarks))
      .filter(Boolean)
      .sort((a, b) => (b.ticketScore - a.ticketScore) || (b.evPct - a.evPct) || (b.probability - a.probability));

    const bestBet = candidates[0] || null;
    const categoryFlags = {
      over15: candidates.some((c) => c.type === 'over15'),
      btts: candidates.some((c) => c.type === 'btts'),
      under35: candidates.some((c) => c.type === 'under35')
    };

    const value = Boolean(bestBet && (bestBet.riskTier === 'Value' || bestBet.evPct >= 8 || bestBet.edgePct >= 5));
    const top = Boolean(bestBet && (bestBet.ticketScore >= 70 || (match.confidence >= 55 && bestBet.evPct >= 8)));

    return {
      ...match,
      bestBet,
      eligibleCandidates: candidates,
      analysisState: bestBet ? 'ELIGIBLE' : 'FILTERED_OUT',
      smartScore: bestBet?.ticketScore || 0,
      categoryFlags: {
        ...categoryFlags,
        value,
        top,
        all: Boolean(bestBet)
      },
      displayable: isDisplayable(match)
    };
  });
}

export function getMatchesForCategory(matches, categoryKey) {
  const eligible = matches.filter((m) => m.analysisState === 'ELIGIBLE' && m.displayable);
  if (categoryKey === 'all') return eligible;
  return eligible.filter((m) => Boolean(m.categoryFlags?.[categoryKey]));
}

export function getCategoryCounts(matches) {
  return MATCH_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = getMatchesForCategory(matches, category.key).length;
    return acc;
  }, {});
}
