import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime } from '../../utils/format.js';
import { APPOINTMENT_CHANNELS, APPOINTMENT_REASONS, APPOINTMENT_STATUS, options } from '../../utils/labels.js';
import { Card, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Field, FormError, FormGrid, Input, Select, Textarea } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';

const STATUS_VARIANT = { PENDING: 'warn', CONFIRMED: '', COMPLETED: '', CANCELLED: 'bad' };

function RequestForm({ onDone, onCancel }) {
  const { api } = useWorkspace();
  const [f, setF] = useState({ reason: APPOINTMENT_REASONS[0], date: '', time: '', durationMin: 60, channel: 'VIDEOLLAMADA', notes: '' });
  const [state, setState] = useState({ saving: false, error: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: null });
    try {
      const scheduledAt = new Date(`${f.date}T${f.time}`).toISOString();
      await api.post('/appointments', { reason: f.reason, scheduledAt, durationMin: Number(f.durationMin), channel: f.channel, notes: f.notes || null });
      onDone();
    } catch (error) {
      setState({ saving: false, error });
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <FormGrid>
        <Field label="Motivo" full><Select value={f.reason} onChange={set('reason')} options={APPOINTMENT_REASONS.map((r) => ({ value: r, label: r }))} /></Field>
        <Field label="Fecha"><Input type="date" required value={f.date} onChange={set('date')} min={new Date().toISOString().slice(0, 10)} /></Field>
        <Field label="Hora"><Input type="time" required value={f.time} onChange={set('time')} /></Field>
        <Field label="Duración"><Select value={f.durationMin} onChange={set('durationMin')} options={[30, 45, 60, 90].map((m) => ({ value: m, label: `${m} minutos` }))} /></Field>
        <Field label="Canal de atención"><Select value={f.channel} onChange={set('channel')} options={options.channel} /></Field>
        <Field label="Notas (opcional)" full><Textarea value={f.notes} onChange={set('notes')} maxLength={1000} /></Field>
      </FormGrid>
      <FormError error={state.error} />
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={state.saving}>Solicitar cita</Button>
      </div>
    </form>
  );
}

export default function Advisory() {
  const { api, canEdit } = useWorkspace();
  const res = useAsync(() => api.get('/appointments'), [api]);
  const [open, setOpen] = useState(false);
  const cancel = async (a) => {
    if (!window.confirm('¿Cancelar esta cita?')) return;
    await api.post(`/appointments/${a.id}/cancel`);
    res.reload();
  };

  return (
    <>
      <PageHeader title="Asesoría personalizada" subtitle="Sesiones educativas con cita"
        actions={canEdit && <Button onClick={() => setOpen(true)}>Solicitar cita</Button>} />
      <div className="cards3">
        <div className="module-card"><h3>Mis finanzas</h3><p>Resolver dudas sobre ingresos, gastos, ahorro y estructura financiera.</p></div>
        <div className="module-card"><h3>Mi cartera</h3><p>Revisar conceptos de diversificación, distribución y lectura de resultados.</p></div>
        <div className="module-card"><h3>Educación financiera</h3><p>Profundizar en los conceptos estudiados dentro de la academia.</p></div>
      </div>
      <AsyncView {...res} onRetry={res.reload}>
        {(list) => (
          <Card title="Mis citas">
            <DataTable rows={list} empty="Sin citas solicitadas." columns={[
              { key: 'scheduledAt', label: 'Fecha y hora', render: (a) => dateTime(a.scheduledAt) },
              { key: 'reason', label: 'Motivo' },
              { key: 'channel', label: 'Canal', render: (a) => `${APPOINTMENT_CHANNELS[a.channel]} · ${a.durationMin} min` },
              { key: 'status', label: 'Estado', render: (a) => <Pill variant={STATUS_VARIANT[a.status]}>{APPOINTMENT_STATUS[a.status]}</Pill> },
              { key: 'adminNotes', label: 'Notas del asesor', render: (a) => a.adminNotes || '—' },
              { key: 'x', label: '', render: (a) => canEdit && ['PENDING', 'CONFIRMED'].includes(a.status) && <button className="btn-link danger" onClick={() => cancel(a)}>Cancelar</button> },
            ]} />
          </Card>
        )}
      </AsyncView>
      <p className="small muted">La asesoría es educativa y de planificación financiera dentro del alcance del servicio; no constituye recomendación de inversión.</p>
      <Modal open={open} title="Solicitar cita" onClose={() => setOpen(false)}>
        <RequestForm onCancel={() => setOpen(false)} onDone={() => { setOpen(false); res.reload(); }} />
      </Modal>
    </>
  );
}
