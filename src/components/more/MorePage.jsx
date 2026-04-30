import { useState } from 'react';
import UnifiedPredictionEngine from './UnifiedPredictionEngine.jsx';
import VerdictPerformance from './VerdictPerformance.jsx';
import ClvTracker from './ClvTracker.jsx';
import Ml5Analysis from './Ml5Analysis.jsx';
import MatchesHistory from './MatchesHistory.jsx';

const MODULES = [
  { key: 'unified', label: '🎯 Motor de Predicții Unificat' },
  { key: 'verdict', label: '📊 Performanță Verdict' },
  { key: 'clv', label: '📈 CLV Tracker' },
  { key: 'ml5', label: '🔬 Analiză ML5' },
  { key: 'history', label: '📚 Istoric Meciuri' }
];

export default function MorePage({ loading, matches, rawData = {} }) {
  const [activeModule, setActiveModule] = useState('unified');

  return <section className="more-page">
    <div className="page-head">
      <div>
        <div className="section-kicker">Mai mult</div>
        <h1>Module avansate</h1>
        <p className="muted">Aici sunt modulele PRO și istoricul separat pentru rubricile din Meciuri.</p>
      </div>
      <div className="count-card"><strong>{loading ? '…' : MODULES.length}</strong><span>module</span></div>
    </div>

    <div className="more-tabs">
      {MODULES.map((module) => <button key={module.key} type="button" className={`more-tab ${activeModule === module.key ? 'active' : ''}`} onClick={() => setActiveModule(module.key)}>{module.label}</button>)}
    </div>

    {activeModule === 'unified' ? <UnifiedPredictionEngine data={rawData?.proIntelligence || {}} /> : null}
    {activeModule === 'verdict' ? <VerdictPerformance data={rawData?.predictionTypeHistory || {}} quality={rawData?.modelQuality || {}} /> : null}
    {activeModule === 'clv' ? <ClvTracker data={rawData?.clvTracker || {}} /> : null}
    {activeModule === 'ml5' ? <Ml5Analysis data={rawData?.modelQuality || {}} benchmarks={rawData?.modelBenchmarks || {}} insights={rawData?.trainingInsights || []} /> : null}
    {activeModule === 'history' ? <MatchesHistory matches={matches} recommendationLog={rawData?.recommendationLog || []} /> : null}
  </section>;
}
