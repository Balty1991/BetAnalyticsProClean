export default function EmptyState({ title = 'Nimic de afișat', text = 'Nu există meciuri pentru filtrele selectate.' }) {
  return <section className="panel empty-state"><h2>{title}</h2><p className="muted">{text}</p></section>;
}
