import { fmtDateTime, fmtSigned } from '../../logic/format.js';

export default function ClvTracker({ data = {} }) {
  const summary = data?.summary || {};
  const rows = Object.entries(data?.by_market || {}).map(([key, value]) => ({ key, ...value }));
  return <section className="panel module-panel">
    <div className="module-head"><div><div className="section-kicker">CLV</div><h2>📈 CLV Tracker</h2><p className="muted">Citire din <code>clv_tracker.json</code>.</p></div><div className="score-box large"><strong>{summary?.total_picks || 0}</strong><span>picks</span></div></div>
    <div className="metric-grid"><div><span>CLV mediu</span><strong>{fmtSigned(summary?.avg_clv_pct || 0, '%')}</strong></div><div><span>Pozitiv CLV</span><strong>{summary?.positive_clv_rate_pct ? `${summary.positive_clv_rate_pct.toFixed(1)}%` : '—'}</strong></div><div><span>Update</span><strong>{fmtDateTime(data?.updated_at)}</strong></div></div>
    <div className="simple-list">{rows.slice(0, 12).map((row) => <article key={row.key} className="simple-row"><div><strong>{row.key}</strong><span>{row.picks || row.count || 0} selecții</span></div><div className="row-metrics"><span>{fmtSigned(row.avg_clv_pct || row.clv_pct || 0, '%')}</span><span>{row.positive_clv_rate_pct ? `${row.positive_clv_rate_pct.toFixed(1)}%` : '—'}</span></div></article>)}</div>
  </section>;
}
