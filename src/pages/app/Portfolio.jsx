import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { date, money, pct, signedMoney } from '../../utils/format.js';
import { Card, Notice, PageHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog, Modal } from '../../components/ui/Modal.jsx';
import { AsyncView, Empty } from '../../components/ui/States.jsx';
import { ClosedNotice, ReconciliationBanner, Roi } from '../../components/finance/Finance.jsx';
import { Field, FormError, Input, MoneyInput, Select } from '../../components/ui/Form.jsx';
import { EXPENSE_CATEGORIES, options } from '../../utils/labels.js';
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

function productFields(categories, period) {
  return [
    { name: 'categoryCode', label: tr('Categoría'), type: 'select', options: categories.map((c) => ({ value: c.code, label: c.name })), display: (v) => categories.find((c) => c.code === v)?.name || v },
    { name: 'name', label: tr('Producto'), maxLength: 200 },
    { name: 'institution', label: 'Institución (opcional)', required: false, maxLength: 120 },
    {
      name: 'initialCapital', label: tr('Capital inicial'), type: 'money', display: money,
      hint: (v) => (v.carried
        ? tr('Viene del capital final del mes anterior. Si este mes sacaste o agregaste dinero a este producto, cambia el monto: la diferencia se registra sola como retiro o aportación en Movimientos patrimoniales.')
        : tr('Incluye aportaciones y retiros del periodo en este producto.')),
    },
    {
      name: 'finalCapital', label: tr('Capital final'), type: 'money', display: money,
      compute: (v) => {
        if (manualIncome(v)) return Number(v.initialCapital || 0) + Number(v.incomeValue || 0);
        if (!auto(v)) return null;
        return Number(v.initialCapital || 0) + (isDue(period, v.incomeDay) ? expectedIncome(v) : 0);
      },
      hint: (v) => {
        if (manualIncome(v)) return tr('Se calcula solo: capital inicial + la rentabilidad que recibiste este mes.');
        if (!auto(v)) return tr('Escribe el capital final, o registra abajo la rentabilidad del mes para que se calcule solo.');
        const income = expectedIncome(v);
        if (income > 0 && v.incomeDay && isDue(period, v.incomeDay)) return tr('Se calcula solo: ya incluye {income} de rentabilidad de este mes.', { income: money(income) });
        return income > 0 && v.incomeDay
          ? tr('Se calcula solo: el día {day} el sistema suma {income} y quedará en {total}.', { day: v.incomeDay, income: money(income), total: money(Number(v.initialCapital || 0) + income) })
          : tr('Se calcula solo: capital inicial + la rentabilidad del mes, que el sistema suma el día que indicaste.');
      },
    },
    {
      name: 'incomeType', label: tr('Rentabilidad mensual'), type: 'select', default: 'MANUAL',
      options: Object.entries(INCOME_MODES).map(([value, label]) => ({ value, label: tr(label) })), display: (v) => tr(INCOME_MODES[v] || INCOME_MODES.MANUAL),
      hint: tr('Manual: registras aquí la rentabilidad de este mes cada vez que la recibes. Automática: el sistema la suma sola cada mes en el día indicado, durante el plazo que elijas.'),
    },
    {
      name: 'incomeValue', type: 'number', step: 'any', min: 0, required: false,
      label: (v) => (auto(v) ? tr('Monto o % mensual') : tr('Rentabilidad recibida este mes (opcional)')),
      hint: (v) => (auto(v) ? tr('Ej. 12000 de renta, o 0.85 si es % mensual.') : tr('Monto en pesos. Déjalo vacío si este mes no recibiste rentabilidad.')),
    },
    {
      name: 'incomeDay', type: 'number', step: 1, min: 1, max: 31, required: false,
      label: (v) => (auto(v) ? tr('Día del mes en que la recibes') : tr('Día en que la recibiste')),
      hint: (v) => (auto(v) ? tr('Del 1 al 31. Ese día el sistema hace la suma. Si el mes es más corto se usa su último día.') : tr('Del 1 al 31, dentro del mes del periodo.')),
    },
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
const filled = (x) => x !== '' && x !== null && x !== undefined;
const manualIncome = (v) => !auto(v) && filled(v.incomeValue);
const expectedIncome = (v) => (v.incomeType === 'PERCENT' ? (Number(v.initialCapital || 0) * Number(v.incomeValue || 0)) / 100 : Number(v.incomeValue || 0));
const todayKey = () => new Date().toISOString().slice(0, 10);
const isDue = (period, day) => !!day && dueDate(period, Number(day)) <= todayKey();
const incomeBody = (v) => {
  const { incomeApplied: _omit, carried: _carried, ...rest } = v;
  return {
    ...rest,
    incomeType: auto(v) ? v.incomeType : 'MANUAL',
    incomeValue: filled(v.incomeValue) ? Number(v.incomeValue) : null,
    incomeDay: filled(v.incomeDay) ? Number(v.incomeDay) : null,
    incomeTerm: auto(v) && v.incomeTerm ? Number(v.incomeTerm) : null,
  };
};
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

const NEW = '__NEW__';

function UseModal({ item, products, categories, customCategories, onClose, onSaved }) {
  const { api } = useWorkspace();
  const [f, setF] = useState({ amount: String(item.amount), category: '', newCategory: '', description: '', target: '', categoryCode: '', name: '' });
  const [state, setState] = useState({ busy: false, error: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const expense = item.kind === 'EXPENSE';
  const ready = Number(f.amount) > 0 && (expense
    ? (f.category && (f.category !== NEW || f.newCategory.trim()))
    : (f.categoryCode && f.target && (f.target !== NEW || f.name.trim())));
  const save = async () => {
    setState({ busy: true, error: null });
    try {
      await api.post(`/portfolio/positions/${item.positionId}/use-income`, {
        origin: item.origin,
        kind: item.kind,
        amount: Number(f.amount),
        ...(expense
          ? { category: f.category === NEW ? null : f.category, newCategory: f.category === NEW ? f.newCategory.trim() : null, description: f.description || null }
          : f.target === NEW ? { newProduct: { categoryCode: f.categoryCode, name: f.name.trim() } } : { targetPositionId: f.target }),
      });
      onSaved();
    } catch (error) {
      setState({ busy: false, error });
    }
  };
  const expenseOptions = [
    ...options.expense.filter((o) => o.value !== 'DEUDAS'),
    ...customCategories.map((c) => ({ value: c, label: c.slice('CUSTOM:'.length) })),
    { value: NEW, label: tr('+ Crear una categoría nueva') },
  ];
  const targetOptions = [
    ...products.filter((p) => p.positionId !== item.positionId && p.categoryCode === f.categoryCode).map((p) => ({ value: p.positionId, label: tr(p.name) })),
    { value: NEW, label: tr('+ Crear una inversión nueva en esta categoría') },
  ];
  const pickCategory = (e) => {
    const code = e.target.value;
    const has = products.some((p) => p.positionId !== item.positionId && p.categoryCode === code);
    const cat = categories.find((c) => c.code === code);
    setF({ ...f, categoryCode: code, target: code && !has ? NEW : '', name: cat ? `${cat.name} · ${item.name}` : '' });
  };
  return (
    <Modal open title={expense ? tr('Usar en gastos · {name}', { name: item.name }) : tr('Pasar a otra inversión · {name}', { name: item.name })} onClose={onClose}
      footer={<Button onClick={save} loading={state.busy} disabled={!ready}>{expense ? tr('Mover a gastos') : tr('Pasar a la inversión')}</Button>}>
      <div className="stack">
        <p className="small muted">{expense
          ? tr('Se registra como gasto en la categoría que elijas, dentro de Ingresos y gastos, y sale de este producto. Tu portafolio y tu patrimonio quedan conciliados.')
          : tr('El monto sale de este producto y se suma al capital de la inversión que elijas. Tu patrimonio total no cambia.')}</p>
        <Field label={tr('Monto')} hint={tr('Disponible: {amount}', { amount: money(item.amount) })}><MoneyInput value={f.amount} onChange={set('amount')} /></Field>
        {expense ? (
          <>
            <Field label={tr('Categoría de gasto')}><Select value={f.category} onChange={set('category')} placeholder={tr('Selecciona…')} options={expenseOptions} /></Field>
            {f.category === NEW && <Field label={tr('Nombre de la nueva categoría')} hint={tr('También aparecerá en tu presupuesto del mes.')}><Input value={f.newCategory} maxLength={60} onChange={set('newCategory')} /></Field>}
            <Field label={tr('Descripción (opcional)')}><Input value={f.description} maxLength={200} onChange={set('description')} /></Field>
          </>
        ) : (
          <>
            <Field label={tr('Categoría del portafolio')}><Select value={f.categoryCode} onChange={pickCategory} placeholder={tr('Selecciona…')} options={categories.map((c) => ({ value: c.code, label: c.name }))} /></Field>
            {f.categoryCode && <Field label={tr('Inversión de destino')}><Select value={f.target} onChange={set('target')} placeholder={tr('Selecciona…')} options={targetOptions} /></Field>}
            {f.categoryCode && f.target === NEW && <Field label={tr('Nombre de la nueva inversión')}><Input value={f.name} maxLength={200} onChange={set('name')} /></Field>}
          </>
        )}
        <FormError error={state.error} />
      </div>
    </Modal>
  );
}

function IncomeDecisions({ data, products, categories, customCategories, onChanged }) {
  const { api } = useWorkspace();
  const [modal, setModal] = useState(null);
  const [state, setState] = useState({ busy: null, error: null });
  const month = data.month || [];
  const uses = data.uses || [];
  if (!month.length && !uses.length) return null;
  const run = async (key, fn) => {
    setState({ busy: key, error: null });
    try {
      await fn();
      setState({ busy: null, error: null });
      onChanged();
    } catch (error) {
      setState({ busy: null, error });
    }
  };
  const actions = (item) => (
    <div className="row-actions">
      {item.amount > 0 && <Button variant="secondary" onClick={() => setModal({ ...item, kind: 'INVEST' })}>{tr('Pasar a otra inversión')}</Button>}
      {item.amount > 0 && <Button variant="secondary" onClick={() => setModal({ ...item, kind: 'EXPENSE' })}>{tr('Usar en gastos')}</Button>}
    </div>
  );
  const useText = (u) => (u.kind === 'EXPENSE'
    ? tr('{amount} de {name} usados en gastos · {category}', { amount: money(u.amount), name: tr(u.name), category: tr(EXPENSE_CATEGORIES[u.categoryName] || u.categoryName || '') })
    : tr('{amount} de {name} pasados a {target}', { amount: money(u.amount), name: tr(u.name), target: tr(u.targetName || '') }));
  return (
    <Card title={tr('Rentabilidad por decidir')}>
      <p className="small muted">{tr('Aquí puedes elegir el destino de la rentabilidad de este mes. La rentabilidad de meses anteriores ya forma parte de tu capital inicial.')}</p>
      {month.map((m) => (
        <div key={`month-${m.positionId}`} className="inline-form">
          <span><b>{tr(m.name)}</b> · {tr('De este mes')}: <b className="up">{signedMoney(m.available)}</b> · {tr('La rentabilidad ya está integrada en tu capital final. Puedes mantenerla en este producto, transferirla a otra inversión o destinarla a gastos. Si no realizas ningún movimiento, permanecerá invertida en este producto.')}</span>
          {actions({ origin: 'MONTH', positionId: m.positionId, name: m.name, amount: m.available })}
        </div>
      ))}
      {uses.length > 0 && <div className="totals-title">{tr('Lo que ya decidiste')}</div>}
      {uses.map((u) => (
        <div key={u.id} className="inline-form">
          <span>{useText(u)}</span>
          <Button variant="secondary" loading={state.busy === u.id} onClick={() => run(u.id, () => api.del(`/portfolio/income-uses/${u.id}`))}>{tr('Deshacer')}</Button>
        </div>
      ))}
      <FormError error={state.error} />
      {modal && <UseModal item={modal} products={products} categories={categories} customCategories={customCategories}
        onClose={() => setModal(null)} onSaved={() => { setModal(null); onChanged(); }} />}
    </Card>
  );
}

function ProductCard({ p, writable, onEdit, onDelete, basePath }) {
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
        {writable && <button className="btn-link" onClick={onEdit}>{tr('Cambiar en Editar')}</button>}
      </div>
    </div>
  );
}

function PortfolioBody({ summary, categories, decisions, customCategories, reload }) {
  const carried = new Set(decisions.carried || []);
  const { api, period, canEdit, basePath } = useWorkspace();
  const writable = canEdit && period.status === 'OPEN';
  const [form, setForm] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const { portfolio } = summary;
  const byCat = new Map(portfolio.categories.map((c) => [c.code, c]));
  const fields = productFields(categories, period);
  const liquidPortfolio = byCat.get('LIQUIDEZ')?.final || 0;
  const liquidProtection = summary.protection?.total || 0;

  const toForm = (p) => ({
    categoryCode: p.categoryCode, name: p.name, institution: p.institution || '', notes: p.notes || '',
    initialCapital: p.initial, finalCapital: p.final,
    incomeType: p.incomeType || 'MANUAL',
    incomeValue: p.incomeType ? p.incomeValue ?? '' : p.incomeDate ? p.incomeAmount : '',
    incomeDay: p.incomeType ? p.incomeDay ?? '' : p.incomeDate ? new Date(p.incomeDate).getUTCDate() : '',
    incomeTerm: p.incomeTerm ? String(p.incomeTerm) : '',
    carried: carried.has(p.positionId),
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
      .map((f) => ({ field: typeof f.label === 'function' ? f.label(values) : f.label, from: f.display ? f.display(before[f.name]) : before[f.name] || '—', to: f.display ? f.display(values[f.name]) : values[f.name] || '—' }));
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
      {writable && <IncomeDecisions data={decisions} products={portfolio.products} categories={categories} customCategories={customCategories} onChanged={reload} />}
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
                onEdit={() => setForm({ product: p })} onDelete={() => setPending({ kind: 'delete', product: p })} />
            ))}
            {c.code === 'LIQUIDEZ' && liquidProtection > 0 && (
              <Notice>
                {tr('Liquidez total: {total} = {portfolio} de esta categoría + {protection} de reservas y fondo de emergencia registrados en', { total: money(liquidPortfolio + liquidProtection), portfolio: money(liquidPortfolio), protection: money(liquidProtection) })}{' '}
                <Link to={`${basePath}/proteccion`}>{tr('Protección patrimonial')}</Link>
                {tr('. Es la cifra de Liquidez que ves en Inicio; esos fondos se editan en Protección patrimonial y no se suman al capital de tus productos.')}
              </Notice>
            )}
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
  const { api, period } = useWorkspace();
  const res = usePeriodSummary();
  const cats = useAsync(() => api.get('/portfolio/categories'), [api]);
  const decisions = useAsync(() => api.get(`/portfolio/income-uses?periodId=${period.id}`), [api, period?.id], { enabled: !!period });
  const budget = useAsync(() => api.get(`/academy/budget?year=${period.year}&month=${period.month}`).catch(() => null), [api, period?.id], { enabled: !!period });
  const customCategories = (budget.data?.lines || []).map((l) => l.category).filter((c) => c.startsWith('CUSTOM:'));
  const reload = async () => {
    await res.reload();
    await decisions.reload();
    await budget.reload();
  };
  return (
    <RequirePeriod>
      <AsyncView loading={res.loading || cats.loading} error={res.error || cats.error} data={res.summary && cats.data ? res : null} onRetry={res.reload}>
        {() => <PortfolioBody summary={res.summary} categories={cats.data} decisions={decisions.data || {}} customCategories={customCategories} reload={reload} />}
      </AsyncView>
    </RequirePeriod>
  );
}
