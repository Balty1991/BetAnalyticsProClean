import { fmtDateTime, fmtPct } from '../../logic/format.js';

export default function VerdictPerformance({ data = {}, quality = {} }) {
  const markets = data?.markets || [];
  return <section className="panel module-panel">
    <div className="module-head"><div><div className="section-kicker">Verdict</div><h2>📊 Performanță Verdict</h2><p className="muted">Citire din <code>prediction_type_history.json</code> și <code>model_quality.json</code>.</p></div><div className="score-box large"><strong>{quality?.quality_grade || '—'}</strong><span>grade</span></div></div>
    <div className="metric-grid"><div><span>Quality score</span><strong>{quality?.quality_score ? quality.quality_score.toFixed(1) : '—'}</strong></div><div><span>Validate</span><strong>{data?.current_validated_count || 0}</strong></div><div><span>Update</span><strong>{fmtDateTime(data?.updated_at)}</strong></div></div>
    <div className="simple-list">{markets.slice(0, 12).map((market) => <article key={market.market || market.key} className="simple-row"><div><strong>{market.market || market.key}</strong><span>{market.note || market.status || 'monitorizare'}</span></div><div className="row-metrics"><span>{market.total || market.tracked || 0} total</span><span>{fmtPct(market.win_rate || market.winrate || 0)}</span></div></article>)}</div>
  </section>;
}
