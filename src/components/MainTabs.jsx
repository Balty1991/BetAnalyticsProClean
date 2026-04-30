const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'matches', label: 'Meciuri' },
  { key: 'more', label: 'Mai mult' }
];

export default function MainTabs({ activeTab, onChange }) {
  return (
    <nav className="main-tabs" aria-label="Navigare principală">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`main-tab ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
