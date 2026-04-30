import { useState } from 'react';
import UnifiedPredictionEngine from './UnifiedPredictionEngine.jsx';
import VerdictPerformance from './VerdictPerformance.jsx';
import ClvTracker from './ClvTracker.jsx';
import Ml5Analysis from './Ml5Analysis.jsx';
import MatchesHistory from './MatchesHistory.jsx';

const MODULES = [
  { key: 'unified', title: '🎯 Motor de Predicții Unificat', sub: 'Kelly + AI Memory + SmartBet — cel mai bun scor unificat.' },
  { key: 'verdict', title: '📊 Performanță Verdict',         sub: 'Analiza calității predicțiilor pe piețe.' },
  { key: 'clv',     title: '📈 CLV Tracker',                 sub: 'Closing Line Value — verifică dacă modelul bate piața.' },
  { key: 'ml5',     title: '🔬 Analiză ML5',                 sub: 'Motor multi-factor: formă, xG, tactici, absențe.' },
  { key: 'history', title: '📚 Istoric Meciuri',             sub: 'Monitorizare per rubrică: Top, O1.5, BTTS, U3.5, Value.' },
];

export default function MorePage({ loading, matches, rawData = {} }) {
  const [active, setActive] = useState(null);

  return (
    <section className="more-page">
      <div className="page-head">
        <div>
          <div className="section-kicker">Mai mult</div>
          <h1>Module avansate</h1>
          <p className="muted">Selectează un modul pentru a-l deschide.</p>
        </div>
        <div className="count-card">
          <strong>{MODULES.length}</strong><span>module</span>
        </div>
      </div>

      <div className="more-grid">
        {MODULES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`more-card-btn ${active === m.key ? 'active' : ''}`}
            onClick={() => setActive(active === m.key ? null : m.key)}
          >
            <span className="more-card-title">{m.title}</span>
            <span className="more-card-sub">{m.sub}</span>
          </button>
        ))}
      </div>

      {active === 'unified' && <UnifiedPredictionEngine data={rawData?.proIntelligence || {}} />}
      {active === 'verdict' && <VerdictPerformance data={rawData?.predictionTypeHistory || {}} quality={rawData?.modelQuality || {}} />}
      {active === 'clv'     && <ClvTracker data={rawData?.clvTracker || {}} />}
      {active === 'ml5'     && <Ml5Analysis data={rawData?.modelQuality || {}} benchmarks={rawData?.modelBenchmarks || {}} insights={rawData?.trainingInsights || []} />}
      {active === 'history' && <MatchesHistory matches={matches} recommendationLog={rawData?.recommendationLog || []} />}
    </section>
  );
}
