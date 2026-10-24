import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';
import { date } from '../../../utils/format.js';
import { Button } from '../../../components/ui/Button.jsx';
import { FormError } from '../../../components/ui/Form.jsx';
import { ErrorState, Loading } from '../../../components/ui/States.jsx';
import { ModuleLayout } from '../../../features/academy/ModuleLayout.jsx';
import { modulePath, useAcademy } from '../../../features/academy/useAcademy.js';
import { tr } from '../../../i18n/tr.js';

const QUESTIONS = [
  { id: 'q1', group: 'A · Conceptos básicos de trading', text: '¿Qué significa abrir una posición LONG?', options: [['1', 'Buscar beneficiarse de una subida del precio.'], ['0a', 'Buscar beneficiarse únicamente de una caída del precio.'], ['0b', 'Mantener el dinero fuera del mercado.']] },
  { id: 'q2', text: '¿Qué es el apalancamiento?', options: [['1', 'Permite controlar una exposición mayor utilizando una cantidad menor de margen.'], ['0a', 'Garantiza una mayor rentabilidad.'], ['0b', 'Elimina el riesgo de una operación.']] },
  { id: 'q3', text: '¿Qué representa el drawdown?', options: [['1', 'Una caída desde un máximo de referencia hasta un mínimo posterior.'], ['0a', 'La comisión que cobra un exchange.'], ['0b', 'El precio de entrada de una operación.']] },
  { id: 'q4', group: 'B · Manejo básico de un exchange', text: '¿Sabes localizar en un exchange un mercado de futuros o derivados y distinguirlo del mercado spot?', options: [['1', 'Sí, sé identificar la diferencia y dónde se encuentra.'], ['0a', 'No, todavía no sé hacerlo.']] },
  { id: 'q5', text: '¿Sabes qué significan conceptos como margen, posición, precio de entrada y precio de liquidación?', options: [['1', 'Sí, conozco su significado básico.'], ['0a', 'Conozco algunos, pero no sé realmente cómo funcionan.']] },
  { id: 'q6', text: '¿Has utilizado al menos las funciones básicas de un exchange, como consultar saldo, abrir/cerrar una posición o revisar una operación?', options: [['1', 'Sí, sé realizar o identificar esas funciones básicas.'], ['0a', 'No, nunca las he utilizado.']] },
];

export default function MarketFilterPage() {
  const { api, basePath, canEdit } = useWorkspace();
  const overview = useAcademy();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [state, setState] = useState({ busy: false, error: null });

  if (overview.loading && !overview.data) return <Loading />;
  if (overview.error) return <ErrorState error={overview.error} onRetry={overview.reload} />;
  const a = overview.data;
  const complete = QUESTIONS.every((q) => answers[q.id]);

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: null });
    try {
      const payload = Object.fromEntries(QUESTIONS.map((q) => [q.id, answers[q.id] === '1' ? 1 : 0]));
      setResult(await api.post('/academy/market-filter', { answers: payload }));
      await overview.reload();
      setState({ busy: false, error: null });
    } catch (error) {
      setState({ busy: false, error });
    }
  };

  return (
    <ModuleLayout overview={a} kicker={tr('Ruta de Mercados')} title={tr('¿Estás preparado para la Ruta de Mercados?')} subtitle="No evaluamos si eres rentable ni si sabes desarrollar estrategias; únicamente si tienes la base para comprender los Módulos 4–6.">
      {a.filter.passed && !result && (
        <div className="filter-result is-pass">
          <b>✓ Filtro aprobado{a.filter.last ? ` el ${date(a.filter.last.createdAt)}` : ''}.</b>
          <span>{tr('Tienes la base necesaria para continuar con la Ruta de Mercados.')}</span>
          <Link className="btn-primary" to={modulePath(basePath, 4)}>{tr('Ir al Módulo 4 →')}</Link>
        </div>
      )}
      <form className="filter-form" onSubmit={submit}>
        {QUESTIONS.map((q, i) => (
          <fieldset key={q.id} className="filter-q">
            {q.group && <div className="filter-group">{tr(q.group)}</div>}
            <legend><span>{i + 1}.</span> {tr(q.text)}</legend>
            <div className="filter-options">
              {q.options.map(([value, label]) => (
                <label key={value} className={answers[q.id] === value ? 'is-selected' : ''}>
                  <input type="radio" name={q.id} value={value} checked={answers[q.id] === value} onChange={() => setAnswers({ ...answers, [q.id]: value })} disabled={!canEdit} />
                  <span>{tr(label)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <FormError error={state.error} />
        {canEdit && <Button type="submit" disabled={!complete} loading={state.busy}>{complete ? tr('Evaluar conocimientos →') : tr('Responde las 6 preguntas')}</Button>}
      </form>
      {result && (
        <div className={`filter-result ${result.passed ? 'is-pass' : 'is-fail'}`} role="status">
          {result.passed ? (
            <>
              <b>{tr('✓ Filtro aprobado.')}</b>
              <span>{tr('Tienes la base necesaria para continuar con la Ruta de Mercados. Trading')}{' '}{result.tradingScore}/3 · Exchange {result.exchangeScore}/3.</span>
              <Link className="btn-primary" to={modulePath(basePath, 4)}>{tr('Comenzar Módulo 4 →')}</Link>
            </>
          ) : (
            <>
              <b>{tr('⚠ Antes de continuar, te recomendamos reforzar los conceptos básicos.')}</b>
              <span>{tr('Los Módulos 4–6 utilizan conceptos operativos. No necesitas ser profesional, pero sí comprender cómo funciona un exchange y los fundamentos del trading. Puedes continuar con la educación patrimonial (Módulos 7–12) y volver a esta ruta cuando tengas la base necesaria.')}</span>
              <div className="form-actions">
                <Button variant="secondary" onClick={() => { setResult(null); setAnswers({}); }}>{tr('Intentar de nuevo')}</Button>
                <Link className="btn-secondary" to={`${basePath}/academia/ruta`}>{tr('Ver rutas')}</Link>
              </div>
            </>
          )}
        </div>
      )}
    </ModuleLayout>
  );
}
