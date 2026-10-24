import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { money, shortMonth } from '../../utils/format.js';
import { Card, Notice, PageHeader, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { BarChart } from '../../components/charts/Charts.jsx';
import { ClosedNotice } from '../../components/finance/Finance.jsx';
import { RecordManager } from '../../features/records/RecordManager.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';
import { INSURANCE_TYPES, PROTECTION_TYPES, options } from '../../utils/labels.js';
import { DebtCostCard, EmergencyFundCard, usePatrimonial } from '../../features/patrimonial/PatrimonialCards.jsx';
import { tr } from '../../i18n/tr.js';

const fields = [
  { name: 'type', label: 'Tipo', type: 'select', options: options.protection, display: (v) => PROTECTION_TYPES[v] },
  { name: 'name', label: 'Nombre / institución' },
  { name: 'amount', label: 'Importe o suma asegurada', type: 'money', display: money, hint: 'En seguros registra la suma asegurada: no se suma como activo.' },
  { name: 'notes', label: 'Notas', type: 'textarea', required: false },
];

const columns = [
  { key: 'type', label: 'Tipo', render: (r) => PROTECTION_TYPES[r.type] },
  { key: 'name', label: 'Nombre' },
  { key: 'amount', label: 'Importe', align: 'right', render: (r) => `${money(r.amount)}${INSURANCE_TYPES.includes(r.type) ? ' (cobertura)' : ''}` },
];

function Body() {
  const { api } = useWorkspace();
  const { summary: s, reload, period } = usePeriodSummary();
  const hist = useAsync(() => api.get('/periods/history'), [api, period?.id]);
  const patrimonial = usePatrimonial();
  const i = s?.indicators;
  return (
    <>
      <PageHeader title={tr('Protección financiera')} subtitle={tr('Antes de hacer crecer el patrimonio, revisa cómo lo proteges')} />
      <ClosedNotice />
      <Notice>
        {tr('Construir patrimonio no solamente significa hacerlo crecer. También significa protegerlo frente a acontecimientos que puedan generar pérdidas financieras importantes. Registra aquí la liquidez que')}{' '}<b>no</b>{' '}{tr('hayas registrado como producto en Mi cartera, para no duplicar activos.')}
      </Notice>
      {s && (
        <StatGrid>
          <StatCard label={tr('Liquidez y reservas')} value={money(s.protection.total)} accent />
          <StatCard label={tr('Meses de gastos cubiertos')} value={i.monthsCovered === null ? 'N/D' : i.monthsCovered} delta={tr('Liquidez / gastos del periodo')} />
          <StatCard label={tr('Gastos médicos mayores')} value={i.hasMedicalInsurance ? 'Registrado' : tr('Sin registro')} />
          <StatCard label={tr('Seguro de vida')} value={i.hasLifeInsurance ? 'Registrado' : tr('Sin registro')} />
        </StatGrid>
      )}
      {patrimonial.data && (
        <div className="layout even">
          <EmergencyFundCard emergency={patrimonial.data.emergency} />
          <DebtCostCard debts={patrimonial.data.debts} />
        </div>
      )}
      <RecordManager endpoint="/protection" title={tr('Liquidez, fondo de emergencia, reservas y coberturas')} addLabel="+ Registrar"
        fields={fields} columns={columns} onChanged={() => { reload(); hist.reload(); patrimonial.reload(); }}
        toForm={(r) => ({ type: r.type, name: r.name, amount: Number(r.amount), notes: r.notes || '' })}
        emptyText={tr('Registra tu fondo de emergencia, liquidez y coberturas.')} />
      <Card title={tr('Evolución de la liquidez')}>
        <BarChart data={(hist.data || []).map((h) => ({ label: `${shortMonth(h.month)} ${String(h.year).slice(2)}`, value: h.liquidity }))} />
      </Card>
    </>
  );
}

export default function Protection() {
  return <RequirePeriod><Body /></RequirePeriod>;
}
