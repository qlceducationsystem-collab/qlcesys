import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { money, pct, shortMonth } from '../../utils/format.js';
import { Card, Notice, PageHeader, Pill, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { BarChart } from '../../components/charts/Charts.jsx';
import { ClosedNotice } from '../../components/finance/Finance.jsx';
import { RecordManager } from '../../features/records/RecordManager.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';
import { modulePath } from '../../features/academy/useAcademy.js';
import { DEBT_TYPES, options } from '../../utils/labels.js';

const STATUS = { ACTIVE: 'Activa', PAID: 'Liquidada' };

const fields = [
  { name: 'name', label: 'Obligación (hipoteca, tarjeta, crédito…)' },
  { name: 'type', label: 'Tipo', type: 'select', options: options.debtTypes, display: (v) => DEBT_TYPES[v], default: 'OTRA' },
  { name: 'lender', label: 'Acreedor (opcional)', required: false },
  { name: 'balance', label: 'Saldo al cierre del periodo', type: 'money', display: money },
  { name: 'payment', label: 'Pago mensual planeado', type: 'money', display: money },
  { name: 'fees', label: 'Cargos mensuales', type: 'money', display: money, required: false },
  { name: 'annualRate', label: 'Tasa anual (%)', type: 'money', display: (v) => (v === null || v === '' ? 'Pendiente' : `${v}%`), required: false, hint: 'Déjala vacía si no la conoces: se mostrará como pendiente, no como 0%.' },
  { name: 'status', label: 'Estado', type: 'select', options: Object.entries(STATUS).map(([value, label]) => ({ value, label })), display: (v) => STATUS[v], default: 'ACTIVE' },
];

const columns = [
  { key: 'name', label: 'Deuda', render: (d) => <>{d.name}<span className="small block">{DEBT_TYPES[d.type]}{d.lender ? ` · ${d.lender}` : ''}</span></> },
  { key: 'balance', label: 'Saldo', align: 'right', render: (d) => money(d.balance) },
  { key: 'payment', label: 'Pago', align: 'right', render: (d) => money(d.payment) },
  { key: 'annualRate', label: 'Tasa anual', align: 'right', render: (d) => (d.rateKnown ? pct(d.annualRate) : <Pill variant="warn">Pendiente</Pill>) },
  { key: 'monthlyCost', label: 'Interés + cargos est.', align: 'right', render: (d) => money(d.monthlyCost) },
  { key: 'status', label: 'Estado', render: (d) => <Pill variant={d.status === 'PAID' ? '' : 'warn'}>{STATUS[d.status]}</Pill> },
];

function Body() {
  const { api, basePath } = useWorkspace();
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
          <StatCard label="Costo financiero mensual estimado" value={money(s.debts.totalMonthlyCost)} delta={s.debts.ratesIncomplete ? 'Incompleto: hay tasas pendientes' : 'Intereses + cargos'} />
          <StatCard label="Impacto en patrimonio neto" value={money(-s.debts.totalBalance)} delta="Las deudas son pasivos, no inversiones" />
        </StatGrid>
      )}
      <RecordManager endpoint="/debts" title="Obligaciones" addLabel="+ Registrar deuda" fields={fields} columns={columns}
        select={(d) => d.items} rowId={(r) => r.balanceId} onChanged={() => { reload(); hist.reload(); }}
        toForm={(d) => ({ name: d.name, type: d.type, lender: d.lender || '', balance: d.balance, payment: d.payment, fees: d.fees, annualRate: d.annualRate ?? '', status: d.status })}
        emptyText="Sin deudas registradas en este periodo." />
      <Card title="Evolución de la deuda total">
        <BarChart data={(hist.data || []).map((h) => ({ label: `${shortMonth(h.month)} ${String(h.year).slice(2)}`, value: h.debt }))} />
      </Card>
      <Notice>Analiza tus obligaciones con el <Link to={modulePath(basePath, 9)}>Módulo 9</Link> desde la academia. Herramienta educativa y de organización. Una deuda reduce el patrimonio neto y tiene un costo financiero; el cálculo del costo mensual es una aproximación.</Notice>
    </>
  );
}

export default function Debts() {
  return <RequirePeriod><Body /></RequirePeriod>;
}
