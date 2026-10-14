import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime, money, pct, periodLabel, shortMonth, signedMoney, tone } from '../../utils/format.js';
import { MODULE_STATE } from '../../utils/labels.js';
import { Card, PageHeader, Pill, ProgressBar, Row, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { AsyncView, Loading } from '../../components/ui/States.jsx';
import { BarChart } from '../../components/charts/Charts.jsx';
import { ReconciliationBanner } from '../../components/finance/Finance.jsx';
import { AllocationBars, ReadingCard } from '../../features/academy/AllocationView.jsx';
import { modulePath } from '../../features/academy/useAcademy.js';
import { Block2Summary, EmergencyFundCard } from '../../features/patrimonial/PatrimonialCards.jsx';

function Onboarding({ academy }) {
  const { basePath } = useWorkspace();
  return (
    <div className="onboarding">
      <div className="section-kicker">Bienvenido</div>
      <h1>Comencemos por tu punto de partida</h1>
      <p className="subtitle">El Módulo 1 crea tu diagnóstico financiero inicial. Con él se construyen Inicio, Patrimonio, Ingresos y gastos y Mi cartera.</p>
      <div className="onboarding-steps">
        {academy.block1.slice(0, 3).map((m) => (
          <div key={m.number} className={`onboarding-step state-${m.state}`}>
            <span>{m.number}</span>
            <div><b>{m.title}</b><small>{MODULE_STATE[m.state].label}</small></div>
          </div>
        ))}
      </div>
      <Link className="btn-primary" to={modulePath(basePath, 1)}>Iniciar diagnóstico financiero →</Link>
    </div>
  );
}

function AcademyCard({ academy }) {
  const { basePath } = useWorkspace();
  return (
    <Card title="Academia · Bloque 1" actions={<Link className="btn-secondary" to={`${basePath}/academia`}>Ver programa</Link>}>
      <div className="mini-steps">
        {academy.block1.map((m) => (
          <span key={m.number} className={`mini-step state-${m.state}`} title={`${m.title} · ${MODULE_STATE[m.state].label}`}>{m.state === 'COMPLETED' ? '✓' : m.number}</span>
        ))}
      </div>
      <ProgressBar value={academy.progressPct} label="Progreso del bloque 1" />
      <p className="muted small">{academy.progressPct}% completado{academy.next ? ` · Siguiente: M${academy.next.number} ${academy.next.title}` : ''}</p>
      {academy.next && <Link className="btn-primary" to={modulePath(basePath, academy.next.number)}>Continuar</Link>}
    </Card>
  );
}

function DiagnosisCard({ diagnosis }) {
  const { basePath } = useWorkspace();
  if (!diagnosis) {
    return (
      <Card title="Diagnóstico financiero">
        <p className="muted">Aún no generas tu diagnóstico inicial.</p>
        <Link className="btn-secondary" to={modulePath(basePath, 1)}>Ir al Módulo 1</Link>
      </Card>
    );
  }
  const r = diagnosis.result;
  return (
    <Card title="Diagnóstico financiero (línea base)" actions={<span className="small muted">{dateTime(diagnosis.savedAt)}</span>}>
      <Row label="Tasa de ahorro" value={pct(r.savingRate)} sub={r.savingLevel?.label} />
      <Row label="Meses de liquidez" value={r.liquidityMonths === null ? 'N/D' : `${r.liquidityMonths.toFixed(1)} meses`} />
      <Row label="Inversión / patrimonio" value={pct(r.investmentToNetWorth)} />
      <Row label="Deuda / patrimonio" value={pct(r.debtToNetWorth)} />
      <Row label="Flujo disponible" value={money(r.freeCashFlow)} valueTone="auto" />
    </Card>
  );
}

function DashboardBody({ d }) {
  const { period } = useWorkspace();
  const s = d.summary;
  const prev = d.history.length > 1 ? d.history[d.history.length - 2] : null;
  const evolution = d.history.map((h) => ({ label: `${shortMonth(h.month)} ${String(h.year).slice(2)}`, value: h.netWorth }));

  return (
    <>
      <PageHeader title="Mi situación financiera" subtitle={`Resumen de tu estructura financiera · ${periodLabel(d.period)}`} />
      {!s.reconciliation.reconciled && <ReconciliationBanner reconciliation={s.reconciliation} />}
      <StatGrid>
        <StatCard label="Ingresos mensuales" value={money(s.cashflow.income)} delta={prev ? `${signedMoney(s.cashflow.income - prev.income)} vs. mes anterior` : null} deltaTone={prev ? tone(s.cashflow.income - prev.income) : ''} />
        <StatCard label="Gastos mensuales" value={money(s.cashflow.expenses)} delta={`Capacidad de ahorro: ${money(s.cashflow.savings)}`} />
        <StatCard label="Inversiones y activos" value={money(s.portfolio.global.final)} delta={`${s.portfolio.products.length} productos en Mi cartera`} />
        <StatCard label="Patrimonio neto" value={money(s.balanceSheet.netWorth)} accent delta={prev ? `${signedMoney(s.balanceSheet.netWorth - prev.netWorth)} este mes` : 'Activos − pasivos'} deltaTone={prev ? tone(s.balanceSheet.netWorth - prev.netWorth) : ''} />
      </StatGrid>
      <StatGrid>
        <StatCard label="Liquidez" value={money((d.allocation?.shares.find((x) => x.key === 'LIQUIDEZ')?.amount || 0) + s.protection.total)} />
        <StatCard label="Deuda total" value={money(s.debts.totalBalance)} delta={`Pagos: ${money(s.debts.totalPayment)}`} />
        <StatCard label="Lectura de cartera" value={d.allocation?.reading?.label || 'Sin datos'} delta={d.allocation?.reading ? `${d.allocation.reading.score} / 100 · educativa` : 'Registra productos en M2'} />
        <StatCard label="Estado del periodo" value={period?.status === 'CLOSED' ? 'Cerrado' : 'Abierto'} delta={s.reconciliation.reconciled ? 'Patrimonio conciliado' : 'Información no conciliada'} deltaTone={s.reconciliation.reconciled ? 'up' : 'down'} />
      </StatGrid>
      <div className="layout">
        <AcademyCard academy={d.academy} />
        <DiagnosisCard diagnosis={d.diagnosis} />
      </div>
      <div className="layout">
        <Block2Summary patrimonial={d.patrimonial} academy={d.academy} />
        <EmergencyFundCard emergency={d.patrimonial.emergency} />
      </div>
      <div className="layout">
        <Card title="Allocation actual">
          {d.allocation?.total ? <AllocationBars allocation={d.allocation} /> : <p className="muted">Registra tus productos en el Módulo 2 para ver tu distribución.</p>}
        </Card>
        <ReadingCard reading={d.allocation?.reading} />
      </div>
      <div className="layout">
        <Card title="Evolución patrimonial (patrimonio neto)"><BarChart data={evolution} ariaLabel="Evolución del patrimonio neto" /></Card>
        <Card title="Próxima asesoría">
          {d.nextAppointment ? <Row label={d.nextAppointment.reason} value={dateTime(d.nextAppointment.scheduledAt)} /> : <p className="muted">Sin cita programada.</p>}
          <Pill variant="muted">Herramienta educativa: no constituye asesoría de inversión</Pill>
        </Card>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { api, period, periodsState } = useWorkspace();
  const res = useAsync(() => api.get(`/dashboard${period ? `?periodId=${period.id}` : ''}`), [api, period?.id], { enabled: !periodsState.loading });
  if (periodsState.loading) return <Loading />;
  return (
    <AsyncView {...res} onRetry={res.reload}>
      {(d) => (d.summary ? <DashboardBody d={d} /> : <Onboarding academy={d.academy} />)}
    </AsyncView>
  );
}
