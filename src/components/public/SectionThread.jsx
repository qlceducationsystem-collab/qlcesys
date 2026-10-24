export function SectionThread({ items, activeKey, onSelect, label }) {
  const index = Math.max(0, items.findIndex((item) => item.key === activeKey));
  const progress = items.length > 1 ? index / (items.length - 1) : 0;
  return (
    <nav className="thread" aria-label={label} style={{ '--count': items.length, '--progress': progress }}>
      <span className="thread-line" aria-hidden="true"><span className="thread-fill" /></span>
      <ol className="thread-list">
        {items.map((item, i) => (
          <li key={item.key}>
            <button
              type="button"
              className={`thread-node ${i < index ? 'is-done' : ''} ${i === index ? 'is-active' : ''}`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => onSelect(item.key)}
            >
              <span className="thread-dot" aria-hidden="true" />
              <span className="thread-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
