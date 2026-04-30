import { safeNumber, percent, parseLikelyScore } from '../logic/format.js';

const MARKET_MAP = {
  over15: {
    label: 'Over 1.5G',
    oldKey: 'over_15',
    oddsKey: 'odds_over_15',
    rawProbKey: 'prob_over_15'
  },
  btts: {
    label: 'BTTS',
    oldKey: 'btts_yes',
    oddsKey: 'odds_btts_yes',
    rawProbKey: 'prob_btts_yes'
  },
  under35: {
    label: 'Under 3.5G',
    oldKey: 'under_35',
    oddsKey: 'odds_under_35',
    rawProbKey: 'prob_under_35'
  }
};

function marketFromRaw(raw, event, type) {
  const config = MARKET_MAP[type];
  const enriched = raw?.markets_enriched?.[config.oldKey] || null;
  const probFromEnriched = enriched?.prob != null ? percent(enriched.prob) : null;
  const fallbackProb = type === 'under35'
    ? 100 - percent(raw?.prob_over_35)
    : percent(raw?.[config.rawProbKey]);
  const odds = safeNumber(enriched?.odds, safeNumber(event?.[config.oddsKey], 0));
  const probability = probFromEnriched ?? fallbackProb;
  const edgePct = enriched?.edge_pp != null ? safeNumber(enriched.edge_pp, 0) : safeNumber(raw?.edge_pp, 0);
  const evPct = enriched?.ev_pct != null ? safeNumber(enriched.ev_pct, 0) : safeNumber(raw?.ev_pct, 0);
  const score = enriched?.score != null ? safeNumber(enriched.score, 0) : 0;
  const riskTier = enriched?.risk_tier || raw?.risk_tier || '—';

  return {
    type,
    label: config.label,
    probability,
    odds,
    edgePct,
    evPct,
    score,
    riskTier,
    fairOdds: enriched?.fair_odds || null,
    kellyPct: enriched?.kelly_pct != null ? safeNumber(enriched.kelly_pct, 0) : safeNumber(raw?.kelly_pct, 0),
    rationale: enriched?.rationale || ''
  };
}

function findBestBet(markets, raw) {
  const preferred = raw?.best_market?.market_key || raw?.best_market?.market || '';
  const mapped = {
    over_15: 'over15',
    btts_yes: 'btts',
    under_35: 'under35',
    over15: 'over15',
    btts: 'btts',
    under35: 'under35'
  }[preferred];

  if (mapped && markets[mapped]) return markets[mapped];

  return Object.values(markets)
    .filter((m) => m.odds > 1.01)
    .sort((a, b) => (b.evPct - a.evPct) || (b.edgePct - a.edgePct) || (b.probability - a.probability))[0] || null;
}

export function normalizeMatch(raw) {
  const event = raw?.event || {};
  const id = event.id || raw?.event_id || raw?.id;
  if (!id) return null;

  const markets = {
    over15: marketFromRaw(raw, event, 'over15'),
    btts: marketFromRaw(raw, event, 'btts'),
    under35: marketFromRaw(raw, event, 'under35')
  };
  const bestBet = findBestBet(markets, raw);
  const mostLikelyScore = raw?.most_likely_score || raw?.poisson_metrics?.most_likely_score || '';
  const likelyScore = parseLikelyScore(mostLikelyScore);

  return {
    id: String(id),
    predictionId: raw?.id || raw?.prediction_id || null,
    home: event.home_team || raw?.home || 'Gazdă',
    away: event.away_team || raw?.away || 'Oaspete',
    league: event.league?.name || raw?.league || '—',
    country: event.league?.country || '',
    date: event.event_date || raw?.event_date || raw?.created_at || null,
    createdAt: raw?.created_at || null,
    status: event.status || raw?.status || 'pending',
    homeScore: event.home_score,
    awayScore: event.away_score,
    confidence: percent(raw?.confidence),
    xgHome: safeNumber(raw?.expected_home_goals, 0),
    xgAway: safeNumber(raw?.expected_away_goals, 0),
    xgTotal: safeNumber(raw?.expected_home_goals, 0) + safeNumber(raw?.expected_away_goals, 0),
    probHome: percent(raw?.prob_home_win),
    probDraw: percent(raw?.prob_draw),
    probAway: percent(raw?.prob_away_win),
    probOver15: markets.over15.probability,
    probBtts: markets.btts.probability,
    probUnder35: markets.under35.probability,
    riskTier: raw?.risk_tier || bestBet?.riskTier || '—',
    evPct: safeNumber(raw?.ev_pct, bestBet?.evPct || 0),
    edgePct: safeNumber(raw?.edge_pp, bestBet?.edgePct || 0),
    bestBet,
    markets,
    mostLikelyScore,
    likelyScore,
    rationale: raw?.rationale || bestBet?.rationale || ''
  };
}
