import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { money, pct, shortMonth } from '../../utils/format.js';
import { Card, Notice, PageHeader, Pill, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { BarChart } from '../../components/charts/Charts.jsx';
import { ClosedNotice } from '../../components/finance/Finance.jsx';
import { RecordManager } from '../../features/records/RecordManager.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';

const STATUS = { ACTIVE: 'Activa', PAID: 'Liquidada' };

const fields = [
  { name: 'name', label: 'Obligación (hipoteca, tarjeta, crédito…)' },
  { name: 'lender', label: 'Acreedor (opcional)', required: false },
  { name: 'balance', label: 'Saldo al cierre del periodo', type: 'money', display: money },
  { name: 'payment', label: 'Pago del periodo', type: 'money', display: money },
  { name: 'annualRate', label: 'Tasa anual (%)', type: 'money', display: (v) => `${v}%` },
  { name: 'status', label: 'Estado', type: 'select', options: Object.entries(STATUS).map(([value, label]) => ({ value, label })), display: (v) => STATUS[v], default: 'ACTIVE' },
];

const columns = [
  { key: 'name', label: 'Deuda', render: (d) => <>{d.name}{d.lender && <span className="small block">{d.lender}</span>}</> },
  { key: 'balance', label: 'Saldo', align: 'right', render: (d) => money(d.balance) },
  { key: 'payment', label: 'Pago', align: 'right', render: (d) => money(d.payment) },
  { key: 'annualRate', label: 'Tasa anual', align: 'right', render: (d) => pct(d.annualRate) },
  { key: 'monthlyInterest', label: 'Costo mensual estimado', align: 'right', render: (d) => money(d.monthlyInterest) },
  { key: 'status', label: 'Estado', render: (d) => <Pill variant={d.status === 'PAID' ? '' : 'warn'}>{STATUS[d.status]}</Pill> },
];

function Body() {
  const { api } = useWorkspace();
  const { summary: s, reload, period } = usePeriodSummary();
  const hist = useAsync(() => api.get('/periods/history'), [api, period?.id]);
  return (
    <>
      <PageHeader title="Deudas" subtitle="Registro de obligaciones y costo del dinero" />
      <ClosedNotice />
      {s && (
        <StatGrid>
          <StatCard label="Deuda total" value={money(s.debts.totalBalance)} accent />
          <StatCard label="Pagos del periodo" value={money(s.debts.totalPayment)} />
          <StatCard label="Costo financiero mensual estimado" value={money(s.debts.totalMonthlyInterest)} delta="Saldo × tasa anual / 12" />
          <StatCard label="Impacto en patrimonio neto" value={money(-s.debts.totalBalance)} delta="Las deudas son pasivos, no inversiones" />
        </StatGrid>
      )}
      <RecordManager endpoint="/debts" title="Obligaciones" addLabel="+ Registrar deuda" fields={fields} columns={columns}
        select={(d) => d.items} rowId={(r) => r.balanceId} onChanged={() => { reload(); hist.reload(); }}
        toForm={(d) => ({ name: d.name, lender: d.lender || '', balance: d.balance, payment: d.payment, annualRate: d.annualRate, status: d.status })}
        emptyText="Sin deudas registradas en este periodo." />
      <Card title="Evolución de la deuda total">
        <BarChart data={(hist.data || []).map((h) => ({ label: `${shortMonth(h.month)} ${String(h.year).slice(2)}`, value: h.debt }))} />
      </Card>
      <Notice>Herramienta educativa y de organización. Una deuda reduce el patrimonio neto y tiene un costo financiero; el cálculo del costo mensual es una aproximación.</Notice>
    </>
  );
}

export default function Debts() {
  return <RequirePeriod><Body /></RequirePeriod>;
}
