import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { money } from '../../../utils/format.js';
import { HORIZONS, LIQUIDITY_LEVELS, options, PERCEIVED_RISK, PRODUCT_TYPES } from '../../../utils/labels.js';
import { Button } from '../../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../../components/ui/Modal.jsx';
import { Field, FormError, Input, MoneyInput, Select } from '../../../components/ui/Form.jsx';
import { DataTable } from '../../../components/ui/DataTable.jsx';
import { Pill } from '../../../components/ui/Card.jsx';
import { ErrorState, Loading } from '../../../components/ui/States.jsx';
import { MetricCard, MetricGrid, RealBadge, ToolCard } from '../ResultParts.jsx';

const EMPTY = { name: '', productType: 'RENTA_FIJA', capital: '', horizon: 'MEDIANO', liquidityLevel: 'MEDIA', perceivedRisk: 'MEDIO' };
const RISK_TONE = { BAJO: '', MEDIO: '', ALTO: 'warn', MUY_ALTO: 'bad' };

function ProductForm({ initial, onSubmit, onCancel, busy, error }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); onSubmit(f); }}>
      <div className="form-grid cols-3">
        <Field label="Nombre del producto"><Input required maxLength={120} placeholder="Ej. CETES, BTC, casa, negocio" value={f.name} onChange={set('name')} /></Field>
        <Field label="Tipo"><Select value={f.productType} onChange={set('productType')} options={options.productTypes} /></Field>
        <Field label="Capital actual"><MoneyInput required min="0.01" value={f.capital} onChange={set('capital')} placeholder="0" /></Field>
        <Field label="Horizonte"><Select value={f.horizon} onChange={set('horizon')} options={options.horizons} /></Field>
        <Field label="Liquidez"><Select value={f.liquidityLevel} onChange={set('liquidityLevel')} options={options.liquidity} /></Field>
        <Field label="Riesgo percibido"><Select value={f.perceivedRisk} onChange={set('perceivedRisk')} options={options.risk} /></Field>
      </div>
      <FormError error={error} />
      <div className="form-actions">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" loading={busy}>{onCancel ? 'Guardar cambios' : 'Agregar a mi mapa'}</Button>
      </div>
    </form>
  );
}

export function M2ProductMap({ onSaved }) {
  const { api, canEdit, basePath } = useWorkspace();
  const res = useAsync(() => api.get('/academy/products'), [api]);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState({ busy: false, error: null });

  if (res.loading && !res.data) return <Loading />;
  if (res.error) return <ErrorState error={res.error} onRetry={res.reload} />;
  const { products, pending } = res.data;
  const total = products.reduce((a, p) => a + p.capital, 0);
  const pendingInvestments = pending?.M1_INVESTMENTS || 0;

  const run = async (fn) => {
    setState({ busy: true, error: null });
    try {
      await fn();
      await res.reload();
      onSaved?.();
      setState({ busy: false, error: null });
      return true;
    } catch (error) {
      setState({ busy: false, error });
      return false;
    }
  };

  const add = async (f) => {
    if (await run(() => api.post('/academy/products', f))) setFormKey((k) => k + 1);
  };
  const update = async (f) => {
    if (await run(() => api.put(`/academy/products/${editing.assetId}`, f))) setEditing(null);
  };
  const remove = async () => {
    if (await run(() => api.del(`/academy/products/${removing.assetId}`))) setRemoving(null);
  };

  return (
    <div className="tool">
      {canEdit && (
        <ToolCard step="1" title="Agregar producto o activo" description="Registra cada producto individualmente. Alimentará Mi cartera, Allocation y Patrimonio." aside={<RealBadge />}>
          <ProductForm key={formKey} initial={EMPTY} onSubmit={add} busy={state.busy && !editing} error={!editing ? state.error : null} />
        </ToolCard>
      )}
      <MetricGrid>
        <MetricCard label="Productos registrados" value={products.length} />
        <MetricCard label="Capital identificado" value={money(total)} />
        <MetricCard
          label="Inversiones por desglosar"
          value={money(pendingInvestments)}
          tone={pendingInvestments > 0 ? 'warn' : 'good'}
          hint={pending ? 'Del diagnóstico del Módulo 1' : 'Completa el Módulo 1 para comparar'}
          explanation="El Módulo 1 registró tus inversiones como cifra global. Aquí la descompones en productos sin duplicarla."
        />
      </MetricGrid>
      <ToolCard step="2" title="Mapa de productos registrados" description="Producto individual → categoría → Mi cartera → Allocation → Patrimonio.">
        <DataTable
          rowKey="assetId"
          rows={products}
          empty="Aún no registras productos. Agrega el primero para construir tu mapa."
          columns={[
            { key: 'name', label: 'Producto', render: (p) => <b>{p.name}</b> },
            { key: 'productType', label: 'Tipo', render: (p) => PRODUCT_TYPES[p.productType] },
            { key: 'capital', label: 'Capital', align: 'right', render: (p) => money(p.capital) },
            { key: 'horizon', label: 'Horizonte', render: (p) => HORIZONS[p.horizon] },
            { key: 'liquidityLevel', label: 'Liquidez', render: (p) => LIQUIDITY_LEVELS[p.liquidityLevel] },
            { key: 'perceivedRisk', label: 'Riesgo', render: (p) => <Pill variant={RISK_TONE[p.perceivedRisk]}>{PERCEIVED_RISK[p.perceivedRisk]}</Pill> },
            ...(canEdit ? [{ key: 'x', label: 'Acciones', align: 'right', render: (p) => (
              <div className="row-actions">
                <button type="button" className="btn-link" onClick={() => setEditing(p)}>Editar</button>
                <button type="button" className="btn-link danger" onClick={() => setRemoving(p)}>Eliminar</button>
              </div>
            ) }] : []),
          ]}
        />
        <p className="small muted">Estos productos ya aparecen en <Link to={`${basePath}/cartera`}>Mi cartera</Link> y en <Link to={`${basePath}/allocation`}>Allocation</Link>.</p>
      </ToolCard>
      {editing && (
        <ToolCard title={`Editar · ${editing.name}`}>
          <ProductForm
            initial={{ name: editing.name, productType: editing.productType, capital: editing.capital, horizon: editing.horizon, liquidityLevel: editing.liquidityLevel, perceivedRisk: editing.perceivedRisk }}
            onSubmit={update}
            onCancel={() => setEditing(null)}
            busy={state.busy}
            error={state.error}
          />
        </ToolCard>
      )}
      <ConfirmDialog
        open={!!removing}
        title={`Eliminar ${removing?.name || ''}`}
        message="El producto se quitará de tu mapa, de Mi cartera y de Allocation del periodo actual."
        danger
        confirmLabel="Eliminar"
        loading={state.busy}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      >
        <FormError error={removing ? state.error : null} />
      </ConfirmDialog>
    </div>
  );
}
