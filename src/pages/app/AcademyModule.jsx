import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime } from '../../utils/format.js';
import { Card, Notice, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, Textarea } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';

// Educación → Herramienta → Ejercicio → Registro → Seguimiento
function ModuleBody({ m, reload }) {
  const { api, basePath, canEdit } = useWorkspace();
  const [exercise, setExercise] = useState(m.exercise || '');
  const [state, setState] = useState({ saving: false, error: null, saved: false });
  useEffect(() => setExercise(m.exercise || ''), [m.exercise]);
  const c = m.content;
  const toolPath = c.tool?.path?.replace(/^\/app/, basePath);

  const save = async (status) => {
    setState({ saving: true, error: null, saved: false });
    try {
      await api.put(`/academy/modules/${m.month}/progress`, { status, exercise });
      setState({ saving: false, error: null, saved: true });
      reload();
    } catch (error) {
      setState({ saving: false, error, saved: false });
    }
  };

  return (
    <>
      <Link className="btn-secondary back" to={`${basePath}/academia`}>← Academia</Link>
      <PageHeader kicker={m.block === 1 ? `Nivel ${m.month}` : `Mes ${m.month}`} title={m.title} subtitle={m.summary}
        actions={<Pill variant={m.status === 'COMPLETED' ? '' : 'warn'}>{m.status === 'COMPLETED' ? 'Completado' : m.status === 'IN_PROGRESS' ? 'En curso' : 'Sin iniciar'}</Pill>} />

      <div className="steps-strip">
        {['Educación', 'Herramienta', 'Ejercicio', 'Registro', 'Seguimiento'].map((s, i) => <span key={s}><b>{i + 1}</b>{s}</span>)}
      </div>

      <Card title="1 · Educación" className="lesson-card">
        {c.sections.map((s) => (
          <div key={s.title} className="lesson-section">
            <h4>{s.title}</h4>
            {s.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        ))}
        {c.keyIdeas?.length > 0 && <div className="gold-note"><b>Ideas clave</b><ul>{c.keyIdeas.map((k) => <li key={k}>{k}</li>)}</ul></div>}
        {c.riskNote && <div className="notice warn-notice"><b>Advertencia de riesgo:</b> {c.riskNote}</div>}
      </Card>

      {c.tool && (
        <Card title="2 · Herramienta">
          <div className="row">
            <span><b>{c.tool.name}</b><span className="small block">{c.tool.description}</span></span>
            <Link className="btn-primary" to={toolPath}>Abrir herramienta</Link>
          </div>
        </Card>
      )}

      <Card title="3 · Ejercicio y 4 · Registro">
        <p>{c.exercise.prompt}</p>
        <ol className="muted">{c.exercise.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        <Field label="Tu registro del ejercicio">
          <Textarea value={exercise} onChange={(e) => setExercise(e.target.value)} maxLength={5000} disabled={!canEdit} placeholder="Escribe aquí tus respuestas y conclusiones…" />
        </Field>
        {m.toolData && (
          <Notice>Resultado guardado de la herramienta ({dateTime(m.toolData.savedAt)}): <b>{m.toolData.tool}</b></Notice>
        )}
        <FormError error={state.error} />
        {state.saved && <p className="small up">Registro guardado.</p>}
        {canEdit && (
          <div className="form-actions">
            <Button variant="secondary" loading={state.saving} onClick={() => save('IN_PROGRESS')}>Guardar avance</Button>
            <Button loading={state.saving} onClick={() => save('COMPLETED')}>Marcar como completado</Button>
          </div>
        )}
      </Card>

      <Card title="5 · Seguimiento"><p className="muted">{c.tracking}</p></Card>
    </>
  );
}

export default function AcademyModule() {
  const { month } = useParams();
  const { api } = useWorkspace();
  const res = useAsync(() => api.get(`/academy/modules/${month}`), [api, month]);
  return <AsyncView {...res} onRetry={res.reload}>{(m) => <ModuleBody m={m} reload={res.reload} />}</AsyncView>;
}
