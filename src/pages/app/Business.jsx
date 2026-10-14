import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { money } from '../../utils/format.js';
import { PageHeader, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { Empty } from '../../components/ui/States.jsx';
import { ClosedNotice, Money } from '../../components/finance/Finance.jsx';
import { RecordManager } from '../../features/records/RecordManager.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';

function Body() {
  const { basePath } = useWorkspace();
  const { summary: s, reload } = usePeriodSummary();
  if (!s) return null;
  const businesses = s.portfolio.products.filter((p) => p.categoryCode === 'NEGOCIOS');
  const capitalOf = (assetId) => businesses.find((b) => b.assetId === assetId)?.final;
  const nameOf = (assetId) => businesses.find((b) => b.assetId === assetId)?.name || '—';

  return (
    <>
      <PageHeader title="Negocios y flujo de efectivo" subtitle="Diversificación más allá de los mercados financieros" />
      <ClosedNotice />
      <StatGrid>
        <StatCard label="Negocios registrados" value={businesses.length} />
        <StatCard label="Capital en negocios" value={money(businesses.reduce((a, b) => a + b.final, 0))} />
        <StatCard label="Ingresos de negocios" value={money(s.business.revenue)} />
        <StatCard label="Flujo neto" value={<Money value={s.business.net} signed />} accent delta="Ingresos − gastos del negocio" />
      </StatGrid>
      {businesses.length === 0 ? (
        <Empty title="Aún no tienes negocios registrados"
          text="Registra primero tu negocio en Mi cartera, categoría Negocios (capital invertido). Después podrás registrar aquí su flujo mensual."
          action={<Link className="btn-primary" to={`${basePath}/cartera`}>Ir a Mi cartera</Link>} />
      ) : (
        <RecordManager endpoint="/business" title="Flujo mensual por negocio" addLabel="+ Registrar flujo" onChanged={reload}
          fields={[
            { name: 'assetId', label: 'Negocio', type: 'select', options: businesses.map((b) => ({ value: b.assetId, label: b.name })), display: nameOf },
            { name: 'revenue', label: 'Ingresos del negocio', type: 'money', display: money },
            { name: 'costs', label: 'Gastos del negocio', type: 'money', display: money },
            { name: 'notes', label: 'Notas', type: 'textarea', required: false },
          ]}
          toForm={(f) => ({ assetId: f.assetId, revenue: Number(f.revenue), costs: Number(f.costs), notes: f.notes || '' })}
          columns={[
            { key: 'assetId', label: 'Negocio', render: (f) => nameOf(f.assetId) },
            { key: 'capital', label: 'Capital', align: 'right', render: (f) => money(capitalOf(f.assetId)) },
            { key: 'revenue', label: 'Ingresos', align: 'right', render: (f) => <span className="up">+{money(f.revenue)}</span> },
            { key: 'costs', label: 'Gastos', align: 'right', render: (f) => <span className="down">−{money(f.costs)}</span> },
            { key: 'net', label: 'Flujo neto', align: 'right', render: (f) => <Money value={Number(f.revenue) - Number(f.costs)} signed /> },
          ]}
          emptyText="Sin flujo registrado en este periodo." />
      )}
      <div className="hero">
        <h2>Un negocio también puede ser parte de la estructura patrimonial</h2>
        <p>Un negocio físico puede aportar flujo de efectivo vinculado a una actividad productiva, pero no es automáticamente seguro: tiene riesgos de demanda, competencia, gastos, personal, inventario y capital inmovilizado. El flujo del negocio se mantiene separado de tu presupuesto personal.</p>
      </div>
    </>
  );
}

export default function Business() {
  return <RequirePeriod><Body /></RequirePeriod>;
}
