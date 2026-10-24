import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { date } from '../../utils/format.js';
import { ADMIN_LEVELS } from '../../utils/labels.js';
import { Card, PageHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog, Modal } from '../../components/ui/Modal.jsx';
import { Field, FormError, Input, Select, Textarea } from '../../components/ui/Form.jsx';
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
        <p className="small muted">En su primer inicio de sesión deberá registrar la verificación en dos pasos con Google Authenticator.</p>
        <FormError error={state.error} />
        <div className="form-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" loading={state.busy}>Crear</Button></div>
      </form>
    </Modal>
  );
}

const DIALOGS = {
  status: (a) => ({
    title: a.isActive ? 'Inactivar administrador' : 'Reactivar administrador',
    message: a.isActive ? `${a.name} no podrá iniciar sesión hasta que lo reactives.` : `${a.name} podrá volver a iniciar sesión.`,
    confirmLabel: a.isActive ? 'Inactivar' : 'Reactivar',
    danger: a.isActive,
    run: (reason) => api.patch(`/admin/admins/${a.id}/status`, { isActive: !a.isActive, reason }),
  }),
  password: (a) => ({
    title: 'Cambiar contraseña',
    message: `Asigna una nueva contraseña a ${a.name}. Compártela por un canal seguro.`,
    confirmLabel: 'Guardar contraseña',
    run: (reason, password) => api.post(`/admin/admins/${a.id}/password`, { password, reason }),
  }),
  delete: (a) => ({
    title: 'Eliminar administrador',
    message: `Se eliminará definitivamente la cuenta de ${a.name} (${a.email}). Los registros de auditoría se conservan.`,
    confirmLabel: 'Eliminar',
    danger: true,
    run: (reason) => api.del(`/admin/admins/${a.id}`, { reason }),
  }),
};

function AdminAction({ dialog, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState({ value: '', confirm: '' });
  const [state, setState] = useState({ busy: false, error: null });
  const config = DIALOGS[dialog.kind](dialog.admin);
  const needsPassword = dialog.kind === 'password';

  const confirm = async () => {
    if (!reason.trim()) return setState({ busy: false, error: { message: 'Indica el motivo' } });
    if (needsPassword && password.value.length < 8) return setState({ busy: false, error: { message: 'La contraseña debe tener al menos 8 caracteres' } });
    if (needsPassword && password.value !== password.confirm) return setState({ busy: false, error: { message: 'Las contraseñas no coinciden' } });
    setState({ busy: true, error: null });
    try {
      await config.run(reason.trim(), password.value);
      onDone();
    } catch (error) {
      setState({ busy: false, error });
    }
  };

  return (
    <ConfirmDialog open title={config.title} message={config.message} confirmLabel={config.confirmLabel} danger={config.danger} loading={state.busy} onConfirm={confirm} onClose={onClose}>
      <div className="stack">
        {needsPassword && (
          <>
            <Field label="Nueva contraseña" hint="Mínimo 8 caracteres."><Input type="password" minLength={8} autoComplete="new-password" value={password.value} onChange={(e) => setPassword({ ...password, value: e.target.value })} /></Field>
            <Field label="Confirmar contraseña"><Input type="password" minLength={8} autoComplete="new-password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} /></Field>
          </>
        )}
        <Field label="Motivo (obligatorio)"><Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        <FormError error={state.error} />
      </div>
    </ConfirmDialog>
  );
}

export default function AdminTeam() {
  const { user } = useAuth();
  const res = useAsync(() => api.get('/admin/admins'), []);
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [err, setErr] = useState(null);
  const changeLevel = async (a, adminLevel) => {
    if (!window.confirm(`¿Cambiar el nivel de ${a.name} a ${ADMIN_LEVELS[adminLevel]}?`)) return;
    try { await api.patch(`/admin/admins/${a.id}/level`, { adminLevel, reason: 'Cambio de nivel administrativo' }); res.reload(); } catch (e) { setErr(e); }
  };
  const isSelf = (a) => a.id === user.id;
  return (
    <>
      <PageHeader title="Administradores" subtitle="Visualización · Edición · Administración completa" actions={<Button onClick={() => setOpen(true)}>+ Administrador</Button>} />
      <Card>
        <FormError error={err} />
        <AsyncView {...res} onRetry={res.reload}>
          {(list) => (
            <DataTable rows={list} columns={[
              { key: 'name', label: 'Nombre', render: (a) => <>{a.name}{isSelf(a) && <span className="pill info">Tú</span>}<span className="small block">{a.email}</span></> },
              { key: 'level', label: 'Nivel', render: (a) => (isSelf(a) ? ADMIN_LEVELS[a.adminLevel] : (
                <Select value={a.adminLevel || ''} onChange={(e) => changeLevel(a, e.target.value)} options={levelOptions} aria-label="Nivel" />
              )) },
              { key: 'status', label: 'Estado', render: (a) => (
                <span className="row-actions">
                  <span className={`pill ${a.isActive ? '' : 'bad'}`}>{a.isActive ? 'Activo' : 'Inactivo'}</span>
                  <span className={`pill ${a.twoFactorEnabled ? 'info' : 'warn'}`}>{a.twoFactorEnabled ? '2FA activo' : '2FA pendiente'}</span>
                </span>
              ) },
              { key: 'createdAt', label: 'Alta', render: (a) => date(a.createdAt) },
              { key: 'actions', label: 'Acciones', align: 'right', render: (a) => (isSelf(a) ? <span className="small muted">Usa “Cambiar contraseña” del menú</span> : (
                <span className="row-actions">
                  <Button variant="secondary" onClick={() => setDialog({ kind: 'password', admin: a })}>Contraseña</Button>
                  <Button variant="secondary" onClick={() => setDialog({ kind: 'status', admin: a })}>{a.isActive ? 'Inactivar' : 'Reactivar'}</Button>
                  <Button variant="danger" onClick={() => setDialog({ kind: 'delete', admin: a })}>Eliminar</Button>
                </span>
              )) },
            ]} />
          )}
        </AsyncView>
      </Card>
      {open && <NewAdmin onClose={() => setOpen(false)} onSaved={() => { setOpen(false); res.reload(); }} />}
      {dialog && <AdminAction key={`${dialog.kind}-${dialog.admin.id}`} dialog={dialog} onClose={() => setDialog(null)} onDone={() => { setDialog(null); res.reload(); }} />}
    </>
  );
}
