import { fmtDateTime, fmtOdd, fmtPct, fmtSigned } from '../../logic/format.js';

export default function UnifiedPredictionEngine({ data = {} }) {
  const picks = data?.top_ev || [];
  return <section className="panel module-panel">
    <div className="module-head"><div><div className="section-kicker">Motor Unificat</div><h2>🎯 Motor de Predicții Unificat</h2><p className="muted">Citire din <code>pro_intelligence.json</code>.</p></div><div className="score-box large"><strong>{data?.overall_score || 0}</strong><span>score</span></div></div>
    <div className="metric-grid"><div><span>Top EV</span><strong>{picks.length}</strong></div><div><span>Safe</span><strong>{data?.safest?.length || 0}</strong></div><div><span>Update</span><strong>{fmtDateTime(data?.updated_at)}</strong></div></div>
    <div className="simple-list">{picks.slice(0, 12).map((pick, index) => <article key={`${pick.event_id}-${pick.market}-${index}`} className="simple-row"><div><strong>{pick.home} - {pick.away}</strong><span>{pick.league} · {pick.market}</span></div><div className="row-metrics"><span>{fmtPct(pick.model_probability_pct || 0)}</span><span>{fmtOdd(pick.odds)}</span><span className={(pick.ev_pct || 0) >= 0 ? 'positive' : 'negative'}>{fmtSigned(pick.ev_pct || 0, '%')}</span></div></article>)}</div>
  </section>;
}
