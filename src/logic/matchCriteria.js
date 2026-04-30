export const DEFAULT_FILTERS = {
  search: '',
  league: 'all',
  minProbability: 0,
  minEdge: 0,
  sort: 'date'
};

export function getLeagues(matches) {
  return [...new Set(matches.map((m) => m.league).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ro'));
}

export function applyMatchFilters(matches, filters) {
  const search = String(filters.search || '').trim().toLowerCase();
  let out = matches.filter((match) => {
    const bet = match.bestBet || {};
    if (filters.league !== 'all' && match.league !== filters.league) return false;
    if (filters.minProbability && Number(bet.probability || 0) < Number(filters.minProbability)) return false;
    if (filters.minEdge && Number(bet.edgePct || 0) < Number(filters.minEdge)) return false;
    if (search) {
      const haystack = `${match.home} ${match.away} ${match.league} ${bet.label || ''}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  out = [...out].sort((a, b) => {
    if (filters.sort === 'score') return (b.smartScore || 0) - (a.smartScore || 0);
    if (filters.sort === 'probability') return (b.bestBet?.probability || 0) - (a.bestBet?.probability || 0);
    if (filters.sort === 'edge') return (b.bestBet?.edgePct || 0) - (a.bestBet?.edgePct || 0);
    if (filters.sort === 'odds') return (b.bestBet?.odds || 0) - (a.bestBet?.odds || 0);
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return out;
}
