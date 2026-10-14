import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BUDGET_CATEGORIES, BUDGET_EXPENSE_CATEGORIES, budgetView } from '@shared/patrimonial.js';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { money, pct, periodLabel, signedMoney } from '../../../utils/format.js';
import { BUDGET_LABELS } from '../../../utils/labels.js';
import { Button } from '../../../components/ui/Button.jsx';
import { DataTable } from '../../../components/ui/DataTable.jsx';
import { Field, FormError, Input, MoneyInput, Select } from '../../../components/ui/Form.jsx';
import { Notice, ProgressBar } from '../../../components/ui/Card.jsx';
import { ErrorState } from '../../../components/ui/States.jsx';
import { KindBadge, MetricCard, MetricGrid, RiskNote, SaveStatus, ToolCard, ToolSkeleton } from '../ResultParts.jsx';
import { useAction } from '../useAction.js';

const STATUS = {
  OVER: ['Superó el plan', 'bad'],
  WITHIN: ['Dentro del plan', 'good'],
  MET: ['Objetivo cumplido', 'good'],
  PENDING: ['Objetivo pendiente', 'warn'],
};
const pad = (n) => String(n).padStart(2, '0');
const toInput = ({ year, month }) => `${year}-${pad(month)}`;
const fromInput = (v) => {
  const [year, month] = v.split('-').map(Number);
  return { year, month };
};
const today = () => ({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
const ACTUAL_OPTIONS = [...BUDGET_EXPENSE_CATEGORIES, 'AHORRO'].map((c) => ({ value: c, label: BUDGET_LABELS[c] }));

function differenceText(row) {
  if (row.kind === 'TARGET') return row.difference > 0 ? `Faltan ${money(row.difference)}` : `Cumplido (+${money(Math.abs(row.difference))})`;
  return row.difference < 0 ? `${signedMoney(row.difference)} sobre el límite` : `${signedMoney(row.difference)} disponibles`;
}

function RealMovementForm({ month, onRecorded, disabled }) {
  const { api } = useWorkspace();
  const action = useAction();
  const [f, setF] = useState({ category: 'VIVIENDA', amount: '', description: '' });
  const submit = async (e) => {
    e.preventDefault();
    const ok = await action.run(() => api.post('/academy/budget/actuals', { ...month, ...f }));
    if (ok) {
      setF({ ...f, amount: '', description: '' });
      onRecorded();
    }
  };
  return (
    <form className="stack" onSubmit={submit}>
      <div className="inline-form">
        <Field label="Categoría"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} options={ACTUAL_OPTIONS} disabled={disabled} /></Field>
        <Field label="Importe real"><MoneyInput required min="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} disabled={disabled} /></Field>
        <Field label="Concepto"><Input required maxLength={200} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Ej. Renta de octubre" disabled={disabled} /></Field>
        <Button type="submit" loading={action.busy} disabled={disabled}>Registrar movimiento real</Button>
      </div>
      <FormError error={action.error} />
      <SaveStatus action={action} savedText="Movimiento registrado una sola vez en tu información real." />
    </form>
  );
}

function BudgetEditor({ data, reload, onSaved }) {
  const { api, canEdit, basePath } = useWorkspace();
  const action = useAction();
  const [netIncome, setNetIncome] = useState(String(data.netIncome || ''));
  const [lines, setLines] = useState(data.lines.map((l) => ({ ...l, percent: String(l.percent) })));
  const [extra, setExtra] = useState('');
  const view = useMemo(() => budgetView({ netIncome, lines, actuals: data.actuals }), [netIncome, lines, data.actuals]);
  const month = { year: data.year, month: data.month };
  const closed = data.period?.status === 'CLOSED';
  const editable = canEdit && !closed;
  const available = BUDGET_CATEGORIES.filter((c) => !lines.some((l) => l.category === c));
  const setPercent = (category, percent) => setLines(lines.map((l) => (l.category === category ? { ...l, percent } : l)));

  const save = async () => {
    const ok = await action.run(() => api.put('/academy/budget', { ...month, netIncome: Number(netIncome || 0), lines: lines.map((l) => ({ category: l.category, percent: Number(l.percent || 0) })) }));
    if (ok) {
      await reload();
      onSaved?.();
    }
  };

  return (
    <>
      <ToolCard step="2" title="Ingreso y resumen del mes" description="El resumen compara tu plan con los importes reales del mismo mes." aside={<div className="badge-row"><KindBadge kind="PLAN" /><KindBadge kind="REAL" /></div>}>
        <div className="form-grid cols-2">
          <Field label="Ingreso mensual neto" hint={`Ingreso real registrado en ${periodLabel(month)}: ${money(data.realIncome)}`}>
            <MoneyInput value={netIncome} onChange={(e) => setNetIncome(e.target.value)} disabled={!editable} placeholder="0" />
          </Field>
          {data.realIncome > 0 && Number(netIncome) !== data.realIncome && editable && (
            <div className="field"><span className="field-label">&nbsp;</span><Button type="button" variant="secondary" onClick={() => setNetIncome(String(data.realIncome))}>Usar ingreso registrado</Button></div>
          )}
        </div>
        <MetricGrid>
          <MetricCard label="Gastos planeados" value={money(view.expensesPlanned)} hint={`Gastos reales: ${money(view.expensesActual)}`} />
          <MetricCard label="Diferencia frente al plan" value={signedMoney(view.expenseDifference)} tone={view.expenseDifference < 0 ? 'bad' : 'good'} hint={view.expenseDifference < 0 ? 'Gasto real por encima del plan' : 'Gasto real dentro del plan'} />
          <MetricCard label="Saldo estimado" value={money(view.estimatedBalance)} hint="Ingreso − importes reales registrados" explanation="Es una estimación: no equivale a tu saldo bancario ni a tu patrimonio neto." />
          <MetricCard label="Ahorro planeado" value={money(view.savingsPlanned)} hint={`Real confirmado: ${money(view.savingsActual)}`} tone={view.savingsActual >= view.savingsPlanned && view.savingsPlanned > 0 ? 'good' : ''} />
          <MetricCard label="Inversión planeada" value={money(view.investmentPlanned)} hint={`Real confirmada: ${money(view.investmentActual)}`} tone={view.investmentActual >= view.investmentPlanned && view.investmentPlanned > 0 ? 'good' : ''} />
          <MetricCard label="Total distribuido" value={money(view.totalPlanned)} hint={`${pct(view.percentTotal)} del ingreso`} />
        </MetricGrid>
        {view.unbudgetedExpenses > 0 && (
          <RiskNote>Tienes {money(view.unbudgetedExpenses)} en gastos reales de categorías que no incluiste en el presupuesto. Agrégalas abajo para controlarlas.</RiskNote>
        )}
      </ToolCard>

      <ToolCard step="3" title="Distribución del presupuesto" description="Ajusta los porcentajes. Los importes planeados se calculan con tu ingreso; los reales provienen de Ingresos y gastos.">
        <DataTable
          rowKey="category"
          rows={view.rows}
          columns={[
            { key: 'category', label: 'Categoría', render: (r) => <b>{BUDGET_LABELS[r.category]}</b> },
            {
              key: 'percent', label: '% planeado', align: 'right', render: (r) => (
                <input
                  className="input pct-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.01"
                  aria-label={`Porcentaje de ${BUDGET_LABELS[r.category]}`}
                  value={lines.find((l) => l.category === r.category).percent}
                  onChange={(e) => setPercent(r.category, e.target.value)}
                  disabled={!editable}
                />
              ),
            },
            { key: 'planned', label: 'Planeado', align: 'right', render: (r) => money(r.planned) },
            { key: 'actual', label: 'Real', align: 'right', render: (r) => money(r.actual) },
            { key: 'difference', label: 'Diferencia', align: 'right', render: (r) => <span className={r.kind === 'EXPENSE' ? (r.difference < 0 ? 'down' : 'up') : ''}>{differenceText(r)}</span> },
            { key: 'status', label: 'Estado', render: (r) => <span className={`status-chip tone-${STATUS[r.status][1]}`}>{STATUS[r.status][0]}</span> },
            ...(editable ? [{ key: 'x', label: '', align: 'right', render: (r) => <button type="button" className="btn-link danger" onClick={() => setLines(lines.filter((l) => l.category !== r.category))} aria-label={`Quitar ${BUDGET_LABELS[r.category]}`}>Quitar</button> }] : []),
          ]}
        />
        <div className="budget-total">
          <ProgressBar value={Math.min(100, view.percentTotal)} label="Total de porcentajes planeados" />
          <b className={view.complete ? '' : 'is-off'}>{pct(view.percentTotal)}</b>
          {!view.complete && <span className="warn-text small">{view.percentGap > 0 ? `Faltan ${pct(view.percentGap)}` : `Sobran ${pct(Math.abs(view.percentGap))}`} para una distribución completa</span>}
        </div>
        {editable && available.length > 0 && (
          <div className="inline-form">
            <Field label="Agregar categoría"><Select value={extra} onChange={(e) => setExtra(e.target.value)} options={available.map((c) => ({ value: c, label: BUDGET_LABELS[c] }))} placeholder="Selecciona" /></Field>
            <Button type="button" variant="secondary" disabled={!extra} onClick={() => { setLines([...lines, { category: extra, percent: '0' }]); setExtra(''); }}>Agregar</Button>
          </div>
        )}
        <RiskNote>Los porcentajes iniciales son un ejemplo educativo editable, no una regla universal. El ahorro y la inversión planeados son objetivos: no crean ahorro acumulado ni activos.</RiskNote>
        <FormError error={action.error} />
        {editable && (
          <div className="form-actions">
            <SaveStatus action={action} savedText="Presupuesto guardado para este mes." />
            <Button onClick={save} loading={action.busy} disabled={!view.complete}>{data.saved ? 'Actualizar presupuesto' : 'Guardar presupuesto'}</Button>
          </div>
        )}
        {closed && <Notice variant="gold">Este mes tiene un corte cerrado: el presupuesto se conserva en el historial y no se modifica.</Notice>}
      </ToolCard>

      <ToolCard step="4" title="Registrar un movimiento real" description="Si un gasto o ahorro aún no está en Ingresos y gastos, regístralo aquí: se guarda una sola vez en tu información real." aside={<KindBadge kind="REAL" />}>
        {data.period ? (
          <RealMovementForm month={month} onRecorded={reload} disabled={!editable} />
        ) : (
          <p className="empty-inline">Este mes aún no tiene periodo en <Link to={`${basePath}/ingresos-gastos`}>Ingresos y gastos</Link>. Crea el periodo para registrar movimientos reales.</p>
        )}
        <p className="small muted">Las aportaciones reales a inversiones se registran en <Link to={`${basePath}/movimientos`}>Movimientos</Link> para mantener conciliada Mi cartera.</p>
      </ToolCard>
    </>
  );
}

export function M7Budget({ onSaved }) {
  const { api, period } = useWorkspace();
  const [month, setMonth] = useState(() => (period ? { year: period.year, month: period.month } : today()));
  const res = useAsync(() => api.get(`/academy/budget?year=${month.year}&month=${month.month}`), [api, month.year, month.month]);

  return (
    <div className="tool">
      <ToolCard step="1" title="Define tu mes" description="Cada presupuesto pertenece a un mes. Si ya existe, se carga para editarlo.">
        <div className="form-grid cols-2">
          <Field label="Mes del presupuesto">
            <Input type="month" required value={toInput(month)} onChange={(e) => e.target.value && setMonth(fromInput(e.target.value))} />
          </Field>
          {res.data && (
            <div className="source-line">
              <span>{res.data.saved ? 'Presupuesto guardado' : 'Sin presupuesto guardado: distribución inicial editable'}</span>
              <b>{periodLabel(month)}</b>
            </div>
          )}
        </div>
      </ToolCard>
      {res.loading && !res.data && <ToolSkeleton />}
      {res.error && <ErrorState error={res.error} onRetry={res.reload} />}
      {res.data && !res.error && (
        <BudgetEditor key={`${toInput(month)}-${res.data.updatedAt || 'new'}`} data={res.data} reload={res.reload} onSaved={onSaved} />
      )}
    </div>
  );
}
