import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { date } from '../../utils/format.js';
import { Card, PageHeader, Pill, ProgressBar } from '../../components/ui/Card.jsx';
import { AsyncView } from '../../components/ui/States.jsx';

const STATUS = { NOT_STARTED: ['Comenzar', ''], IN_PROGRESS: ['Continuar', 'warn'], COMPLETED: ['Completado', ''] };

function ModuleCard({ m, basePath }) {
  const [label, variant] = STATUS[m.status];
  return (
    <div className={`module-card ${m.unlocked ? '' : 'locked'}`}>
      <div className="module-top">
        <span className="section-kicker">{m.block === 1 ? `Nivel ${m.month}` : `Mes ${m.month}`}</span>
        {m.unlocked ? <Pill variant={variant}>{m.status === 'COMPLETED' ? 'Completado' : m.status === 'IN_PROGRESS' ? 'En curso' : 'Disponible'}</Pill> : <Pill variant="bad">Bloqueado</Pill>}
      </div>
      <h3>{m.title}</h3>
      <p>{m.summary}</p>
      {m.tool && <p className="small">Herramienta: <b>{m.tool.name}</b></p>}
      {m.unlocked ? (
        <Link className="btn-secondary" to={`${basePath}/academia/${m.month}`}>{label}</Link>
      ) : (
        <span className="small muted">🔒 {m.unlocksAt ? `Se desbloquea el ${date(m.unlocksAt)}` : 'Disponible con tu membresía activa'}</span>
      )}
    </div>
  );
}

export default function Academy() {
  const { api, basePath } = useWorkspace();
  const res = useAsync(() => api.get('/academy'), [api]);
  return (
    <AsyncView {...res} onRetry={res.reload}>
      {(a) => (
        <>
          <PageHeader title="Academia financiera" subtitle="Aprende antes de tomar decisiones" actions={<div className="month">Progreso · {a.progressPct}%</div>} />
          <Card>
            <div className="label">Mes de suscripción {a.currentMonth} · {a.unlocked} módulos desbloqueados · {a.pending} pendientes · {a.completed} completados</div>
            <ProgressBar value={a.progressPct} label="Progreso" />
            <p className="small muted">Cada mes se desbloquea una unidad: Educación → Herramienta → Ejercicio → Registro → Seguimiento.</p>
          </Card>
          <h2 className="block-title">Primer bloque · Inversión y riesgo</h2>
          <div className="cards3">{a.modules.filter((m) => m.block === 1).map((m) => <ModuleCard key={m.id} m={m} basePath={basePath} />)}</div>
          <h2 className="block-title">Segundo bloque · Organización patrimonial</h2>
          <div className="cards3">{a.modules.filter((m) => m.block === 2).map((m) => <ModuleCard key={m.id} m={m} basePath={basePath} />)}</div>
        </>
      )}
    </AsyncView>
  );
}
