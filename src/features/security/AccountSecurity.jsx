import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { CodeInput, Field, FormError, Input } from '../../components/ui/Form.jsx';

const EMPTY = { code: '', newPassword: '', confirm: '' };

function ChangePasswordModal({ onClose }) {
  const { user } = useAuth();
  const [f, setF] = useState(EMPTY);
  const [state, setState] = useState({ busy: false, error: null, done: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return setState({ busy: false, error: { message: 'Las contraseñas no coinciden' }, done: null });
    setState({ busy: true, error: null, done: null });
    try {
      const res = await api.post('/auth/change-password', { code: f.code, newPassword: f.newPassword });
      setF(EMPTY);
      setState({ busy: false, error: null, done: res.message });
    } catch (error) {
      setState({ busy: false, error, done: null });
    }
  };

  return (
    <Modal open title="Seguridad de la cuenta" onClose={onClose}>
      {state.done ? (
        <div className="stack">
          <p className="notice">{state.done}</p>
          <Button onClick={onClose}>Listo</Button>
        </div>
      ) : (
        <form className="stack" onSubmit={save}>
          <p className="small muted">Cambia tu contraseña confirmando con el código de Google Authenticator de <b>{user?.email}</b>.</p>
          <Field label="Código de Google Authenticator"><CodeInput value={f.code} onChange={set('code')} /></Field>
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres."><Input type="password" required minLength={8} autoComplete="new-password" value={f.newPassword} onChange={set('newPassword')} /></Field>
          <Field label="Confirmar contraseña"><Input type="password" required minLength={8} autoComplete="new-password" value={f.confirm} onChange={set('confirm')} /></Field>
          <FormError error={state.error} />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={state.busy}>Cambiar contraseña</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function SecurityNavButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="nav-logout" onClick={() => setOpen(true)}><span className="ico">⚿</span>Cambiar contraseña</button>
      {open && <ChangePasswordModal onClose={() => setOpen(false)} />}
    </>
  );
}
