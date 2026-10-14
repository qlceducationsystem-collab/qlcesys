import { useMemo, useState } from 'react';
import { taxItem } from '@shared/patrimonial.js';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { money, pct } from '../../../utils/format.js';
import { options, RESULT_PERIODS, TAX_ITEM_TYPES } from '../../../utils/labels.js';
import { Button } from '../../../components/ui/Button.jsx';
import { DataTable } from '../../../components/ui/DataTable.jsx';
import { Field, FormError, Input, MoneyInput, Select } from '../../../components/ui/Form.jsx';
import { ConfirmDialog } from '../../../components/ui/Modal.jsx';
import { ErrorState } from '../../../components/ui/States.jsx';
import { ExplainRows, KindBadge, MetricCard, MetricGrid, RiskNote, ToolCard, ToolSkeleton } from '../ResultParts.jsx';
import { useAction } from '../useAction.js';

const EMPTY = { name: '', type: 'NEGOCIO', period: 'MENSUAL', capital: '', grossProfit: '', commissions: '', otherCosts: '', taxRate: '', sourceAssetId: '' };
const NUMERIC = ['capital', 'grossProfit', 'commissions', 'otherCosts', 'taxRate'];
const toBody = (f) => ({ ...f, ...Object.fromEntries(NUMERIC.map((k) => [k, Number(f[k] || 0)])), sourceAssetId: f.sourceAssetId || null });
const toForm = (i) => ({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, i[k] ?? ''])) });

function ItemForm({ initial, assets, onSubmit, onCancel, busy, error, disabled }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const preview = useMemo(() => taxItem(toBody(f)), [f]);
  const linkAsset = (e) => {
    const asset = assets.find((a) => a.id === e.target.value);
    setF({ ...f, sourceAssetId: e.target.value, name: f.name || asset?.name || '', capital: f.capital === '' && asset ? String(asset.capital) : f.capital });
  };
  return (
    <div className="split-panel">
      <form className="stack" onSubmit={(e) => { e.preventDefault(); onSubmit(toBody(f)); }}>
        <div className="form-grid cols-2">
          <Field label="Nombre del negocio o inversión"><Input required maxLength={120} value={f.name} onChange={set('name')} placeholder="Ej. Negocio de alimentos" disabled={disabled} /></Field>
          <Field label="Tipo"><Select value={f.type} onChange={set('type')} options={options.taxItemTypes} disabled={disabled} /></Field>
          <Field label="Relacionar con un activo (opcional)" hint="Solo como referencia: el análisis no cambia el valor del activo.">
            <Select value={f.sourceAssetId} onChange={linkAsset} options={assets.map((a) => ({ value: a.id, label: `${a.name} · ${money(a.capital)}` }))} placeholder="Sin relación" disabled={disabled} />
          </Field>
          <Field label="Periodo del resultado"><Select value={f.period} onChange={set('period')} options={options.resultPeriods} disabled={disabled} /></Field>
          <Field label="Capital invertido"><MoneyInput value={f.capital} onChange={set('capital')} placeholder="0" disabled={disabled} /></Field>
          <Field label="Ganancia bruta del periodo" hint="Puede ser negativa.">
            <input className="input" type="number" inputMode="decimal" step="0.01" value={f.grossProfit} onChange={set('grossProfit')} placeholder="0" disabled={disabled} />
          </Field>
          <Field label="Comisiones"><MoneyInput value={f.commissions} onChange={set('commissions')} placeholder="0" disabled={disabled} /></Field>
          <Field label="Otros costos y gastos"><MoneyInput value={f.otherCosts} onChange={set('otherCosts')} placeholder="0" disabled={disabled} /></Field>
          <Field label="Tasa de impuesto estimada (%)" hint="Entre 0% y 100%. Es un supuesto, no una tasa oficial.">
            <input className="input" type="number" inputMode="decimal" min="0" max="100" step="0.01" value={f.taxRate} onChange={set('taxRate')} placeholder="0" disabled={disabled} />
          </Field>
        </div>
        <FormError error={error} />
        {!disabled && (
          <div className="form-actions">
            {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
            <Button type="submit" loading={busy}>{onCancel ? 'Guardar cambios' : 'Guardar negocio / inversión'}</Button>
          </div>
        )}
      </form>
      <ExplainRows
        title="Resultado del registro"
        rows={[
          ['Capital invertido', money(preview.capital)],
          ['Ganancia bruta', money(preview.grossProfit)],
          ['Comisiones y otros costos', money(preview.costs)],
          ['Ganancia antes de impuestos', money(preview.preTax)],
          ['Base estimada para impuesto', money(preview.taxBase)],
          ['Impuesto estimado', money(preview.tax)],
          ['Capital + ganancia neta', money(preview.capitalPlusNet)],
          ['Rendimiento bruto', preview.grossReturn === null ? 'N/D' : pct(preview.grossReturn)],
          ['Rendimiento neto', preview.netReturn === null ? 'N/D' : pct(preview.netReturn), preview.netReturn < 0 ? 'down' : 'up'],
        ]}
        final={{ label: 'Ganancia neta estimada', value: money(preview.net), tone: preview.net < 0 ? 'down' : 'up' }}
      />
    </div>
  );
}

export function M10NetReturn({ onSaved }) {
  const { api, canEdit } = useWorkspace();
  const res = useAsync(() => api.get('/academy/tax-items'), [api]);
  const action = useAction();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [formKey, setFormKey] = useState(0);

  if (res.loading && !res.data) return <ToolSkeleton />;
  if (res.error) return <ErrorState error={res.error} onRetry={res.reload} />;
  const { items, consolidated: c, assets } = res.data;
  const refresh = async () => {
    await res.reload();
    onSaved?.();
  };
  const create = async (body) => {
    if (await action.run(() => api.post('/academy/tax-items', body))) {
      setFormKey((k) => k + 1);
      await refresh();
    }
  };
  const update = async (body) => {
    if (await action.run(() => api.put(`/academy/tax-items/${editing.id}`, body))) {
      setEditing(null);
      await refresh();
    }
  };
  const remove = async () => {
    if (await action.run(() => api.del(`/academy/tax-items/${removing.id}`))) {
      setRemoving(null);
      await refresh();
    }
  };

  return (
    <div className="tool">
      <MetricGrid>
        <MetricCard label="Capital invertido" value={money(c.capital)} hint={`${c.count} registros`} />
        <MetricCard label="Ganancia bruta estimada" value={money(c.grossProfit)} hint="Antes de costos e impuestos" />
        <MetricCard label="Ganancia neta estimada" value={money(c.net)} tone={c.net < 0 ? 'bad' : c.count ? 'good' : ''} hint={`Costos ${money(c.costs)} · Impuestos ${money(c.tax)}`} />
        <MetricCard label="Rendimiento neto consolidado" value={c.netReturn === null ? 'N/D' : pct(c.netReturn)} tone={c.mixedPeriods ? 'warn' : ''} hint="Ganancia neta total ÷ capital total" />
      </MetricGrid>
      {c.mixedPeriods && (
        <RiskNote>Tus registros mezclan periodos ({c.periods.map((p) => RESULT_PERIODS[p]).join(', ')}). El rendimiento consolidado no es directamente comparable: compara registros del mismo periodo.</RiskNote>
      )}

      {canEdit && (
        <ToolCard step="1" title="Agregar negocio o inversión" description="Cada registro conserva sus propios costos, tasa estimada y periodo." aside={<KindBadge kind="ESTIMATE" />}>
          <ItemForm key={formKey} initial={EMPTY} assets={assets} onSubmit={create} busy={action.busy && !editing} error={!editing && !removing ? action.error : null} />
        </ToolCard>
      )}

      <ToolCard step="2" title="Negocios e inversiones registrados" description="Eliminar un análisis no borra activos ni movimientos de otras secciones.">
        <DataTable
          rows={items}
          empty="No hay negocios ni inversiones registrados. Agrega el primero para comenzar."
          columns={[
            { key: 'name', label: 'Negocio / inversión', render: (i) => <><b>{i.name}</b><span className="small block">{TAX_ITEM_TYPES[i.type]} · {RESULT_PERIODS[i.period]}</span></> },
            { key: 'capital', label: 'Capital', align: 'right', render: (i) => money(i.capital) },
            { key: 'grossProfit', label: 'Ganancia bruta', align: 'right', render: (i) => money(i.grossProfit) },
            { key: 'costs', label: 'Costos', align: 'right', render: (i) => money(i.result.costs) },
            { key: 'tax', label: 'Impuesto est.', align: 'right', render: (i) => money(i.result.tax) },
            { key: 'net', label: 'Ganancia neta', align: 'right', render: (i) => <span className={i.result.net < 0 ? 'down' : 'up'}>{money(i.result.net)}</span> },
            { key: 'netReturn', label: 'Rend. neto', align: 'right', render: (i) => (i.result.netReturn === null ? 'N/D' : pct(i.result.netReturn)) },
            ...(canEdit ? [{
              key: 'x', label: 'Acciones', align: 'right', render: (i) => (
                <div className="row-actions">
                  <button type="button" className="btn-link" onClick={() => setEditing(i)}>Editar</button>
                  <button type="button" className="btn-link danger" onClick={() => setRemoving(i)}>Eliminar</button>
                </div>
              ),
            }] : []),
          ]}
        />
      </ToolCard>

      {editing && (
        <ToolCard title={`Editar · ${editing.name}`}>
          <ItemForm initial={toForm(editing)} assets={assets} onSubmit={update} onCancel={() => setEditing(null)} busy={action.busy} error={action.error} />
        </ToolCard>
      )}

      <ToolCard title="¿Cómo se calcula?">
        <ExplainRows
          title="Modelo simplificado"
          rows={[
            ['Costos totales', 'Comisiones + otros costos'],
            ['Ganancia antes de impuestos', 'Ganancia bruta − costos'],
            ['Base estimada', 'Máximo entre 0 y la ganancia antes de impuestos'],
            ['Impuesto estimado', 'Base × tasa / 100'],
            ['Ganancia neta', 'Ganancia bruta − costos − impuesto'],
            ['Rendimiento neto', 'Ganancia neta ÷ capital × 100'],
          ]}
        />
      </ToolCard>
      <RiskNote>
        La tasa introducida no es universal ni determina el impuesto oficial. La base fiscal real depende de la jurisdicción, actividad, instrumento, persona, deducciones, retenciones, pérdidas y reglas aplicables.
        QLC no sustituye la asesoría fiscal profesional. Las ganancias e impuestos estimados no crean ingresos, gastos ni cambios en tus activos.
      </RiskNote>

      <ConfirmDialog
        open={!!removing}
        title={`Eliminar ${removing?.name || ''}`}
        message="El registro dejará de participar en los totales. No se borran activos, movimientos ni información de otras secciones."
        danger
        confirmLabel="Eliminar"
        loading={action.busy}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      >
        <FormError error={removing ? action.error : null} />
      </ConfirmDialog>
    </div>
  );
}
