import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, Input } from '../../components/ui/Form.jsx';

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-card">
      <div className="section-kicker">QLC Financial Education</div>
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      {children}
      {footer && <div className="auth-footer">{footer}</div>}
    </div>
  );
}

function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [state, setState] = useState({ busy: false, error: null, done: null });
  const bind = (k) => ({ value: values[k], onChange: (e) => setValues({ ...values, [k]: e.target.value }), name: k });
  const run = async (fn) => {
    setState({ busy: true, error: null, done: null });
    try {
      const done = await fn(values);
      setState({ busy: false, error: null, done });
    } catch (error) {
      setState({ busy: false, error, done: null });
    }
  };
  return { values, bind, state, run };
}

const homeFor = (u) => (u.role === 'ADMIN' ? '/admin' : '/app');

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const f = useForm({ email: '', password: '' });
  const submit = (e) => {
    e.preventDefault();
    f.run(async (v) => {
      const u = await login(v);
      nav(loc.state?.from || homeFor(u), { replace: true });
    });
  };
  return (
    <AuthCard title="Iniciar sesión" subtitle="Accede a tu plataforma de educación y organización patrimonial."
      footer={<>¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link> · <Link to="/recuperar">Olvidé mi contraseña</Link></>}>
      <form className="stack" onSubmit={submit}>
        <Field label="Correo electrónico"><Input type="email" autoComplete="email" required {...f.bind('email')} /></Field>
        <Field label="Contraseña"><Input type="password" autoComplete="current-password" required {...f.bind('password')} /></Field>
        <FormError error={f.state.error} />
        <Button type="submit" loading={f.state.busy}>Entrar</Button>
      </form>
    </AuthCard>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const f = useForm({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [local, setLocal] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (f.values.password !== f.values.confirm) return setLocal({ message: 'Las contraseñas no coinciden' });
    setLocal(null);
    f.run(async ({ confirm: _c, phone, ...v }) => {
      await register({ ...v, ...(phone ? { phone } : {}) });
      nav('/app/acceso', { replace: true });
    });
  };
  return (
    <AuthCard title="Crear cuenta" subtitle="Después de registrarte podrás elegir el acceso completo o solo las herramientas."
      footer={<>¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></>}>
      <form className="stack" onSubmit={submit}>
        <Field label="Nombre completo"><Input required autoComplete="name" maxLength={120} {...f.bind('name')} /></Field>
        <Field label="Correo electrónico"><Input type="email" required autoComplete="email" {...f.bind('email')} /></Field>
        <Field label="Teléfono (opcional)"><Input type="tel" autoComplete="tel" maxLength={30} {...f.bind('phone')} /></Field>
        <Field label="Contraseña" hint="Mínimo 8 caracteres."><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('password')} /></Field>
        <Field label="Confirmar contraseña"><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('confirm')} /></Field>
        <FormError error={local || f.state.error} />
        <Button type="submit" loading={f.state.busy}>Crear cuenta</Button>
        <p className="small muted">Al crear tu cuenta aceptas que la plataforma es educativa y de organización financiera; no constituye asesoría de inversión.</p>
      </form>
    </AuthCard>
  );
}

export function ForgotPassword() {
  const f = useForm({ email: '' });
  const submit = (e) => { e.preventDefault(); f.run((v) => api.post('/auth/forgot-password', v)); };
  return (
    <AuthCard title="Recuperar contraseña" footer={<Link to="/login">Volver a iniciar sesión</Link>}>
      {f.state.done ? <p className="notice">{f.state.done.message}</p> : (
        <form className="stack" onSubmit={submit}>
          <Field label="Correo electrónico"><Input type="email" required {...f.bind('email')} /></Field>
          <FormError error={f.state.error} />
          <Button type="submit" loading={f.state.busy}>Enviar instrucciones</Button>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const f = useForm({ password: '' });
  const submit = (e) => { e.preventDefault(); f.run((v) => api.post('/auth/reset-password', { token: params.get('token') || '', password: v.password })); };
  return (
    <AuthCard title="Nueva contraseña" footer={<Link to="/login">Iniciar sesión</Link>}>
      {f.state.done ? <p className="notice">Contraseña actualizada. Ya puedes iniciar sesión.</p> : (
        <form className="stack" onSubmit={submit}>
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres."><Input type="password" required minLength={8} {...f.bind('password')} /></Field>
          <FormError error={f.state.error} />
          <Button type="submit" loading={f.state.busy}>Guardar contraseña</Button>
        </form>
      )}
    </AuthCard>
  );
}
