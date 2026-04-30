import { fmtDateTime } from '../../logic/format.js';

export default function Ml5Analysis({ data = {}, benchmarks = {}, insights = [] }) {
  const ranking = benchmarks?.ranking || [];
  return <section className="panel module-panel">
    <div className="module-head"><div><div className="section-kicker">ML5</div><h2>🔬 Analiză ML5</h2><p className="muted">Citire din <code>model_quality.json</code>, <code>model_benchmarks.json</code> și <code>training_insights.json</code>.</p></div><div className="score-box large"><strong>{data?.quality_score ? data.quality_score.toFixed(0) : '—'}</strong><span>quality</span></div></div>
    <div className="metric-grid"><div><span>Train</span><strong>{benchmarks?.n_train || '—'}</strong></div><div><span>Test</span><strong>{benchmarks?.n_test || '—'}</strong></div><div><span>Update</span><strong>{fmtDateTime(data?.updated_at || benchmarks?.updated_at)}</strong></div></div>
    <div className="simple-list">
      {ranking.slice(0, 8).map((row, index) => <article key={`${row.market || row.key}-${index}`} className="simple-row"><div><strong>{row.market || row.key || `Model ${index + 1}`}</strong><span>{row.model || row.label || 'benchmark'}</span></div><div className="row-metrics"><span>AUC {row.auc ? Number(row.auc).toFixed(3) : '—'}</span><span>ECE {row.ece ? Number(row.ece).toFixed(3) : '—'}</span></div></article>)}
      {insights.slice(0, 8).map((row, index) => <article key={`${row.league}-${row.market}-${index}`} className="simple-row"><div><strong>{row.league}</strong><span>{row.market} · {row.reason}</span></div><div className="row-metrics"><span>{Number(row.strength || 0).toFixed(1)}</span><span>{row.matches} meciuri</span></div></article>)}
    </div>
  </section>;
}
