import { getMatchesForCategory, MATCH_CATEGORIES } from '../logic/matchCriteria.js';

const CATEGORY_KEYS = MATCH_CATEGORIES.map((category) => category.key);

function normalizeStatus(row) {
  const status = String(row?.status || '').toLowerCase();
  if (row?.won === true || ['won', 'win', 'w', 'hit', 'success'].includes(status)) return 'win';
  if (row?.won === false || ['lost', 'loss', 'l', 'miss', 'failed'].includes(status)) return 'loss';
  if (['void', 'push', 'cancelled', 'canceled'].includes(status)) return 'void';
  return 'pending';
}

function marketToCategory(row) {
  const key = String(row?.market_key || row?.market || '').toLowerCase().replace(/\s+/g, '');
  if (key.includes('over15') || key.includes('over1.5')) return 'over15';
  if (key.includes('btts') || key.includes('gg')) return 'btts';
  if (key.includes('under35') || key.includes('under3.5')) return 'under35';
  return null;
}

export function buildTrackedHistoryRows(recommendationLog = [], matches = []) {
  const categoryIds = CATEGORY_KEYS.reduce((acc, key) => {
    acc[key] = new Set(getMatchesForCategory(matches, key).map((match) => String(match.id)));
    return acc;
  }, {});

  const allTrackedIds = new Set([
    ...categoryIds.top,
    ...categoryIds.over15,
    ...categoryIds.btts,
    ...categoryIds.under35,
    ...categoryIds.value
  ]);

  return recommendationLog
    .map((row) => {
      const eventId = String(row?.event_id || row?.eventId || '');
      if (!eventId || !allTrackedIds.has(eventId)) return null;

      const rowCategory = marketToCategory(row);
      const categories = [];
      if (categoryIds.top.has(eventId)) categories.push('top');
      if (categoryIds.value.has(eventId)) categories.push('value');
      if (rowCategory && categoryIds[rowCategory]?.has(eventId)) categories.push(rowCategory);
      if (!categories.length) return null;

      return {
        id: row?.log_id || `${eventId}-${row?.market_key || row?.market || 'market'}`,
        eventId,
        home: row?.home || 'Gazdă',
        away: row?.away || 'Oaspete',
        league: row?.league || '—',
        market: row?.market || row?.market_key || '—',
        marketKey: row?.market_key || '',
        odds: Number(row?.odds || 0),
        probability: Number(row?.adjusted_prob || row?.model_prob || row?.market_prob || 0),
        edgePct: Number(row?.edge_pct || row?.edge_pp || 0),
        status: normalizeStatus(row),
        won: row?.won,
        eventDate: row?.event_date || row?.prediction_created_at || row?.logged_at || null,
        settledAt: row?.settled_at || null,
        categories: [...new Set(categories)]
      };
    })
    .filter(Boolean);
}
