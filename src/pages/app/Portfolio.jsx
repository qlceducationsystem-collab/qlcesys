import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { money, pct, signedMoney } from '../../utils/format.js';
import { Card, Notice, PageHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog, Modal } from '../../components/ui/Modal.jsx';
import { AsyncView, Empty } from '../../components/ui/States.jsx';
import { ClosedNotice, ReconciliationBanner, Roi } from '../../components/finance/Finance.jsx';
import { RecordForm } from '../../features/records/RecordManager.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';

const Totals = ({ initial, final, result, roi, labels = ['Capital inicial', 'Capital final', 'Resultado', 'ROI'] }) => (
  <div className="totals">
    <div className="total"><span>{labels[0]}</span><strong>{money(initial)}</strong></div>
    <div className="total"><span>{labels[1]}</span><strong>{money(final)}</strong></div>
    <div className="total"><span>{labels[2]}</span><strong className={result > 0 ? 'up' : result < 0 ? 'down' : ''}>{signedMoney(result)}</strong></div>
    <div className="total"><span>{labels[3]}</span><strong><Roi value={roi} /></strong></div>
  </div>
);

function productFields(categories) {
  return [
    { name: 'categoryCode', label: 'Categoría', type: 'select', options: categories.map((c) => ({ value: c.code, label: c.name })), display: (v) => categories.find((c) => c.code === v)?.name || v },
    { name: 'name', label: 'Producto', maxLength: 200 },
    { name: 'institution', label: 'Institución (opcional)', required: false, maxLength: 120 },
    { name: 'initialCapital', label: 'Capital inicial', type: 'money', display: money, hint: 'Incluye aportaciones y retiros del periodo en este producto.' },
    { name: 'finalCapital', label: 'Capital final', type: 'money', display: money },
    { name: 'notes', label: 'Notas', type: 'textarea', required: false },
  ];
}

function ProductCard({ p, writable, onEdit, onDelete, basePath }) {
  return (
    <div className="asset">
      <div className="asset-head">
        <div>
          <Link to={`${basePath}/cartera/${p.assetId}`} className="asset-name">{p.name}</Link>
          <div className="asset-type">{p.categoryName}{p.institution ? ` · ${p.institution}` : ''}</div>
        </div>
        {writable && (
          <div className="row-actions">
            <button className="btn-link" onClick={onEdit}>Editar</button>
            <button className="btn-remove" onClick={onDelete}>Quitar</button>
          </div>
        )}
      </div>
      <div className="asset-grid">
        <div className="total"><span>Capital inicial</span><strong>{money(p.initial)}</strong></div>
        <div className="total"><span>Capital final</span><strong>{money(p.final)}</strong></div>
        <div className="total"><span>Resultado del producto</span><strong className={p.result > 0 ? 'up' : p.result < 0 ? 'down' : ''}>{signedMoney(p.result)}</strong></div>
        <div className="total"><span>ROI del producto</span><strong><Roi value={p.roi} /></strong></div>
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
  const { portfolio } = summary;
  const byCat = new Map(portfolio.categories.map((c) => [c.code, c]));
  const fields = productFields(categories);

  const toForm = (p) => ({
    categoryCode: p.categoryCode, name: p.name, institution: p.institution || '', notes: p.notes || '',
    initialCapital: p.initial, finalCapital: p.final,
  });

  const save = async (values) => {
    const body = { ...values, periodId: period.id };
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
        kicker="Mi cartera · detalle por producto"
        title="Mis inversiones"
        subtitle="Producto individual → categoría → resultado → cartera total"
        actions={writable && <Button onClick={() => setForm({ product: null })}>+ Agregar producto</Button>}
      />
      <ClosedNotice />
      <ReconciliationBanner reconciliation={summary.reconciliation} compact={summary.reconciliation.reconciled} />

      {portfolio.products.length === 0 && (
        <Empty title="Tu cartera está vacía" text="Agrega tus productos (CETES, acciones, Casa A, Negocio A…) con su capital inicial y final del periodo."
          action={writable && <Button onClick={() => setForm({ product: null })}>Agregar primer producto</Button>} />
      )}

      {categories.filter((c) => byCat.has(c.code)).map((c) => {
        const cat = byCat.get(c.code);
        const items = portfolio.products.filter((p) => p.categoryCode === c.code);
        return (
          <Card key={c.code} title={c.name} actions={<span className="badge">{items.length} {items.length === 1 ? 'producto' : 'productos'} · {pct(cat.share)} de la cartera</span>}>
            {items.map((p) => (
              <ProductCard key={p.positionId} p={p} basePath={basePath} writable={writable}
                onEdit={() => setForm({ product: p })} onDelete={() => setPending({ kind: 'delete', product: p })} />
            ))}
            {writable && <Button variant="add" onClick={() => setForm({ product: null, categoryCode: c.code })}>+ Agregar producto</Button>}
            <Totals {...cat} />
          </Card>
        );
      })}

      <Card title="Resumen de la cartera" actions={<span className="badge">Actualización automática</span>}>
        <Totals {...portfolio.global} labels={['Capital inicial', 'Capital final', 'Resultado global', 'ROI global']} />
        <Notice>
          El sistema calcula primero cada producto, suma los capitales de cada categoría y después integra las categorías
          para obtener el resultado global. El ROI global se calcula sobre el capital inicial global, nunca promediando ROI
          individuales. Las aportaciones y deducciones se registran en Movimientos patrimoniales y no se cuentan como rendimiento.
        </Notice>
      </Card>

      {form && !pending && (
        <Modal open title={form.product ? 'Editar producto' : 'Agregar producto'} onClose={() => setForm(null)}>
          <RecordForm
            fields={fields}
            initial={form.product ? toForm(form.product) : { categoryCode: form.categoryCode || '', name: '', institution: '', notes: '', initialCapital: '', finalCapital: '' }}
            onSubmit={save}
            onCancel={() => setForm(null)}
          />
        </Modal>
      )}
      <ConfirmDialog
        open={!!pending}
        title={pending?.kind === 'delete' ? `Quitar ${pending?.product.name}` : 'Confirmar modificación'}
        message={pending?.kind === 'delete' ? 'Se eliminará el producto de este periodo y se recalcularán categoría, cartera, patrimonio y conciliación.' : 'Revisa los cambios antes de guardar. Todos los indicadores se recalcularán.'}
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
