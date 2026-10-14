import { tone } from '../../utils/format.js';

export function Card({ title, actions, children, className = '', ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {(title || actions) && (
        <header className="card-head">
          {title && <h3 className="section-title">{title}</h3>}
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, delta, deltaTone, accent }) {
  return (
    <div className={`card stat ${accent ? 'stat-accent' : ''}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta !== undefined && delta !== null && <div className={`delta ${deltaTone ?? ''}`}>{delta}</div>}
    </div>
  );
}

export const StatGrid = ({ children, cols = 4 }) => <div className={`grid grid-${cols}`}>{children}</div>;

export function PageHeader({ title, subtitle, kicker, actions }) {
  return (
    <div className="top">
      <div>
        {kicker && <div className="section-kicker">{kicker}</div>}
        <h1>{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="top-actions">{actions}</div>}
    </div>
  );
}

export const Notice = ({ children, variant = '' }) => <div className={`notice ${variant}`}>{children}</div>;

export function Pill({ children, variant = '' }) {
  return <span className={`pill ${variant}`}>{children}</span>;
}

export function ProgressBar({ value = 0, label }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="progress" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="bar" style={{ width: `${v}%` }} />
    </div>
  );
}

// Fila etiqueta / valor (estilo .row del HTML de referencia).
export function Row({ label, value, valueTone, sub }) {
  return (
    <div className="row">
      <span>
        {label}
        {sub && <span className="small block">{sub}</span>}
      </span>
      <b className={valueTone === 'auto' ? tone(value) : valueTone || ''}>{value}</b>
    </div>
  );
}
