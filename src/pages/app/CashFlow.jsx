import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { money, pct } from '../../utils/format.js';
import { Card, PageHeader, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { DistributionBars } from '../../components/charts/Charts.jsx';
import { ClosedNotice } from '../../components/finance/Finance.jsx';
import { RecordManager } from '../../features/records/RecordManager.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, options } from '../../utils/labels.js';

const recordFields = (catOptions, labels) => [
  { name: 'category', label: 'Categoría', type: 'select', options: catOptions, display: (v) => labels[v] },
  { name: 'description', label: 'Concepto' },
  { name: 'amount', label: 'Importe', type: 'money', display: money },
];
const recordColumns = (labels) => [
  { key: 'category', label: 'Categoría', render: (r) => labels[r.category] },
  { key: 'description', label: 'Concepto' },
  { key: 'amount', label: 'Importe', align: 'right', render: (r) => money(r.amount) },
];
const toForm = (r) => ({ category: r.category, description: r.description, amount: Number(r.amount) });

function Body() {
  const { summary: s, reload } = usePeriodSummary();
  const c = s?.cashflow;
  return (
    <>
      <PageHeader title="Ingresos y gastos" subtitle="Conoce cómo se mueve tu dinero cada mes · Mi presupuesto mensual" />
      <ClosedNotice />
      {c && (
        <>
          <StatGrid>
            <StatCard label="Ingresos" value={money(c.income)} />
            <StatCard label="Gastos" value={money(c.expenses)} />
            <StatCard label="Capacidad de ahorro" value={<span className={c.savings < 0 ? 'down' : ''}>{money(c.savings)}</span>} delta="Ingresos − gastos" accent />
            <StatCard label="% ahorro" value={pct(c.savingsRate)} />
          </StatGrid>
          <div className="layout even">
            <Card title="Distribución de gastos">
              <DistributionBars items={c.expenseByCategory.map((e) => ({ key: e.key, label: EXPENSE_CATEGORIES[e.key], value: e.amount, share: e.share }))} emptyText="Registra tus gastos para ver su distribución." />
            </Card>
            <Card title="Origen de los ingresos">
              <DistributionBars items={c.incomeByCategory.map((e) => ({ key: e.key, label: INCOME_CATEGORIES[e.key], value: e.amount, share: e.share }))} emptyText="Registra tus ingresos para ver su origen." />
            </Card>
          </div>
        </>
      )}
      <div className="layout even">
        <RecordManager endpoint="/incomes" title="Ingresos" addLabel="+ Ingreso" fields={recordFields(options.income, INCOME_CATEGORIES)}
          columns={recordColumns(INCOME_CATEGORIES)} toForm={toForm} onChanged={reload} emptyText="Sin ingresos registrados en este periodo." />
        <RecordManager endpoint="/expenses" title="Gastos" addLabel="+ Gasto" fields={recordFields(options.expense, EXPENSE_CATEGORIES)}
          columns={recordColumns(EXPENSE_CATEGORIES)} toForm={toForm} onChanged={reload} emptyText="Sin gastos registrados en este periodo." />
      </div>
    </>
  );
}

export default function CashFlow() {
  return <RequirePeriod><Body /></RequirePeriod>;
}
