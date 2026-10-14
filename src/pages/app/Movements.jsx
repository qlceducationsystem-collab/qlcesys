import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { date, money, toDateInput } from '../../utils/format.js';
import { Notice, PageHeader, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { ClosedNotice, PatrimonyBreakdown, ReconciliationBanner } from '../../components/finance/Finance.jsx';
import { RecordManager } from '../../features/records/RecordManager.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';
import { MOVEMENT_TYPES, options } from '../../utils/labels.js';

function Body() {
  const { api } = useWorkspace();
  const { summary: s, reload, period } = usePeriodSummary();
  const assets = useAsync(() => api.get(`/portfolio?periodId=${period.id}`), [api, period.id]);
  const products = assets.data?.portfolio.products || [];
  const productName = (id) => products.find((p) => p.assetId === id)?.name || '—';

  const fields = [
    { name: 'type', label: 'Tipo', type: 'select', options: options.movement, display: (v) => MOVEMENT_TYPES[v] },
    { name: 'amount', label: 'Monto', type: 'money', display: money },
    { name: 'date', label: 'Fecha', type: 'date' },
    { name: 'description', label: 'Descripción (origen o destino del dinero)' },
    { name: 'assetId', label: 'Producto relacionado (opcional)', type: 'select', required: false, options: products.map((p) => ({ value: p.assetId, label: p.name })), display: productName },
  ];

  return (
    <>
      <PageHeader title="Movimientos patrimoniales" subtitle="Aportaciones y deducciones: modifican el patrimonio pero no son rentabilidad" />
      <ClosedNotice />
      {s && (
        <>
          <StatGrid>
            <StatCard label="Capital aportado" value={money(s.patrimony.contributions)} />
            <StatCard label="Capital retirado" value={money(s.patrimony.withdrawals)} />
            <StatCard label="Movimiento neto" value={money(s.patrimony.netMovement)} delta="Aportaciones − deducciones" />
            <StatCard label="Patrimonio final" value={money(s.patrimony.final)} accent />
          </StatGrid>
          <ReconciliationBanner reconciliation={s.reconciliation} />
        </>
      )}
      <div className="layout">
        <RecordManager endpoint="/patrimonial-movements" title="Movimientos del periodo" addLabel="+ Registrar movimiento"
          fields={fields} onChanged={reload}
          toForm={(m) => ({ type: m.type, amount: Number(m.amount), date: toDateInput(m.date), description: m.description, assetId: m.assetId || '' })}
          columns={[
            { key: 'date', label: 'Fecha', render: (m) => date(m.date) },
            { key: 'type', label: 'Tipo', render: (m) => <span className={m.type === 'APORTACION' ? 'up' : 'down'}>{MOVEMENT_TYPES[m.type]}</span> },
            { key: 'description', label: 'Descripción' },
            { key: 'assetId', label: 'Producto', render: (m) => (m.assetId ? productName(m.assetId) : '—') },
            { key: 'amount', label: 'Monto', align: 'right', render: (m) => money(m.amount) },
          ]}
          emptyText="Sin aportaciones ni deducciones en este periodo." />
        {s && <PatrimonyBreakdown patrimony={s.patrimony} roi={s.portfolio.global.roi} />}
      </div>
      <Notice>
        Una aportación aumenta el patrimonio y una deducción lo reduce, pero ninguna es rendimiento. Refleja cada movimiento
        también en el capital inicial del producto correspondiente en Mi cartera; así ambos módulos muestran el mismo
        patrimonio final y el periodo queda conciliado.
      </Notice>
    </>
  );
}

export default function Movements() {
  return <RequirePeriod><Body /></RequirePeriod>;
}
