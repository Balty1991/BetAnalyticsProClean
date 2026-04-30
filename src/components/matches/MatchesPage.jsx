import { useMemo, useState } from 'react';
import { DEFAULT_FILTERS, applyMatchFilters } from '../../logic/matchFilters.js';
import { getCategoryCounts, getMatchesForCategory } from '../../logic/matchCriteria.js';
import MatchCategoryTabs from './MatchCategoryTabs.jsx';
import MatchFilters from './MatchFilters.jsx';
import MatchList from './MatchList.jsx';
import EmptyState from './EmptyState.jsx';

export default function MatchesPage({ loading, matches }) {
  const [category, setCategory] = useState('all');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const counts = useMemo(() => getCategoryCounts(matches), [matches]);
  const categoryMatches = useMemo(() => getMatchesForCategory(matches, category), [matches, category]);
  const visibleMatches = useMemo(() => applyMatchFilters(categoryMatches, filters), [categoryMatches, filters]);

  return <section className="matches-page">
    <div className="page-head">
      <div>
        <div className="section-kicker">Meciuri</div>
        <h1>Analiză pe rubrici curate</h1>
        <p className="muted">Categoriile rămân: Toate, Top, O1.5, BTTS, U3.5 și Value. Resetul filtrelor există o singură dată.</p>
      </div>
      <div className="count-card"><strong>{loading ? '…' : visibleMatches.length}</strong><span>afișate</span></div>
    </div>

    <MatchCategoryTabs activeCategory={category} counts={counts} onChange={setCategory} />
    <MatchFilters matches={categoryMatches} filters={filters} onChange={setFilters} />
    {visibleMatches.length ? <MatchList matches={visibleMatches} /> : <EmptyState text="Nu există meciuri pentru categoria și filtrele selectate." />}
  </section>;
}
