import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import MainTabs from './components/MainTabs.jsx';
import Dashboard from './components/Dashboard.jsx';
import MatchesPage from './components/matches/MatchesPage.jsx';
import MorePage from './components/more/MorePage.jsx';
import { loadAppData } from './data/api.js';
import { normalizeMatch } from './data/normalizeMatch.js';
import { enrichMatchesWithCriteria } from './logic/matchCriteria.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rawData, setRawData] = useState(null);
  const [loadState, setLoadState] = useState({ loading: true, error: '' });

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const data = await loadAppData();
        if (cancelled) return;
        setRawData(data);
        setLoadState({ loading: false, error: '' });
      } catch (error) {
        if (cancelled) return;
        setLoadState({ loading: false, error: error?.message || 'Eroare la încărcarea datelor.' });
      }
    }
    boot();
    return () => { cancelled = true; };
  }, []);

  const matchSource = useMemo(() => {
    const predictions = Array.isArray(rawData?.predictions) ? rawData.predictions : [];
    if (predictions.length) return predictions;
    return Array.isArray(rawData?.recommendationLog) ? rawData.recommendationLog : [];
  }, [rawData]);

  const matches = useMemo(() => {
    const normalized = matchSource.map(normalizeMatch).filter(Boolean);
    return enrichMatchesWithCriteria(normalized, rawData?.modelBenchmarks || {});
  }, [rawData, matchSource]);

  const appMeta = useMemo(() => ({
    predictions: matchSource.length,
    eligible: matches.filter((m) => m.analysisState === 'ELIGIBLE').length,
    updatedAt: rawData?.fullHistoryMeta?.updated_at || rawData?.proIntelligence?.updated_at || null
  }), [rawData, matches, matchSource]);

  return (
    <div className="app-shell">
      <Header meta={appMeta} loading={loadState.loading} />
      <MainTabs activeTab={activeTab} onChange={setActiveTab} />

      <main className="main-content">
        {loadState.error ? (
          <section className="panel state-panel">
            <h1>Eroare încărcare</h1>
            <p>{loadState.error}</p>
            <p className="muted">Verifică dacă fișierele JSON există în <code>public/data/</code>.</p>
          </section>
        ) : null}

        {!loadState.error && activeTab === 'dashboard' ? <Dashboard /> : null}
        {!loadState.error && activeTab === 'matches' ? (
          <MatchesPage loading={loadState.loading} matches={matches} />
        ) : null}
        {!loadState.error && activeTab === 'more' ? (
          <MorePage loading={loadState.loading} matches={matches} rawData={rawData} />
        ) : null}
      </main>
    </div>
  );
}
