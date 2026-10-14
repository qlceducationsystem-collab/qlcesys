import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { money, pct } from '../../utils/format.js';
import { Card, PageHeader } from '../../components/ui/Card.jsx';
import { AsyncView, Empty } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';
import { AllocationBars, ReadingCard } from '../../features/academy/AllocationView.jsx';
import { modulePath } from '../../features/academy/useAcademy.js';

function Body({ s, allocation }) {
  const { basePath } = useWorkspace();
  if (!s.portfolio.products.length) {
    return (
      <Empty
        title="Sin distribución todavía"
        text="Registra tus productos en el Módulo 2 o en Mi cartera para ver cómo está distribuido tu patrimonio."
        action={<Link className="btn-primary" to={modulePath(basePath, 2)}>Ir al mapa de productos</Link>}
      />
    );
  }
  return (
    <>
      <div className="layout">
        <Card title={`Distribución por categoría · ${money(allocation.total)}`}>
          <AllocationBars allocation={allocation} />
          {allocation.pendingBreakdown > 0 && <p className="small muted">{money(allocation.pendingBreakdown)} del diagnóstico aún no están desglosados en productos.</p>}
        </Card>
        <ReadingCard reading={allocation.reading} />
      </div>
      <Card title="Detalle por producto">
        <DataTable
          rowKey="positionId"
          rows={[...s.portfolio.products].sort((a, b) => b.final - a.final)}
          columns={[
            { key: 'name', label: 'Producto' },
            { key: 'categoryName', label: 'Categoría' },
            { key: 'final', label: 'Capital', align: 'right', render: (p) => money(p.final) },
            { key: 'share', label: '% de la cartera', align: 'right', render: (p) => pct(p.share) },
          ]}
        />
      </Card>
      <p className="small muted">Una cartera no debe evaluarse únicamente por rendimiento potencial: también importan su liquidez, riesgo, horizonte y función dentro del patrimonio.</p>
    </>
  );
}

export default function Allocation() {
  const res = usePeriodSummary();
  return (
    <RequirePeriod>
      <PageHeader title="Allocation / distribución patrimonial" subtitle="¿De dónde proviene tu patrimonio?" />
      <AsyncView {...res} data={res.data} onRetry={res.reload}>{(d) => <Body s={d.summary} allocation={d.allocation} />}</AsyncView>
    </RequirePeriod>
  );
}
