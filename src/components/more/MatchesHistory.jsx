import { useMemo, useState } from 'react';
import { buildTrackedHistoryRows } from '../../data/normalizeHistory.js';
import { buildCategorySummary, buildPeriodPerformance, getRowsForCategory } from '../../logic/performance.js';
import { fmtOdd, fmtPct, fmtSigned } from '../../logic/format.js';

const PERIODS = [
  { key: 'last7',   label: 'Ultimele 7 zile' },
  { key: 'weekly',  label: 'Săptămânal' },
  { key: 'monthly', label: 'Lunar' },
  { key: 'yearly',  label: 'Anual' },
];

export default function MatchesHistory({ matches, recommendationLog }) {
  const [category, setCategory] = useState('all');
  const [period, setPeriod]     = useState('last7');

  const rows       = useMemo(() => buildTrackedHistoryRows(recommendationLog, matches), [recommendationLog, matches]);
  const summary    = useMemo(() => buildCategorySummary(rows), [rows]);
  const activeRows = useMemo(() => getRowsForCategory(rows, category), [rows, category]);
  const periodRows = useMemo(() => buildPeriodPerformance(activeRows, period), [activeRows, period]);

  return (
    <section className="panel module-panel history-module" style={{ marginTop: 16 }}>
      <div className="module-head">
        <div>
          <div className="section-kicker">Istoric Meciuri</div>
          <h2>📚 Monitorizare rubrici</h2>
          <p className="muted">
            „Toate" = cumulat Top + O1.5 + BTTS + U3.5 + Value.
            Pending intră la total dar ROI/WR se calculează doar din win/loss.
          </p>
        </div>
        <div className="score-box large">
          <strong>{rows.length}</strong>
          <span>loguri</span>
        </div>
      </div>

      {/* Category summary cards */}
      <div className="history-summary-grid">
        {summary.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`history-summary-card ${category === item.key ? 'active' : ''}`}
            onClick={() => setCategory(item.key)}
          >
            <span>{item.label}</span>
            <strong>{item.stats.settled}/{item.stats.total}</strong>
            <em className={item.stats.roi >= 0 ? 'positive' : 'negative'}>
              {fmtSigned(item.stats.roi, '%')}
            </em>
          </button>
        ))}
      </div>

      {/* Period tabs */}
      <div className="period-tabs">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={period === p.key ? 'active' : ''}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {periodRows.length ? (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Perioadă</th>
                <th>Total</th>
                <th>W/L</th>
                <th>WR</th>
                <th>ROI</th>
                <th>Profit</th>
                <th>Cotă</th>
              </tr>
            </thead>
            <tbody>
              {periodRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{row.stats.total}</td>
                  <td>{row.stats.wins}/{row.stats.losses}</td>
                  <td>{fmtPct(row.stats.winRate)}</td>
                  <td className={row.stats.roi >= 0 ? 'positive' : 'negative'}>{fmtSigned(row.stats.roi, '%')}</td>
                  <td className={row.stats.profit >= 0 ? 'positive' : 'negative'}>{fmtSigned(row.stats.profit, 'u')}</td>
                  <td>{fmtOdd(row.stats.avgOdds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: '.82rem' }}>
          Nu există date de afișat pentru selecția curentă.
        </p>
      )}

      <p className="history-note">
        <strong>Notă:</strong> Meciurile monitorizate sunt doar cele ce apar în rubricile din secțiunea Meciuri (Top, O1.5, BTTS, U3.5, Value). Pending intră la total, dar ROI și WR se calculează exclusiv din rezultate finale.
      </p>
    </section>
  );
}
