import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { date } from '../../utils/format.js';
import { ADMIN_LEVELS } from '../../utils/labels.js';
import { Card, PageHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Field, FormError, Input, Select } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';

const levelOptions = Object.entries(ADMIN_LEVELS).map(([value, label]) => ({ value, label }));

function NewAdmin({ onClose, onSaved }) {
  const [f, setF] = useState({ name: '', email: '', password: '', adminLevel: 'VIEW' });
  const [state, setState] = useState({ busy: false, error: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: null });
    try { await api.post('/admin/admins', f); onSaved(); } catch (error) { setState({ busy: false, error }); }
  };
  return (
    <Modal open title="Nuevo administrador" onClose={onClose}>
      <form className="stack" onSubmit={save}>
        <Field label="Nombre"><Input required value={f.name} onChange={set('name')} /></Field>
        <Field label="Correo"><Input type="email" required value={f.email} onChange={set('email')} /></Field>
        <Field label="Contraseña inicial" hint="Mínimo 8 caracteres. Compártela por un canal seguro."><Input type="password" minLength={8} required value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <Field label="Nivel"><Select value={f.adminLevel} onChange={set('adminLevel')} options={levelOptions} /></Field>
        <FormError error={state.error} />
        <div className="form-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" loading={state.busy}>Crear</Button></div>
      </form>
    </Modal>
  );
}

export default function AdminTeam() {
  const { user } = useAuth();
  const res = useAsync(() => api.get('/admin/admins'), []);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState(null);
  const changeLevel = async (a, adminLevel) => {
    if (!window.confirm(`¿Cambiar el nivel de ${a.name} a ${ADMIN_LEVELS[adminLevel]}?`)) return;
    try { await api.patch(`/admin/admins/${a.id}/level`, { adminLevel, reason: 'Cambio de nivel administrativo' }); res.reload(); } catch (e) { setErr(e); }
  };
  return (
    <>
      <PageHeader title="Administradores" subtitle="Visualización · Edición · Administración completa" actions={<Button onClick={() => setOpen(true)}>+ Administrador</Button>} />
      <Card>
        <FormError error={err} />
        <AsyncView {...res} onRetry={res.reload}>
          {(list) => (
            <DataTable rows={list} columns={[
              { key: 'name', label: 'Nombre', render: (a) => <>{a.name}<span className="small block">{a.email}</span></> },
              { key: 'level', label: 'Nivel', render: (a) => (a.id === user.id ? ADMIN_LEVELS[a.adminLevel] : (
                <Select value={a.adminLevel || ''} onChange={(e) => changeLevel(a, e.target.value)} options={levelOptions} aria-label="Nivel" />
              )) },
              { key: 'createdAt', label: 'Alta', render: (a) => date(a.createdAt) },
            ]} />
          )}
        </AsyncView>
      </Card>
      {open && <NewAdmin onClose={() => setOpen(false)} onSaved={() => { setOpen(false); res.reload(); }} />}
    </>
  );
}
