import { fmtDateTime } from '../logic/format.js';

export default function Header({ meta, loading }) {
  return (
    <header className="app-header">
      <div>
        <div className="brand-title">BetAnalytics Pro Clean</div>
        <div className="brand-subtitle">Repo nou · UI curat · date din JSON</div>
      </div>
      <div className="header-stats" aria-live="polite">
        <div className="pill"><strong>{loading ? '—' : meta.predictions}</strong><span>predicții</span></div>
        <div className="pill"><strong>{loading ? '—' : meta.eligible}</strong><span>eligibile</span></div>
        <div className="pill wide"><strong>{fmtDateTime(meta.updatedAt)}</strong><span>update</span></div>
      </div>
    </header>
  );
}
