import { money, pct } from '../../utils/format.js';

const READING_TONE = { EQUILIBRADA: 'good', MODERADA: 'info', CONCENTRADA: 'warn', MUY_CONCENTRADA: 'bad' };

const PARTS = [
  ['diversification', 'Diversificación por categorías', '30%'],
  ['concentration', 'Concentración de la categoría principal', '30%'],
  ['highRisk', 'Exposición a alto riesgo', '20%'],
  ['liquidity', 'Liquidez', '10%'],
  ['categories', 'Número de categorías', '10%'],
];

export function AllocationBars({ allocation, format = money }) {
  return (
    <div className="alloc-bars">
      {allocation.shares.map((s) => (
        <div key={s.key} className={`alloc-row ${s.amount > 0 ? '' : 'is-empty'}`}>
          <div className="alloc-row-head"><span>{s.label}</span><b>{pct(s.share)}</b></div>
          <div className="alloc-track"><span style={{ width: `${s.share}%` }} /></div>
          <small>{format(s.amount)}</small>
        </div>
      ))}
    </div>
  );
}

export function ReadingCard({ reading }) {
  if (!reading) return <div className="reading is-empty">Registra productos para obtener la lectura educativa.</div>;
  return (
    <div className={`reading tone-${READING_TONE[reading.key]}`}>
      <div className="reading-head">
        <span>Lectura educativa</span>
        <strong>{reading.label}</strong>
        <em>{reading.score} / 100</em>
      </div>
      <ul className="reading-parts">
        {PARTS.map(([key, label, weight]) => (
          <li key={key}>
            <span>{label} <small>({weight})</small></span>
            <span className="reading-meter"><span style={{ width: `${reading.parts[key]}%` }} /></span>
            <b>{reading.parts[key]}</b>
          </li>
        ))}
      </ul>
      <p className="reading-note">
        “Equilibrada” no significa cartera recomendada, segura ni correcta. Significa únicamente que la estructura presenta una distribución
        relativamente diversificada y sin una concentración dominante según los parámetros educativos definidos por QLC.
      </p>
    </div>
  );
}
