import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { date, money, pct, signedMoney, toDateInput } from '../../utils/format.js';
import { Card, Notice, PageHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog, Modal } from '../../components/ui/Modal.jsx';
import { AsyncView, Empty } from '../../components/ui/States.jsx';
import { ClosedNotice, ReconciliationBanner, Roi } from '../../components/finance/Finance.jsx';
import { Field, FormError, Input, MoneyInput } from '../../components/ui/Form.jsx';
import { RecordForm } from '../../features/records/RecordManager.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';
import { tr } from '../../i18n/tr.js';

const Totals = ({ initial, final, result, roi, title, labels = ['Capital inicial', 'Capital final', 'Resultado', 'ROI'] }) => (
  <div className="totals">
    {title && <div className="totals-title">{title}</div>}
    <div className="total"><span>{tr(labels[0])}</span><strong>{money(initial)}</strong></div>
    <div className="total"><span>{tr(labels[1])}</span><strong>{money(final)}</strong></div>
    <div className="total"><span>{tr(labels[2])}</span><strong className={result > 0 ? 'up' : result < 0 ? 'down' : ''}>{signedMoney(result)}</strong></div>
    <div className="total"><span>{tr(labels[3])}</span><strong><Roi value={roi} /></strong></div>
  </div>
);

function productFields(categories) {
  return [
    { name: 'categoryCode', label: tr('Categoría'), type: 'select', options: categories.map((c) => ({ value: c.code, label: c.name })), display: (v) => categories.find((c) => c.code === v)?.name || v },
    { name: 'name', label: tr('Producto'), maxLength: 200 },
    { name: 'institution', label: 'Institución (opcional)', required: false, maxLength: 120 },
    { name: 'initialCapital', label: tr('Capital inicial'), type: 'money', display: money, hint: tr('Incluye aportaciones y retiros del periodo en este producto.') },
    {
      name: 'finalCapital', label: tr('Capital final'), type: 'money', display: money,
      compute: (v) => (auto(v) ? Number(v.initialCapital || 0) + appliedIncome(v) : null),
      hint: (v) => {
        if (!auto(v)) return null;
        if (Number(v.incomeApplied || 0) > 0) return tr('Se calcula solo: ya incluye la rentabilidad de este mes.');
        const income = v.incomeType === 'PERCENT' ? (Number(v.initialCapital || 0) * Number(v.incomeValue || 0)) / 100 : Number(v.incomeValue || 0);
        return income > 0 && v.incomeDay
          ? tr('Se calcula solo: el día {day} el sistema suma {income} y quedará en {total}.', { day: v.incomeDay, income: money(income), total: money(Number(v.initialCapital || 0) + income) })
          : tr('Se calcula solo: capital inicial + la rentabilidad del mes, que el sistema suma el día que indicaste.');
      },
    },
    {
      name: 'incomeType', label: tr('Rentabilidad mensual'), type: 'select', default: 'MANUAL',
      options: Object.entries(INCOME_MODES).map(([value, label]) => ({ value, label: tr(label) })), display: (v) => tr(INCOME_MODES[v] || INCOME_MODES.MANUAL),
      hint: tr('Manual: tú escribes el capital final y registras la rentabilidad cuando la recibes. Automática: el sistema la suma cada mes a tu capital final en el día indicado.'),
    },
    { name: 'incomeValue', label: tr('Monto o % mensual'), type: 'number', step: 'any', min: 0, when: auto, hint: tr('Ej. 12000 de renta, o 0.85 si es % mensual.') },
    { name: 'incomeDay', label: tr('Día del mes en que la recibes'), type: 'number', step: 1, min: 1, max: 31, when: auto, hint: tr('Del 1 al 31. Ese día el sistema hace la suma. Si el mes es más corto se usa su último día.') },
    {
      name: 'incomeTerm', label: tr('Plazo'), type: 'select', required: false, when: auto,
      options: INCOME_TERMS.map((m) => ({ value: String(m), label: termLabel(m) })), display: (v) => (v ? termLabel(Number(v)) : tr('Sin plazo')),
      hint: tr('Durante cuántos meses se suma, contando desde el mes actual. Déjalo vacío si no tiene fecha de término.'),
    },
    { name: 'notes', label: tr('Notas'), type: 'textarea', required: false },
  ];
}

const INCOME_MODES = { MANUAL: 'Manual (la registro yo)', AMOUNT: 'Automática · monto fijo mensual', PERCENT: 'Automática · % mensual sobre el capital inicial' };
const INCOME_TERMS = [3, 6, 12];
const termLabel = (m) => (m === 12 ? tr('1 año') : tr('{n} meses', { n: m }));
const auto = (v) => v.incomeType === 'AMOUNT' || v.incomeType === 'PERCENT';
const appliedIncome = (v) => Number(v.incomeApplied || 0);
const incomeBody = (v) => ({
  ...v,
  incomeType: auto(v) ? v.incomeType : null,
  incomeValue: auto(v) && v.incomeValue !== '' ? Number(v.incomeValue) : null,
  incomeDay: auto(v) && v.incomeDay !== '' ? Number(v.incomeDay) : null,
  incomeTerm: auto(v) && v.incomeTerm ? Number(v.incomeTerm) : null,
});
const termEnd = (p) => {
  if (!p.incomeTerm || !p.incomeStart) return '';
  const start = new Date(p.incomeStart);
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + p.incomeTerm - 1, 1, 12));
  return tr(' · durante {term}, hasta {month}', { term: termLabel(p.incomeTerm), month: end.toLocaleDateString('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }) });
};
const lastDay = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const dueDate = (period, day) => `${period.year}-${String(period.month).padStart(2, '0')}-${String(Math.min(day || 1, lastDay(period.year, period.month))).padStart(2, '0')}`;

function incomeText(p) {
  if (p.incomeType === 'AMOUNT') return `${tr('{amount} cada mes, el día {day}', { amount: money(p.incomeValue), day: p.incomeDay })}${termEnd(p)}`;
  if (p.incomeType === 'PERCENT') return `${tr('{pct} mensual sobre el capital inicial, el día {day}', { pct: pct(p.incomeValue), day: p.incomeDay })}${termEnd(p)}`;
  return null;
}

function UnassignedContributions({ movements, products, onAssigned }) {
  const { api } = useWorkspace();
  const [target, setTarget] = useState({});
  const [state, setState] = useState({ busy: null, error: null });
  if (!movements.length) return null;
  const assign = async (m) => {
    setState({ busy: m.id, error: null });
    try {
      await api.post(`/portfolio/positions/${target[m.id]}/assign`, { movementId: m.id });
      setState({ busy: null, error: null });
      onAssigned();
    } catch (error) {
      setState({ busy: null, error });
    }
  };
  return (
    <Card title={tr('Inversión sin asignar')}>
      <p className="small muted">{tr('Registraste estas aportaciones (por ejemplo, la inversión real del presupuesto) pero aún no indicas en qué producto invertiste. Elige el producto para sumarla a su capital.')}</p>
      {movements.map((m) => (
        <div key={m.id} className="inline-form">
          <span><b>{money(m.amount)}</b> · {tr(m.description)}</span>
          <select className="input" value={target[m.id] || ''} onChange={(e) => setTarget({ ...target, [m.id]: e.target.value })} aria-label={tr('Producto de destino')}>
            <option value="">{tr('Selecciona el producto')}</option>
            {products.map((p) => <option key={p.positionId} value={p.positionId}>{p.name}</option>)}
          </select>
          <Button variant="secondary" disabled={!target[m.id]} loading={state.busy === m.id} onClick={() => assign(m)}>{tr('Asignar')}</Button>
        </div>
      ))}
      <FormError error={state.error} />
    </Card>
  );
}

function IncomeModal({ product, period, onClose, onSaved }) {
  const { api } = useWorkspace();
  const expected = product.incomeType === 'PERCENT' ? (product.initial * product.incomeValue) / 100 : product.incomeValue || '';
  const [f, setF] = useState({
    amount: String(product.incomeDate ? product.incomeAmount : expected ?? ''),
    date: product.incomeDate ? toDateInput(product.incomeDate) : dueDate(period, product.incomeDay || new Date().getDate()),
  });
  const [state, setState] = useState({ busy: false, error: null });
  const save = async (amount) => {
    setState({ busy: true, error: null });
    try {
      await api.put(`/portfolio/positions/${product.positionId}/income`, { amount: Number(amount || 0), date: `${f.date}T12:00:00Z` });
      onSaved();
    } catch (error) {
      setState({ busy: false, error });
    }
  };
  return (
    <Modal
      open
      title={tr('Rentabilidad del mes · {name}', { name: product.name })}
      onClose={onClose}
      footer={(
        <>
          {product.incomeAmount > 0 && <Button variant="secondary" onClick={() => save(0)} loading={state.busy}>{tr('Este mes no la recibí')}</Button>}
          <Button onClick={() => save(f.amount)} loading={state.busy}>{tr('Guardar')}</Button>
        </>
      )}
    >
      <div className="stack">
        <p className="small muted">{tr('Se suma a tu capital final de este periodo y actualiza el resultado, el ROI, tu portafolio total y el patrimonio en Inicio. Puedes corregirla o dejarla en 0 si este mes no la recibiste.')}</p>
        <Field label={tr('Monto recibido este mes')}><MoneyInput value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label={tr('Fecha en que la recibiste')}><Input type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} min={dueDate(period, 1)} max={dueDate(period, 31)} /></Field>
        <FormError error={state.error} />
      </div>
    </Modal>
  );
}

function ProductCard({ p, writable, onEdit, onDelete, onIncome, basePath }) {
  return (
    <div className="asset">
      <div className="asset-head">
        <div>
          <Link to={`${basePath}/cartera/${p.assetId}`} className="asset-name">{tr(p.name)}</Link>
          <div className="asset-type">{tr(p.categoryName)}{p.institution ? ` · ${p.institution}` : ''}</div>
        </div>
        {writable && (
          <div className="row-actions">
            <button className="btn-link" onClick={onEdit}>{tr('Editar')}</button>
            <button className="btn-remove" onClick={onDelete}>{tr('Quitar')}</button>
          </div>
        )}
      </div>
      <div className="asset-grid">
        <div className="total"><span>{tr('Capital inicial')}</span><strong>{money(p.initial)}</strong></div>
        <div className="total"><span>{tr('Capital final')}</span><strong>{money(p.final)}</strong></div>
        <div className="total"><span>{tr('Resultado del producto')}</span><strong className={p.result > 0 ? 'up' : p.result < 0 ? 'down' : ''}>{signedMoney(p.result)}</strong></div>
        <div className="total"><span>{tr('ROI del producto')}</span><strong><Roi value={p.roi} /></strong></div>
      </div>
      <div className="asset-income">
        {incomeText(p) && <span>{tr('Rentabilidad automática')}: <b>{incomeText(p)}</b></span>}
        <span>
          {p.incomeDate && p.incomeAmount === 0
            ? tr('Este mes no se recibió rentabilidad')
            : p.incomeDate
            ? tr('Este mes: +{amount} el {date}', { amount: money(p.incomeAmount), date: date(p.incomeDate) })
            : p.incomeType ? tr('Se sumará automáticamente el día {day}', { day: p.incomeDay }) : tr('Sin rentabilidad registrada este mes')}
        </span>
        {writable && <button className="btn-link" onClick={onIncome}>{p.incomeDate ? tr('Editar rentabilidad del mes') : tr('Registrar rentabilidad del mes')}</button>}
      </div>
    </div>
  );
}

function PortfolioBody({ summary, categories, reload }) {
  const { api, period, canEdit, basePath } = useWorkspace();
  const writable = canEdit && period.status === 'OPEN';
  const [form, setForm] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [income, setIncome] = useState(null);
  const { portfolio } = summary;
  const byCat = new Map(portfolio.categories.map((c) => [c.code, c]));
  const fields = productFields(categories);

  const toForm = (p) => ({
    categoryCode: p.categoryCode, name: p.name, institution: p.institution || '', notes: p.notes || '',
    initialCapital: p.initial, finalCapital: p.final,
    incomeType: p.incomeType || 'MANUAL', incomeValue: p.incomeValue ?? '', incomeDay: p.incomeDay ?? '', incomeTerm: p.incomeTerm ? String(p.incomeTerm) : '',
    incomeApplied: p.incomeDate ? p.incomeAmount : 0,
  });

  const save = async (values) => {
    const body = { ...incomeBody(values), periodId: period.id };
    if (!form.product) {
      await api.post('/portfolio/positions', body);
      setForm(null);
      return reload();
    }
    const before = toForm(form.product);
    const changes = fields
      .filter((f) => String(before[f.name] ?? '') !== String(values[f.name] ?? ''))
      .map((f) => ({ field: f.label, from: f.display ? f.display(before[f.name]) : before[f.name] || '—', to: f.display ? f.display(values[f.name]) : values[f.name] || '—' }));
    if (!changes.length) return setForm(null);
    setPending({ kind: 'update', product: form.product, body, changes });
  };

  const confirm = async () => {
    setBusy(true);
    try {
      if (pending.kind === 'update') await api.put(`/portfolio/positions/${pending.product.positionId}`, pending.body);
      else await api.del(`/portfolio/positions/${pending.product.positionId}`);
      setPending(null);
      setForm(null);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        kicker={tr('Mi portafolio de inversión · detalle por producto')}
        title={tr('Mis inversiones')}
        subtitle={tr('Producto individual → categoría → resultado → portafolio total')}
        actions={writable && <Button onClick={() => setForm({ product: null })}>{tr('+ Agregar producto')}</Button>}
      />
      <ClosedNotice />
      <ReconciliationBanner reconciliation={summary.reconciliation} compact={summary.reconciliation.reconciled} />
      {writable && <UnassignedContributions movements={summary.patrimony.unassignedMovements || []} products={portfolio.products} onAssigned={reload} />}

      {portfolio.products.length === 0 && (
        <Empty title={tr('Tu portafolio está vacía')} text={tr('Agrega tus productos (CETES, acciones, Casa A, Negocio A…) con su capital inicial y final del periodo.')}
          action={writable && <Button onClick={() => setForm({ product: null })}>{tr('Agregar primer producto')}</Button>} />
      )}

      {categories.filter((c) => byCat.has(c.code)).map((c) => {
        const cat = byCat.get(c.code);
        const items = portfolio.products.filter((p) => p.categoryCode === c.code);
        return (
          <Card key={c.code} title={c.name} actions={<span className="badge">{items.length} {tr(items.length === 1 ? 'producto' : 'productos')} · {pct(cat.share)}{' '}{tr('del portafolio')}</span>}>
            {items.map((p) => (
              <ProductCard key={p.positionId} p={p} basePath={basePath} writable={writable}
                onEdit={() => setForm({ product: p })} onDelete={() => setPending({ kind: 'delete', product: p })} onIncome={() => setIncome(p)} />
            ))}
            {writable && <Button variant="add" onClick={() => setForm({ product: null, categoryCode: c.code })}>{tr('+ Agregar producto')}</Button>}
            <Totals {...cat} title={tr('Total de la categoría {name} · {n} {label}', { name: c.name, n: items.length, label: tr(items.length === 1 ? 'producto' : 'productos') })} labels={['Capital inicial de la categoría', 'Capital final de la categoría', 'Resultado de la categoría', 'ROI de la categoría']} />
          </Card>
        );
      })}

      <Card title={tr('Resumen del portafolio')} actions={<span className="badge">{tr('Actualización automática')}</span>}>
        <Totals {...portfolio.global} labels={['Capital inicial', 'Capital final', 'Resultado global', 'ROI global']} />
        <Notice>
          {tr('El sistema calcula primero cada producto, suma los capitales de cada categoría y después integra las categorías para obtener el resultado global. El ROI global se calcula sobre el capital inicial global, nunca promediando ROI individuales. Las aportaciones y deducciones se registran en Movimientos patrimoniales y no se cuentan como rendimiento.')}
        </Notice>
      </Card>

      {income && <IncomeModal product={income} period={period} onClose={() => setIncome(null)} onSaved={async () => { setIncome(null); await reload(); }} />}
      {form && !pending && (
        <Modal open title={form.product ? tr('Editar producto') : tr('Agregar producto')} onClose={() => setForm(null)}>
          <RecordForm
            fields={fields}
            initial={form.product ? toForm(form.product) : { categoryCode: form.categoryCode || '', name: '', institution: '', notes: '', initialCapital: '', finalCapital: '', incomeType: 'MANUAL', incomeValue: '', incomeDay: '', incomeTerm: '' }}
            onSubmit={save}
            onCancel={() => setForm(null)}
          />
        </Modal>
      )}
      <ConfirmDialog
        open={!!pending}
        title={pending?.kind === 'delete' ? tr('Quitar {label}', { label: pending?.product.name }) : tr('Confirmar modificación')}
        message={pending?.kind === 'delete' ? tr('Se eliminará el producto de este periodo y se recalcularán categoría, portafolio, patrimonio y conciliación.') : tr('Revisa los cambios antes de guardar. Todos los indicadores se recalcularán.')}
        details={pending?.changes}
        danger={pending?.kind === 'delete'}
        loading={busy}
        onConfirm={confirm}
        onClose={() => setPending(null)}
      />
    </>
  );
}

export default function Portfolio() {
  const { api } = useWorkspace();
  const res = usePeriodSummary();
  const cats = useAsync(() => api.get('/portfolio/categories'), [api]);
  return (
    <RequirePeriod>
      <AsyncView loading={res.loading || cats.loading} error={res.error || cats.error} data={res.summary && cats.data ? res : null} onRetry={res.reload}>
        {() => <PortfolioBody summary={res.summary} categories={cats.data} reload={res.reload} />}
      </AsyncView>
    </RequirePeriod>
  );
}
