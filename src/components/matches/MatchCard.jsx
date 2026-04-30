import { fmtDateTime, fmtOdd, fmtPct, fmtSigned } from '../../logic/format.js';

const TYPE_LABELS = { over15: '🔥 O1.5', btts: '🤝 BTTS', under35: '🧊 U3.5' };

export default function MatchCard({ match }) {
  const bet = match.bestBet || {};
  const flags = match.categoryFlags || {};
  const badges = [
    flags.top ? '⭐ Top' : null,
    flags.over15 ? '🔥 O1.5' : null,
    flags.btts ? '🤝 BTTS' : null,
    flags.under35 ? '🧊 U3.5' : null,
    flags.value ? '💰 Value' : null
  ].filter(Boolean);

  return <article className="panel match-card">
    <div className="match-card-top">
      <div>
        <div className="league-line">{match.league || '—'} · {fmtDateTime(match.date)}</div>
        <h2>{match.home || 'Gazdă'} <span>vs</span> {match.away || 'Oaspete'}</h2>
      </div>
      <div className="score-box"><strong>{Math.round(match.smartScore || 0)}</strong><span>score</span></div>
    </div>
    <div className="badges-row">{badges.map((badge) => <span key={badge} className="badge">{badge}</span>)}</div>
    <div className="main-pick">
      <div><span className="muted tiny">Recomandare</span><strong>{bet.label || TYPE_LABELS[bet.type] || '—'}</strong></div>
      <div><span className="muted tiny">Prob.</span><strong>{fmtPct(bet.probability || 0)}</strong></div>
      <div><span className="muted tiny">Cotă</span><strong>{fmtOdd(bet.odds)}</strong></div>
      <div><span className="muted tiny">EV</span><strong className={(bet.evPct || 0) >= 0 ? 'positive' : 'negative'}>{fmtSigned(bet.evPct || 0, '%')}</strong></div>
    </div>
    <div className="market-grid">
      <div><span>O1.5</span><strong>{fmtPct(match.probOver15 || 0)}</strong></div>
      <div><span>BTTS</span><strong>{fmtPct(match.probBtts || 0)}</strong></div>
      <div><span>U3.5</span><strong>{fmtPct(match.probUnder35 || 0)}</strong></div>
      <div><span>xG</span><strong>{Number(match.xgTotal || 0).toFixed(2)}</strong></div>
    </div>
    {bet.reasons?.length ? <p className="reason-line">{bet.reasons.join(' · ')}</p> : null}
  </article>;
}
