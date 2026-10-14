import { NavLink } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { BLOCK_TITLES, MODULE_STATE } from '../../utils/labels.js';
import { ProgressBar } from '../../components/ui/Card.jsx';
import { modulePath } from './useAcademy.js';

function StepLink({ to, number, title, state, end }) {
  const meta = MODULE_STATE[state] || MODULE_STATE.AVAILABLE;
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `ml-step tone-${meta.tone} ${isActive ? 'is-active' : ''}`}>
      <span className="ml-step-n" aria-hidden="true">{state === 'COMPLETED' ? '✓' : number}</span>
      <span className="ml-step-text">
        <b>{title}</b>
        <small>{meta.label}</small>
      </span>
    </NavLink>
  );
}

export function ModuleNav({ overview }) {
  const { basePath } = useWorkspace();
  const [m1, m2, m3, m4, m5, m6] = overview.block1;
  const step = (m) => <StepLink key={m.number} to={modulePath(basePath, m.number)} number={m.number} title={m.title} state={m.state} />;
  return (
    <nav className="ml-nav" aria-label="Módulos de la academia">
      <div className="ml-nav-group">Bloque 1 · {BLOCK_TITLES[1]}</div>
      {[m1, m2, m3].map(step)}
      <StepLink
        to={`${basePath}/academia/ruta`}
        number="R"
        title="Selección de ruta"
        state={overview.route ? 'COMPLETED' : overview.routeAvailable ? 'AVAILABLE' : 'LOCKED_ORDER'}
      />
      {overview.route !== 'PATRIMONIAL' && (
        <>
          <StepLink
            to={`${basePath}/academia/filtro`}
            number="F"
            title="Filtro de mercados"
            state={overview.filter.passed ? 'COMPLETED' : overview.route === 'MARKETS' || overview.access.mode === 'TOOLS' ? 'AVAILABLE' : 'LOCKED_ROUTE'}
          />
          {[m4, m5, m6].map(step)}
        </>
      )}
      <div className="ml-nav-group">Bloque 2 · {BLOCK_TITLES[2]}</div>
      {overview.block2.map(step)}
    </nav>
  );
}

export function ModuleLayout({ overview, block = 1, kicker, title, subtitle, actions, children }) {
  const progress = block === 2 ? overview.block2ProgressPct : overview.progressPct;
  return (
    <div className="ml">
      <header className="ml-header">
        <div className="ml-crumbs">
          <span>QLC Financial Education</span>
          <span aria-hidden="true">/</span>
          <span>Bloque {block}</span>
          {kicker && (<><span aria-hidden="true">/</span><b>{kicker}</b></>)}
        </div>
        <div className="ml-title-row">
          <div>
            <h1>{title}</h1>
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
          {actions}
        </div>
        <div className="ml-progress">
          <ProgressBar value={progress} label={`Progreso del bloque ${block}`} />
          <span>{progress}% del bloque {block}</span>
        </div>
      </header>
      <div className="ml-body">
        <aside className="ml-aside"><ModuleNav overview={overview} /></aside>
        <div className="ml-content">{children}</div>
      </div>
    </div>
  );
}
