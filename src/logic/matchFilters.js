export const DEFAULT_FILTERS = {
  search: '',
  league: 'all',
  minProbability: 0,
  minEdge: 0,
  sort: 'date',
};

export function getLeagues(matches) {
  const set = new Set();
  for (const m of matches) {
    if (m.league && m.league !== '—') set.add(m.league);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ro'));
}

export function applyMatchFilters(matches, filters) {
  const { search, league, minProbability, minEdge, sort } = filters;
  const q = search.trim().toLowerCase();

  let result = matches.filter((m) => {
    if (q && !m.home?.toLowerCase().includes(q) && !m.away?.toLowerCase().includes(q) && !m.league?.toLowerCase().includes(q)) return false;
    if (league !== 'all' && m.league !== league) return false;
    const prob = m.bestBet?.probability ?? m.confidence ?? 0;
    if (minProbability > 0 && prob < minProbability) return false;
    const edge = m.bestBet?.edgePct ?? m.edgePct ?? 0;
    if (minEdge > 0 && edge < minEdge) return false;
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (sort) {
      case 'score':       return (b.smartScore ?? 0) - (a.smartScore ?? 0);
      case 'probability': return (b.bestBet?.probability ?? 0) - (a.bestBet?.probability ?? 0);
      case 'edge':        return (b.bestBet?.edgePct ?? 0) - (a.bestBet?.edgePct ?? 0);
      case 'odds':        return (b.bestBet?.odds ?? 0) - (a.bestBet?.odds ?? 0);
      default: {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return da - db;
      }
    }
  });

  return result;
}
