// Gráficas ligeras (SVG/CSS) que consumen datos reales del backend.
// Una sola serie por gráfica → un solo tono azul (magnitud); el último punto se resalta.
import { useState } from 'react';
import { money, pct } from '../../utils/format.js';

/**
 * Barras verticales con tooltip al pasar el cursor.
 * data: [{ label, value, hint? }]
 */
export function BarChart({ data, height = 190, format = money, ariaLabel = 'Gráfica' }) {
  const [hover, setHover] = useState(null);
  if (!data.length) return <div className="chart-empty">Sin datos suficientes para graficar.</div>;
  const values = data.map((d) => Number(d.value) || 0);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const zero = (max / span) * 100; // posición de la línea base (% desde arriba)

  return (
    <figure className="chart" aria-label={ariaLabel}>
      <div className="bars" style={{ height }}>
        {min < 0 && <div className="bars-zero" style={{ top: `${zero}%` }} />}
        {data.map((d, i) => {
          const v = values[i];
          const h = (Math.abs(v) / span) * 100;
          const isLast = i === data.length - 1;
          return (
            <div
              key={d.label + i}
              className="bars-col"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              aria-label={`${d.label}: ${format(v)}`}
            >
              <div
                className={`bars-bar ${isLast ? 'current' : ''} ${v < 0 ? 'neg' : ''}`}
                style={v >= 0 ? { height: `${h}%`, bottom: `${100 - zero}%` } : { height: `${h}%`, top: `${zero}%` }}
              />
              {hover === i && (
                <div className="tooltip" role="tooltip">
                  <b>{d.label}</b>
                  <span>{format(v)}</span>
                  {d.hint && <span className="small">{d.hint}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="bars-axis">
        {data.map((d, i) => <span key={d.label + i}>{d.label}</span>)}
      </div>
    </figure>
  );
}

/**
 * Distribución horizontal (estilo Allocation del HTML de referencia).
 * items: [{ key, label, value, share }]
 */
export function DistributionBars({ items, emptyText = 'Sin datos para mostrar la distribución.' }) {
  if (!items.length) return <div className="chart-empty">{emptyText}</div>;
  return (
    <div className="dist">
      {items.map((it) => (
        <div className="dist-item" key={it.key} title={`${it.label}: ${money(it.value)} · ${pct(it.share)}`}>
          <div className="row">
            <span>{it.label}</span>
            <span className="dist-values">
              <span className="small">{money(it.value)}</span>
              <b>{pct(it.share)}</b>
            </span>
          </div>
          <div className="progress"><div className="bar" style={{ width: `${Math.max(0, Math.min(100, it.share))}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
