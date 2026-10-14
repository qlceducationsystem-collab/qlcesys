import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime, money, pct, signedMoney } from '../../utils/format.js';
import { BUDGET_LABELS, ESSENTIAL_SOURCES } from '../../utils/labels.js';
import { Card, Pill, ProgressBar, Row } from '../../components/ui/Card.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { modulePath } from '../academy/useAcademy.js';

export function usePatrimonial() {
  const { api, period } = useWorkspace();
  return useAsync(() => api.get(`/periods/${period.id}/patrimonial`), [api, period?.id], { enabled: !!period });
}

const ModuleLink = ({ n, children }) => {
  const { basePath } = useWorkspace();
  return <Link className="btn-secondary" to={modulePath(basePath, n)}>{children}</Link>;
};

export function BudgetComparison({ budget }) {
  if (!budget) {
    return (
      <Card title="Presupuesto del mes" actions={<ModuleLink n={7}>Crear presupuesto (M7)</ModuleLink>}>
        <p className="muted">Aún no tienes un presupuesto para este mes. En el Módulo 7 planeas tu distribución y aquí comparas el plan con tus movimientos reales.</p>
      </Card>
    );
  }
  const v = budget.view;
  return (
    <Card title="Presupuesto planeado vs. real" actions={<ModuleLink n={7}>Editar en M7</ModuleLink>}>
      <div className="grid grid-3">
        <Row label="Gasto planeado" value={money(v.expensesPlanned)} />
        <Row label="Gasto real" value={money(v.expensesActual)} />
        <Row label="Desviación" value={signedMoney(v.expenseDifference)} valueTone={v.expenseDifference < 0 ? 'down' : 'up'} />
        <Row label="Ahorro planeado / real" value={`${money(v.savingsPlanned)} / ${money(v.savingsActual)}`} />
        <Row label="Inversión planeada / real" value={`${money(v.investmentPlanned)} / ${money(v.investmentActual)}`} />
        <Row label="Saldo estimado" value={money(v.estimatedBalance)} sub="No es saldo bancario" />
      </div>
      <DataTable
        rowKey="category"
        rows={v.rows}
        columns={[
          { key: 'category', label: 'Categoría', render: (r) => BUDGET_LABELS[r.category] },
          { key: 'planned', label: 'Planeado', align: 'right', render: (r) => money(r.planned) },
          { key: 'actual', label: 'Real', align: 'right', render: (r) => money(r.actual) },
          {
            key: 'difference', label: 'Desviación', align: 'right', render: (r) => (
              <span className={r.kind === 'EXPENSE' ? (r.difference < 0 ? 'down' : 'up') : r.status === 'MET' ? 'up' : 'warn-text'}>
                {r.kind === 'TARGET' && r.difference > 0 ? `Faltan ${money(r.difference)}` : signedMoney(r.difference)}
              </span>
            ),
          },
        ]}
      />
      <p className="small muted">El plan no crea movimientos: los importes reales provienen de tus ingresos, gastos y aportaciones confirmadas.</p>
    </Card>
  );
}

export function EmergencyFundCard({ emergency }) {
  if (!emergency?.saved) {
    return (
      <Card title="Fondo de emergencia" actions={<ModuleLink n={8}>Definir meta (M8)</ModuleLink>}>
        <p className="muted">Define en el Módulo 8 tu meta de reserva para ver aquí tu cobertura y el faltante.</p>
      </Card>
    );
  }
  const r = emergency.result;
  return (
    <Card title="Fondo de emergencia" actions={<ModuleLink n={8}>Ver en M8</ModuleLink>}>
      <Row label="Liquidez disponible" value={money(emergency.liquid.amount)} />
      {r.valid ? (
        <>
          <Row label="Meta de reserva" value={`${money(r.target)} · ${r.targetMonths} meses`} />
          <Row label="Meses cubiertos" value={r.monthsCovered.toFixed(1)} />
          <Row label="Faltante" value={money(r.gap)} valueTone={r.gap === 0 ? 'up' : 'warn-text'} />
          <ProgressBar value={r.progressVisual} label="Avance del fondo de emergencia" />
          <p className="small muted">{r.status === 'REACHED' ? 'Meta alcanzada.' : `${pct(r.progress)} de la meta.`} Gastos esenciales: {ESSENTIAL_SOURCES[emergency.essentialSource]}.</p>
        </>
      ) : <p className="muted small">Registra tus gastos esenciales para calcular la cobertura.</p>}
    </Card>
  );
}

export function DebtCostCard({ debts }) {
  if (!debts || !debts.count) return null;
  return (
    <Card title="Costo estimado de tus deudas" actions={<ModuleLink n={9}>Panel de obligaciones (M9)</ModuleLink>}>
      <Row label="Deuda total" value={money(debts.balance)} />
      <Row label="Pagos mensuales planeados" value={money(debts.payments)} />
      <Row label="Intereses + cargos estimados" value={money(debts.cost)} sub={debts.incomplete ? 'Incompleto: hay tasas pendientes' : 'Estimación mensual'} />
      <Row label="Pagos / ingreso" value={pct(debts.paymentToIncome)} />
    </Card>
  );
}

export function Block2Summary({ patrimonial, academy }) {
  const { basePath } = useWorkspace();
  const p = patrimonial;
  const e = p.emergency?.result;
  return (
    <Card title="Bloque 2 · Organización patrimonial" actions={<Link className="btn-secondary" to={`${basePath}/academia`}>Ver módulos</Link>}>
      <div className="mini-steps">
        {academy.block2.map((m) => (
          <span key={m.number} className={`mini-step state-${m.state}`} title={m.title}>{m.state === 'COMPLETED' ? '✓' : m.number}</span>
        ))}
      </div>
      <ProgressBar value={academy.block2ProgressPct} label="Progreso del bloque 2" />
      <Row label="Presupuesto del mes" value={p.budget ? signedMoney(p.budget.view.expenseDifference) : 'Sin presupuesto'} sub={p.budget ? 'Gasto planeado − real' : 'Módulo 7'} valueTone={p.budget ? (p.budget.view.expenseDifference < 0 ? 'down' : 'up') : ''} />
      <Row label="Fondo de emergencia" value={e?.valid ? `${e.monthsCovered.toFixed(1)} meses` : 'Sin datos'} sub={e?.valid ? `${pct(e.progressVisual)} de la meta` : 'Módulo 8'} />
      <Row label="Deuda total" value={money(p.debts?.balance ?? 0)} sub={`Pagos planeados ${money(p.debts?.payments ?? 0)}`} />
      <Row label="Ganancia neta estimada" value={p.estimates ? money(p.estimates.net) : 'Sin análisis'} sub={p.estimates ? 'Estimación · no es ingreso real' : 'Módulo 10'} />
      <Row label="Escenarios de inflación" value={`${p.simulations.scenarios} guardados`} sub="Simulaciones · no cambian tu patrimonio" />
      <Row label="Última revisión anual" value={p.annualReview ? signedMoney(p.annualReview.variation) : 'Sin revisión'} sub={p.annualReview ? `Guardada ${dateTime(p.annualReview.generatedAt)}` : 'Módulo 12'} />
      {p.annualReview?.storedInDrive && <Pill>PDF en Google Drive</Pill>}
    </Card>
  );
}
