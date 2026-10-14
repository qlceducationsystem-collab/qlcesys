import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { money, pct, periodLabel, shortMonth, signedMoney, tone, dateTime } from '../../utils/format.js';
import { Card, PageHeader, Pill, ProgressBar, Row, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { BarChart } from '../../components/charts/Charts.jsx';
import { ReconciliationBanner } from '../../components/finance/Finance.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';

// Indicadores descriptivos calculados por el backend (no son recomendaciones).
function Indicators({ s }) {
  const i = s.indicators;
  return (
    <Card title="Indicadores de tu estructura">
      <Row label="Liquidez / gastos mensuales" value={i.monthsCovered === null ? 'N/D' : `${i.monthsCovered} meses`} />
      <Row label="Seguro de gastos médicos mayores" value={<Pill variant={i.hasMedicalInsurance ? '' : 'warn'}>{i.hasMedicalInsurance ? 'Registrado' : 'Sin registro'}</Pill>} />
      <Row label="Seguro de vida" value={<Pill variant={i.hasLifeInsurance ? '' : 'warn'}>{i.hasLifeInsurance ? 'Registrado' : 'Sin registro'}</Pill>} />
      <Row label="Deuda / activos" value={pct(i.debtToAssets)} />
      <Row label="Pagos de deuda / ingresos" value={pct(i.debtPaymentToIncome)} />
      <Row label="Exposición a alto riesgo" value={pct(i.highRiskShare)} />
      <Row label="Mayor concentración" value={i.topCategory ? `${i.topCategory.name} · ${pct(i.topCategory.share)}` : '—'} />
      <p className="small muted">Datos calculados a partir de tu información registrada. Úsalos para analizar tu estructura, no como recomendación.</p>
    </Card>
  );
}

function DashboardBody({ d }) {
  const { basePath, period } = useWorkspace();
  const s = d.summary;
  const prev = d.history.length > 1 ? d.history[d.history.length - 2] : null;
  const evolution = d.history.map((h) => ({ label: `${shortMonth(h.month)} ${String(h.year).slice(2)}`, value: h.netWorth, hint: `Patrimonio final cartera ${money(h.final)}` }));

  return (
    <>
      <PageHeader title="Mi situación financiera" subtitle={`Resumen de tu estructura financiera · ${periodLabel(d.period)}`} />
      {!s.reconciliation.reconciled && <ReconciliationBanner reconciliation={s.reconciliation} />}
      <StatGrid>
        <StatCard label="Ingresos mensuales" value={money(s.cashflow.income)}
          delta={prev ? `${signedMoney(s.cashflow.income - prev.income)} vs. mes anterior` : null} deltaTone={prev ? tone(s.cashflow.income - prev.income) : ''} />
        <StatCard label="Gastos mensuales" value={money(s.cashflow.expenses)} delta={`Capacidad de ahorro: ${money(s.cashflow.savings)}`} />
        <StatCard label="Inversiones" value={money(s.portfolio.global.final)} delta={`${pct(s.portfolio.global.roi, { signed: true })} en el periodo`} deltaTone={tone(s.portfolio.global.roi)} />
        <StatCard label="Patrimonio neto" value={money(s.balanceSheet.netWorth)} accent
          delta={prev ? `${signedMoney(s.balanceSheet.netWorth - prev.netWorth)} este mes` : 'Activos − pasivos'} deltaTone={prev ? tone(s.balanceSheet.netWorth - prev.netWorth) : ''} />
      </StatGrid>
      <StatGrid>
        <StatCard label="Liquidez" value={money(s.protection.total)} />
        <StatCard label="Deuda total" value={money(s.debts.totalBalance)} delta={`Pagos: ${money(s.debts.totalPayment)}`} />
        <StatCard label="Patrimonio final del periodo" value={money(s.patrimony.final)} delta={`Variación ${signedMoney(s.patrimony.variation)}`} deltaTone={tone(s.patrimony.variation)} />
        <StatCard label="Estado del periodo" value={period?.status === 'CLOSED' ? 'Cerrado' : 'Abierto'}
          delta={s.reconciliation.reconciled ? 'Patrimonio conciliado' : 'Información no conciliada'} deltaTone={s.reconciliation.reconciled ? 'up' : 'down'} />
      </StatGrid>

      <div className="layout">
        <Card title="Evolución patrimonial (patrimonio neto)">
          <BarChart data={evolution} ariaLabel="Evolución del patrimonio neto por periodo" />
        </Card>
        <Indicators s={s} />
      </div>

      <div className="layout">
        <Card title="Academia financiera" actions={<Link className="btn-secondary" to={`${basePath}/academia`}>Ir a la academia</Link>}>
          <div className="label">Mes de suscripción {d.academy.currentMonth} · {d.academy.completed} de {d.academy.total} módulos completados</div>
          <ProgressBar value={d.academy.progressPct} label="Progreso de la academia" />
          {d.academy.current ? (
            <p className="muted">Módulo actual: <b>Mes {d.academy.current.month} · {d.academy.current.title}</b></p>
          ) : <p className="muted">Sin módulos pendientes por ahora.</p>}
        </Card>
        <Card title="Próxima asesoría">
          {d.nextAppointment
            ? <Row label={d.nextAppointment.reason} value={dateTime(d.nextAppointment.scheduledAt)} />
            : <div className="row"><span>Sin cita programada</span><Link className="btn-secondary" to={`${basePath}/asesoria`}>Agendar</Link></div>}
        </Card>
      </div>

      <div className="hero">
        <h2>Tu patrimonio se construye con tiempo</h2>
        <p>Las inversiones pueden ser una segunda fuente de ingresos, pero no deben plantearse como un camino para enriquecerse de la noche a la mañana. Antes de asumir riesgos, considera protección, liquidez, deudas, objetivos y diversificación.</p>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { api, period } = useWorkspace();
  const res = useAsync(() => api.get(`/dashboard?periodId=${period?.id || ''}`), [api, period?.id], { enabled: !!period });
  return (
    <RequirePeriod>
      <AsyncView {...res} onRetry={res.reload}>
        {(d) => (d.summary ? <DashboardBody d={d} /> : null)}
      </AsyncView>
    </RequirePeriod>
  );
}
