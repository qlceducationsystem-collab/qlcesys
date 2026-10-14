import { Link } from 'react-router-dom';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';
import { MODULE_STATE } from '../../../utils/labels.js';
import { AsyncView } from '../../../components/ui/States.jsx';
import { Pill, ProgressBar } from '../../../components/ui/Card.jsx';
import { AccessOffers } from '../../../features/access/AccessOffers.jsx';
import { modulePath, useAcademy } from '../../../features/academy/useAcademy.js';

const PILL = { good: '', info: '', warn: 'warn', muted: 'muted', bad: 'bad' };

function ModuleTile({ m, to }) {
  const meta = MODULE_STATE[m.state];
  const open = m.state === 'AVAILABLE' || m.state === 'COMPLETED';
  const body = (
    <>
      <div className="tile-top">
        <span className="tile-n">{String(m.number).padStart(2, '0')}</span>
        <Pill variant={PILL[meta.tone]}>{meta.label}</Pill>
      </div>
      <h3>{m.title}</h3>
      <p>{m.summary}</p>
      <span className="tile-cta">{m.state === 'COMPLETED' ? 'Revisar módulo →' : open ? 'Entrar al módulo →' : ''}</span>
    </>
  );
  return open || to.admin ? <Link className={`module-tile state-${m.state}`} to={to.path}>{body}</Link> : <div className={`module-tile state-${m.state}`}>{body}</div>;
}

export default function AcademyHome() {
  const { basePath, isAdminView } = useWorkspace();
  const res = useAcademy();
  return (
    <AsyncView {...res} onRetry={res.reload}>
      {(a) => (
        <div className="academy">
          <header className="academy-hero">
            <div>
              <div className="section-kicker">Academia financiera</div>
              <h1>2 bloques · 12 módulos</h1>
              <p className="subtitle">Educación → herramienta → ejercicio → registro → seguimiento. Cada módulo utiliza la información construida en el anterior.</p>
            </div>
            <div className="academy-progress">
              <span>Bloque 1</span>
              <strong>{a.progressPct}%</strong>
              <ProgressBar value={a.progressPct} label="Progreso del bloque 1" />
              {a.next && <Link className="btn-primary" to={modulePath(basePath, a.next.number)}>Continuar con M{a.next.number}</Link>}
            </div>
          </header>

          {a.access.mode === 'NONE' && !isAdminView && <AccessOffers compact />}

          <section className="academy-block">
            <div className="block-head">
              <h2>Bloque 1 · Fundamentos, inversión y riesgo</h2>
              <span className="muted small">{a.access.mode === 'TOOLS' ? 'Modalidad: solo herramientas' : 'Modalidad: academia completa'}</span>
            </div>
            <div className="tiles">
              {a.block1.slice(0, 3).map((m) => <ModuleTile key={m.number} m={m} to={{ path: modulePath(basePath, m.number), admin: isAdminView }} />)}
            </div>
            <div className="route-strip">
              <div>
                <b>Después del Módulo 3 eliges tu ruta</b>
                <span>Ruta de Mercados (M4–M6, opcional) o Ruta Patrimonial (M7–M12).</span>
              </div>
              <div className="route-strip-actions">
                {a.route && <Pill>{a.route === 'MARKETS' ? 'Ruta de Mercados' : 'Ruta Patrimonial'}</Pill>}
                {a.filter.passed && <Pill>Filtro aprobado</Pill>}
                <Link className={`btn-secondary ${a.routeAvailable || isAdminView ? '' : 'is-disabled'}`} to={`${basePath}/academia/ruta`}>Selección de ruta</Link>
              </div>
            </div>
            <div className="tiles">
              {a.block1.slice(3).map((m) => <ModuleTile key={m.number} m={m} to={{ path: modulePath(basePath, m.number), admin: isAdminView }} />)}
            </div>
          </section>

          <section className="academy-block">
            <div className="block-head">
              <h2>Bloque 2 · Organización y crecimiento patrimonial</h2>
              <span className="muted small">Bloque 2 disponible en una siguiente etapa</span>
            </div>
            <div className="tiles is-muted">
              {a.block2.map((m) => (
                <div key={m.number} className="module-tile state-COMING_SOON">
                  <div className="tile-top"><span className="tile-n">{String(m.number).padStart(2, '0')}</span><Pill variant="muted">Siguiente etapa</Pill></div>
                  <h3>{m.title}</h3>
                  <p>{m.summary}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AsyncView>
  );
}
