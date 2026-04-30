import { MATCH_CATEGORIES } from '../../logic/matchCriteria.js';

export default function MatchCategoryTabs({ activeCategory, counts = {}, onChange }) {
  return <div className="match-category-tabs">
    {MATCH_CATEGORIES.map((category) => <button key={category.key} type="button" className={`match-category-tab ${activeCategory === category.key ? 'active' : ''}`} onClick={() => onChange(category.key)}>
      <span>{category.label}</span>
      <strong>{counts[category.key] || 0}</strong>
    </button>)}
  </div>;
}
