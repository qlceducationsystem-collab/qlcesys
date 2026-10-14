export function MetricCard({ label, value, hint, tone = '', explanation }) {
  return (
    <div className={`metric-card tone-${tone || 'none'}`}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {hint && <span className="metric-hint">{hint}</span>}
      {explanation && <p className="metric-explain">{explanation}</p>}
    </div>
  );
}

export const MetricGrid = ({ children, cols = 3 }) => <div className={`metric-grid cols-${cols}`}>{children}</div>;

export function ExplainRows({ title = '¿Qué está ocurriendo?', rows, final }) {
  return (
    <div className="explain">
      <div className="explain-title">{title}</div>
      {rows.map(([label, value, toneClass]) => (
        <div className="explain-row" key={label}>
          <span>{label}</span>
          <strong className={toneClass || ''}>{value}</strong>
        </div>
      ))}
      {final && <div className={`explain-final ${final.tone || ''}`}><span>{final.label}</span><strong>{final.value}</strong></div>}
    </div>
  );
}

export function RiskNote({ children, variant = 'gold' }) {
  return <div className={`risk-note ${variant}`}>{children}</div>;
}

export function ToolCard({ step, title, description, children, aside }) {
  return (
    <section className="tool-card">
      <header className="tool-card-head">
        {step && <span className="tool-step">{step}</span>}
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

export function SimBadge() {
  return <span className="sim-badge">Simulación educativa · No modifica tu patrimonio</span>;
}

export function RealBadge() {
  return <span className="real-badge">Información real · Alimenta tu plataforma</span>;
}

const KIND_BADGES = {
  REAL: ['real-badge', 'Dato real'],
  PLAN: ['plan-badge', 'Plan · no es un movimiento'],
  ESTIMATE: ['estimate-badge', 'Estimación · no modifica tu realidad'],
  SIMULATION: ['sim-badge', 'Simulación educativa · No modifica tu patrimonio'],
};

export function KindBadge({ kind }) {
  const [className, label] = KIND_BADGES[kind];
  return <span className={className}>{label}</span>;
}

export function SaveStatus({ action, savedText = 'Cambios guardados.' }) {
  if (action.busy) return <span className="save-status is-busy" role="status">Guardando…</span>;
  if (action.saved) return <span className="save-status is-saved" role="status">✓ {savedText}</span>;
  return null;
}

export function ToolSkeleton() {
  return (
    <div className="tool" aria-busy="true" aria-label="Cargando herramienta">
      <div className="skeleton-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" />)}</div>
      <div className="skeleton block" />
    </div>
  );
}
