import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime, money, pct, periodLabel, shortMonth, signedMoney, tone, utcDateTime } from '../../utils/format.js';
import { MODULE_STATE } from '../../utils/labels.js';
import { Card, PageHeader, Pill, ProgressBar, Row, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { AsyncView, Loading } from '../../components/ui/States.jsx';
import { BarChart } from '../../components/charts/Charts.jsx';
import { ReconciliationBanner } from '../../components/finance/Finance.jsx';
import { AllocationBars, READING_TONE, ReadingCard } from '../../features/academy/AllocationView.jsx';
import { modulePath } from '../../features/academy/useAcademy.js';
import { Block2Summary, EmergencyFundCard } from '../../features/patrimonial/PatrimonialCards.jsx';
import { CurrencySelect } from '../../context/CurrencyContext.jsx';
import { tr } from '../../i18n/tr.js';

function Onboarding({ academy }) {
  const { basePath } = useWorkspace();
  return (
    <div className="onboarding">
      <div className="section-kicker">{tr('Bienvenido')}</div>
      <h1>{tr('Comencemos por tu punto de partida')}</h1>
      <p className="subtitle">{tr('El Módulo 1 crea tu diagnóstico financiero inicial. Con él se construyen Inicio, Patrimonio, Ingresos y gastos y Mi cartera.')}</p>
      <div className="onboarding-steps">
        {academy.block1.slice(0, 3).map((m) => (
          <div key={m.number} className={`onboarding-step state-${m.state}`}>
            <span>{m.number}</span>
            <div><b>{tr(m.title)}</b><small>{tr(MODULE_STATE[m.state].label)}</small></div>
          </div>
        ))}
      </div>
      <Link className="btn-primary" to={modulePath(basePath, 1)}>{tr('Iniciar diagnóstico financiero →')}</Link>
    </div>
  );
}

function AcademyCard({ academy }) {
  const { basePath } = useWorkspace();
  return (
    <Card title={tr('Academia · Bloque 1')} actions={<Link className="btn-secondary" to={`${basePath}/academia`}>{tr('Ver programa')}</Link>}>
      <div className="mini-steps">
        {academy.block1.map((m) => (
          <span key={m.number} className={`mini-step state-${m.state}`} title={`${tr(m.title)} · ${MODULE_STATE[m.state].label}`}>{m.state === 'COMPLETED' ? '✓' : m.number}</span>
        ))}
      </div>
      <ProgressBar value={academy.progressPct} label={tr('Progreso del bloque 1')} />
      <p className="muted small">{academy.progressPct}{tr('% completado')}{academy.next ? tr(' · Siguiente: M{n} {title}', { n: academy.next.number, title: tr(academy.next.title) }) : ''}</p>
      {academy.next && <Link className="btn-primary" to={modulePath(basePath, academy.next.number)}>{tr('Continuar')}</Link>}
    </Card>
  );
}

function DiagnosisCard({ diagnosis, liquidity, expenses }) {
  const { basePath } = useWorkspace();
  if (!diagnosis) {
    return (
      <Card title={tr('Diagnóstico financiero')}>
        <p className="muted">{tr('Aún no generas tu diagnóstico inicial.')}</p>
        <Link className="btn-secondary" to={modulePath(basePath, 1)}>{tr('Ir al Módulo 1')}</Link>
      </Card>
    );
  }
  const r = diagnosis.result;
  const months = expenses > 0 ? liquidity / expenses : null;
  return (
    <Card title="Diagnóstico financiero (línea base)" actions={<span className="small muted">{dateTime(diagnosis.savedAt)}</span>}>
      <Row label={tr('Tasa de ahorro')} value={pct(r.savingRate)} sub={r.savingLevel?.label} />
      <Row label={tr('Meses de liquidez')} value={months === null ? 'N/D' : tr('{n} meses', { n: months.toFixed(1) })} sub={tr('{liquidity} de liquidez ÷ {expenses} de gastos mensuales del periodo', { liquidity: money(liquidity), expenses: money(expenses) })} />
      <Row label={tr('Inversión / patrimonio')} value={pct(r.investmentToNetWorth)} />
      <Row label={tr('Deuda / patrimonio')} value={pct(r.debtToNetWorth)} />
      <Row label={tr('Flujo disponible')} value={money(r.freeCashFlow)} valueTone="auto" />
    </Card>
  );
}

function DashboardBody({ d }) {
  const { period } = useWorkspace();
  const s = d.summary;
  const prev = d.history.length > 1 ? d.history[d.history.length - 2] : null;
  const liquidity = (d.allocation?.shares.find((x) => x.key === 'LIQUIDEZ')?.amount || 0) + s.protection.total;
  const evolution = d.history.map((h) => ({ label: `${shortMonth(h.month)} ${String(h.year).slice(2)}`, value: h.netWorth }));

  return (
    <>
      <PageHeader title={tr('Mi situación financiera')} subtitle={tr('Resumen de tu estructura financiera · {period}', { period: periodLabel(d.period) })} actions={<CurrencySelect />} />
      {!s.reconciliation.reconciled && <ReconciliationBanner reconciliation={s.reconciliation} />}
      <StatGrid>
        <StatCard label={tr('Ingresos mensuales')} value={money(s.cashflow.income)} delta={prev ? tr('{amount} vs. mes anterior', { amount: signedMoney(s.cashflow.income - prev.income) }) : null} deltaTone={prev ? tone(s.cashflow.income - prev.income) : ''} />
        <StatCard label={tr('Gastos mensuales')} value={money(s.cashflow.expenses)} delta={tr('Capacidad de ahorro: {amount}', { amount: money(s.cashflow.savings) })} />
        <StatCard label={tr('Inversiones y activos')} value={money(s.portfolio.global.final)} delta={tr('{n} productos en Mi cartera', { n: s.portfolio.products.length })} />
        <StatCard label={tr('Patrimonio neto')} value={money(s.balanceSheet.netWorth)} accent delta={prev ? tr('{amount} este mes', { amount: signedMoney(s.balanceSheet.netWorth - prev.netWorth) }) : tr('Activos − pasivos')} deltaTone={prev ? tone(s.balanceSheet.netWorth - prev.netWorth) : ''} />
      </StatGrid>
      <StatGrid>
        <StatCard label={tr('Liquidez')} value={money(liquidity)} />
        <StatCard label={tr('Deuda total')} value={money(s.debts.totalBalance)} delta={`Pagos: ${money(s.debts.totalPayment)}`} />
        <StatCard label={tr('Lectura de cartera')} value={d.allocation?.reading ? tr(d.allocation.reading.label) : tr('Sin datos')} valueTone={READING_TONE[d.allocation?.reading?.key]} delta={d.allocation?.reading ? `${d.allocation.reading.score} / 100 · educativa` : tr('Registra productos en M2')} />
        <StatCard label={tr('Estado del periodo')} value={period?.status === 'CLOSED' ? tr('Cerrado') : tr('Abierto')} delta={s.reconciliation.reconciled ? tr('Patrimonio conciliado') : tr('Información no conciliada')} deltaTone={s.reconciliation.reconciled ? 'up' : 'down'} />
      </StatGrid>
      <div className="layout">
        <AcademyCard academy={d.academy} />
        <DiagnosisCard diagnosis={d.diagnosis} liquidity={liquidity} expenses={s.cashflow.expenses} />
      </div>
      <div className="layout">
        <Block2Summary patrimonial={d.patrimonial} academy={d.academy} />
        <EmergencyFundCard emergency={d.patrimonial.emergency} />
      </div>
      <div className="layout">
        <Card title={tr('Allocation actual')}>
          {d.allocation?.total ? <AllocationBars allocation={d.allocation} /> : <p className="muted">{tr('Registra tus productos en el Módulo 2 para ver tu distribución.')}</p>}
        </Card>
        <ReadingCard reading={d.allocation?.reading} shares={d.allocation?.shares} />
      </div>
      <div className="layout">
        <Card title="Evolución patrimonial (patrimonio neto)"><BarChart data={evolution} ariaLabel={tr('Evolución del patrimonio neto')} /></Card>
        <Card title={tr('Próxima asesoría')}>
          {d.nextAppointment ? <Row label={d.nextAppointment.reason} value={utcDateTime(d.nextAppointment.scheduledAt)} /> : <p className="muted">{tr('Sin cita programada.')}</p>}
          <Pill variant="muted">{tr('Herramienta educativa: no constituye asesoría de inversión')}</Pill>
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
