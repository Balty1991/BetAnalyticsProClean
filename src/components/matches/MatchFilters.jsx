import { DEFAULT_FILTERS, getLeagues } from '../../logic/matchFilters.js';

export default function MatchFilters({ matches, filters, onChange }) {
  const leagues = getLeagues(matches);
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return <div className="panel match-filters">
    <label><span>Caută</span><input value={filters.search} onChange={(e) => update('search', e.target.value)} placeholder="echipă sau ligă" /></label>
    <label><span>Ligă</span><select value={filters.league} onChange={(e) => update('league', e.target.value)}><option value="all">Toate ligile</option>{leagues.map((league) => <option key={league} value={league}>{league}</option>)}</select></label>
    <label><span>Prob. minimă</span><select value={filters.minProbability} onChange={(e) => update('minProbability', Number(e.target.value))}><option value="0">Orice</option><option value="60">60%+</option><option value="70">70%+</option><option value="80">80%+</option><option value="90">90%+</option></select></label>
    <label><span>Edge minim</span><select value={filters.minEdge} onChange={(e) => update('minEdge', Number(e.target.value))}><option value="0">Orice</option><option value="3">3pp+</option><option value="5">5pp+</option><option value="8">8pp+</option><option value="10">10pp+</option></select></label>
    <label><span>Sortare</span><select value={filters.sort} onChange={(e) => update('sort', e.target.value)}><option value="date">Dată</option><option value="score">SmartScore</option><option value="probability">Probabilitate</option><option value="edge">Edge</option><option value="odds">Cotă</option></select></label>
    <button type="button" className="btn reset-btn" onClick={() => onChange(DEFAULT_FILTERS)}>Resetează filtrele</button>
  </div>;
}
