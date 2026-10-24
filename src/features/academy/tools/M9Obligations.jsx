import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { money, pct } from '../../../utils/format.js';
import { DEBT_TYPES, options } from '../../../utils/labels.js';
import { Button } from '../../../components/ui/Button.jsx';
import { DataTable } from '../../../components/ui/DataTable.jsx';
import { Field, FormError, Input, MoneyInput, Select } from '../../../components/ui/Form.jsx';
import { ConfirmDialog, Modal } from '../../../components/ui/Modal.jsx';
import { Pill, ProgressBar } from '../../../components/ui/Card.jsx';
import { ErrorState } from '../../../components/ui/States.jsx';
import { ExplainRows, KindBadge, MetricCard, MetricGrid, RiskNote, SaveStatus, ToolCard, ToolSkeleton } from '../ResultParts.jsx';
import { useAction } from '../useAction.js';
import { tr } from '../../../i18n/tr.js';

const EMPTY = { name: '', type: 'TARJETA_CREDITO', balance: '', annualRate: '', payment: '', fees: '' };
const toForm = (d) => ({ name: d.name, type: d.type, balance: d.balance, annualRate: d.annualRate ?? '', payment: d.payment, fees: d.fees });
const toBody = (f) => ({ ...f, balance: Number(f.balance || 0), payment: Number(f.payment || 0), fees: Number(f.fees || 0), annualRate: f.annualRate === '' ? null : Number(f.annualRate) });

function ratioText(ratio) {
  if (ratio === null) return tr('Registra ingresos del periodo en Ingresos y gastos para calcular la proporción.');
  if (ratio <= 10) return tr('Los pagos registrados representan una proporción baja del ingreso declarado según este indicador ilustrativo.');
  if (ratio <= 25) return tr('Los pagos registrados representan una proporción moderada del ingreso declarado según este indicador ilustrativo.');
  return tr('Los pagos registrados representan una proporción elevada del ingreso declarado según este indicador ilustrativo.');
}

function DebtForm({ initial, onSubmit, onCancel, busy, error, disabled }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); onSubmit(toBody(f)); }}>
      <div className="form-grid cols-3">
        <Field label={tr('Nombre / entidad')}><Input required maxLength={200} value={f.name} onChange={set('name')} placeholder={tr('Ej. Crédito automotriz')} disabled={disabled} /></Field>
        <Field label={tr('Tipo de obligación')}><Select value={f.type} onChange={set('type')} options={options.debtTypes} disabled={disabled} /></Field>
        <Field label={tr('Saldo pendiente')}><MoneyInput required value={f.balance} onChange={set('balance')} placeholder="0" disabled={disabled} /></Field>
        <Field label="Tasa anual (%)" hint={tr('Déjala vacía si no la conoces: se mostrará como tasa pendiente, no como 0%.')}>
          <input className="input" type="number" inputMode="decimal" min="0" max="1000" step="0.01" value={f.annualRate} onChange={set('annualRate')} placeholder={tr('Si se conoce')} disabled={disabled} />
        </Field>
        <Field label={tr('Pago mensual planeado')}><MoneyInput required value={f.payment} onChange={set('payment')} placeholder="0" disabled={disabled} /></Field>
        <Field label={tr('Cargos mensuales')}><MoneyInput value={f.fees} onChange={set('fees')} placeholder="0" disabled={disabled} /></Field>
      </div>
      <FormError error={error} />
      <div className="form-actions">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>{tr('Cancelar')}</Button>}
        <Button type="submit" loading={busy} disabled={disabled}>{onCancel ? tr('Guardar cambios') : tr('Registrar obligación')}</Button>
      </div>
    </form>
  );
}

function PaymentModal({ debt, onClose, onDone }) {
  const { api } = useWorkspace();
  const action = useAction();
  const [f, setF] = useState({ amount: String(debt.payment || ''), newBalance: '' });
  const submit = async () => {
    const body = { amount: Number(f.amount), newBalance: f.newBalance === '' ? null : Number(f.newBalance) };
    if (await action.run(() => api.post(`/academy/obligations/${debt.balanceId}/payments`, body))) onDone();
  };
  return (
    <Modal
      open
      title={`Confirmar pago · ${debt.name}`}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>{tr('Cancelar')}</Button><Button loading={action.busy} onClick={submit} disabled={!Number(f.amount)}>{tr('Confirmar pago real')}</Button></>}
    >
      <div className="stack">
        <p className="muted small">{tr('Se registrará un gasto real de la categoría Deudas en Ingresos y gastos. El saldo solo cambia si capturas el saldo de tu estado de cuenta.')}</p>
        <Field label={tr('Importe pagado')}><MoneyInput required min="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Nuevo saldo según tu estado de cuenta (opcional)" hint={`Saldo actual: ${money(debt.balance)}`}>
          <MoneyInput value={f.newBalance} onChange={(e) => setF({ ...f, newBalance: e.target.value })} placeholder={tr('Sin cambio')} />
        </Field>
        <FormError error={action.error} />
      </div>
    </Modal>
  );
}

export function M9Obligations({ onSaved }) {
  const { api, canEdit, basePath } = useWorkspace();
  const res = useAsync(() => api.get('/academy/obligations'), [api]);
  const action = useAction();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [paying, setPaying] = useState(null);
  const [formKey, setFormKey] = useState(0);

  if (res.loading && !res.data) return <ToolSkeleton />;
  if (res.error) return <ErrorState error={res.error} onRetry={res.reload} />;
  const { items, totals, period } = res.data;
  const closed = period?.status === 'CLOSED';
  const editable = canEdit && !closed;

  const refresh = async () => {
    await res.reload();
    onSaved?.();
  };
  const create = async (body) => {
    if (await action.run(() => api.post('/academy/obligations', body))) {
      setFormKey((k) => k + 1);
      await refresh();
    }
  };
  const update = async (body) => {
    if (await action.run(() => api.put(`/academy/obligations/${editing.balanceId}`, body))) {
      setEditing(null);
      await refresh();
    }
  };
  const remove = async () => {
    if (await action.run(() => api.del(`/academy/obligations/${removing.balanceId}`))) {
      setRemoving(null);
      await refresh();
    }
  };

  return (
    <div className="tool">
      {totals && (
        <MetricGrid>
          <MetricCard label={tr('Saldo total de obligaciones')} value={money(totals.balance)} hint={tr('{n} obligaciones · pasivo en Patrimonio', { n: totals.count })} />
          <MetricCard label={tr('Pagos mensuales planeados')} value={money(totals.payments)} hint={tr('Plan: no reduce el saldo')} />
          <MetricCard label={tr('Intereses mensuales estimados')} value={money(totals.interest)} tone={totals.incomplete ? 'warn' : ''} hint={totals.incomplete ? tr('Incompleto: hay tasas pendientes') : tr('Saldo × tasa anual / 12')} />
          <MetricCard label={tr('Pagos / ingreso mensual')} value={pct(totals.paymentToIncome)} hint={totals.paymentToIncome === null ? tr('N/D · sin ingreso registrado') : tr('Indicador descriptivo')} />
        </MetricGrid>
      )}

      {editable && (
        <ToolCard step="1" title={tr('Registrar obligación')} description={tr('Se guarda como deuda real: aparece en Patrimonio como pasivo, sin duplicarse.')} aside={<KindBadge kind="REAL" />}>
          <DebtForm key={formKey} initial={EMPTY} onSubmit={create} busy={action.busy && !editing} error={!editing && !removing ? action.error : null} />
        </ToolCard>
      )}

      <ToolCard step="2" title={tr('Obligaciones registradas')} description={tr('Los intereses, el costo y la aportación a capital son estimaciones educativas.')} aside={<KindBadge kind="ESTIMATE" />}>
        <DataTable
          rowKey="balanceId"
          rows={items}
          empty={tr('No hay obligaciones registradas. Agrega una para comenzar.')}
          columns={[
            { key: 'name', label: 'Obligación', render: (d) => <><b>{tr(d.name)}</b><span className="small block">{tr(DEBT_TYPES[d.type])}</span></> },
            { key: 'balance', label: tr('Saldo'), align: 'right', render: (d) => money(d.balance) },
            { key: 'annualRate', label: tr('Tasa anual'), align: 'right', render: (d) => (d.rateKnown ? pct(d.annualRate) : <Pill variant="warn">{tr('Tasa pendiente')}</Pill>) },
            { key: 'payment', label: tr('Pago planeado'), align: 'right', render: (d) => money(d.payment) },
            { key: 'monthlyInterest', label: tr('Interés est.'), align: 'right', render: (d) => (d.monthlyInterest === null ? 'Incompleto' : money(d.monthlyInterest)) },
            { key: 'monthlyCost', label: tr('Interés + cargos'), align: 'right', render: (d) => money(d.monthlyCost) },
            { key: 'principalContribution', label: tr('Aporte est. a capital'), align: 'right', render: (d) => <span className={d.paymentBelowCost ? 'down' : ''}>{money(d.principalContribution)}</span> },
            ...(editable ? [{
              key: 'x', label: tr('Acciones'), align: 'right', render: (d) => (
                <div className="row-actions">
                  <button type="button" className="btn-link" onClick={() => setPaying(d)}>{tr('Confirmar pago')}</button>
                  <button type="button" className="btn-link" onClick={() => setEditing(d)}>{tr('Editar')}</button>
                  <button type="button" className="btn-link danger" onClick={() => setRemoving(d)}>{tr('Eliminar')}</button>
                </div>
              ),
            }] : []),
          ]}
        />
        {items.some((d) => d.paymentBelowCost) && (
          <RiskNote>{tr('Bajo los supuestos introducidos, al menos un pago planeado podría no cubrir el costo mensual estimado (intereses + cargos). La deuda podría no disminuir.')}</RiskNote>
        )}
        {closed && <p className="small muted">{tr('El periodo actual está cerrado. Abre el siguiente periodo para registrar cambios.')}</p>}
      </ToolCard>

      {editing && (
        <ToolCard title={tr('Editar · {title}', { title: editing.name })}>
          <DebtForm initial={toForm(editing)} onSubmit={update} onCancel={() => setEditing(null)} busy={action.busy} error={action.error} />
        </ToolCard>
      )}

      {totals && (
        <div className="split-panel">
          <ToolCard title={tr('Resumen global de obligaciones')}>
            <ExplainRows
              title={tr('Costo del dinero')}
              rows={[
                ['Número de obligaciones', totals.count],
                ['Saldo total pendiente', money(totals.balance)],
                ['Intereses estimados', money(totals.interest)],
                ['Cargos mensuales', money(totals.fees)],
                ['Intereses + cargos', money(totals.cost)],
                ['Pago mensual planeado', money(totals.payments)],
              ]}
              final={{ label: tr('Aportación estimada a capital'), value: money(totals.principalContribution), tone: totals.principalContribution < 0 ? 'down' : 'up' }}
            />
            <p className="small muted">{tr('Es una aproximación: no actualiza el saldo real sin un desglose confirmado del acreedor.')}</p>
          </ToolCard>
          <ToolCard title={tr('Comparación con tus ingresos')}>
            <div className="source-line"><span>{tr('Ingreso mensual neto · Ingresos y gastos')}</span><b>{money(totals.income)}</b></div>
            <ProgressBar value={Math.min(100, totals.paymentToIncome || 0)} label={tr('Pagos sobre ingreso')} />
            <p className="small">{ratioText(totals.paymentToIncome)}</p>
            <p className="small muted">{tr('No es una calificación crediticia ni una recomendación. Para ajustar el ingreso registra tus movimientos en')}{' '}<Link to={`${basePath}/ingresos-gastos`}>{tr('Ingresos y gastos')}</Link>.</p>
          </ToolCard>
        </div>
      )}

      <RiskNote>{tr('La fórmula de interés es simplificada y no necesariamente coincide con tu estado de cuenta. Registrar una deuda no es registrar un gasto y planear un pago no reduce el saldo: solo los pagos confirmados se registran como movimientos reales.')}</RiskNote>
      <SaveStatus action={action} />

      {paying && <PaymentModal debt={paying} onClose={() => setPaying(null)} onDone={async () => { setPaying(null); await refresh(); }} />}
      <ConfirmDialog
        open={!!removing}
        title={`Eliminar ${removing?.name || ''}`}
        message={tr('La obligación se quitará del periodo actual y de tu patrimonio. Los pagos ya registrados en Ingresos y gastos se conservan.')}
        danger
        confirmLabel={tr('Eliminar')}
        loading={action.busy}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      >
        <FormError error={removing ? action.error : null} />
      </ConfirmDialog>
    </div>
  );
}
