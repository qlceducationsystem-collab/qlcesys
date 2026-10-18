import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { challengeStore, useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, Input } from '../../components/ui/Form.jsx';
import { LEGAL_DOCS, LEGAL_VERSION } from './legal/legalContent.js';

function AuthCard({ title, subtitle, children, footer, wide }) {
  return (
    <div className={`auth-card ${wide ? 'wide' : ''}`}>
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
  return { values, setValues, bind, state, run };
}

const homeFor = (u) => (u.role === 'ADMIN' ? '/admin' : '/app');
const SETUP_PATH = '/seguridad/2fa';

function CodeInput(props) {
  return (
    <Input
      className="input code-input"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={6}
      placeholder="000000"
      required
      {...props}
      onChange={(e) => props.onChange({ target: { value: e.target.value.replace(/\D/g, '').slice(0, 6) } })}
    />
  );
}

const METHODS = [['password', 'Contraseña'], ['code', 'Google Authenticator']];

export function Login() {
  const { login, loginWithCode } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [method, setMethod] = useState('password');
  const f = useForm({ email: '', password: '', code: '' });
  const submit = (e) => {
    e.preventDefault();
    f.run(async ({ email, password, code }) => {
      const res = method === 'password' ? await login({ email, password }) : await loginWithCode({ email, code });
      if (res.setupRequired) return nav(SETUP_PATH, { replace: true, state: { from: loc.state?.from } });
      nav(loc.state?.from || homeFor(res.user), { replace: true });
    });
  };
  return (
    <AuthCard title="Iniciar sesión" subtitle="Accede a tu plataforma de educación y organización patrimonial."
      footer={<>¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link> · <Link to="/recuperar">Olvidé mi contraseña</Link></>}>
      <div className="auth-methods" role="tablist" aria-label="Método de acceso">
        {METHODS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={method === key} className={method === key ? 'is-active' : ''} onClick={() => setMethod(key)}>{label}</button>
        ))}
      </div>
      <form className="stack" onSubmit={submit}>
        <Field label="Correo electrónico"><Input type="email" autoComplete="email" required {...f.bind('email')} /></Field>
        {method === 'password' ? (
          <Field label="Contraseña"><Input type="password" autoComplete="current-password" required {...f.bind('password')} /></Field>
        ) : (
          <Field label="Código de Google Authenticator" hint="Disponible cuando ya registraste tu verificación en dos pasos.">
            <CodeInput {...f.bind('code')} />
          </Field>
        )}
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
  const [accepted, setAccepted] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (f.values.password !== f.values.confirm) return setLocal({ message: 'Las contraseñas no coinciden' });
    if (!accepted) return setLocal({ message: 'Debes aceptar los Términos y el Aviso de privacidad' });
    setLocal(null);
    f.run(async ({ confirm: _c, phone, ...v }) => {
      await register({ ...v, ...(phone ? { phone } : {}), acceptLegal: true, legalVersion: LEGAL_VERSION });
      nav(SETUP_PATH, { replace: true, state: { from: '/app/acceso' } });
    });
  };
  return (
    <AuthCard title="Crear cuenta" subtitle="Después de registrarte configurarás tu verificación en dos pasos con Google Authenticator."
      footer={<>¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></>}>
      <form className="stack" onSubmit={submit}>
        <Field label="Nombre completo"><Input required autoComplete="name" maxLength={120} {...f.bind('name')} /></Field>
        <Field label="Correo electrónico"><Input type="email" required autoComplete="email" {...f.bind('email')} /></Field>
        <Field label="Teléfono (opcional)"><Input type="tel" autoComplete="tel" maxLength={30} {...f.bind('phone')} /></Field>
        <Field label="Contraseña" hint="Mínimo 8 caracteres."><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('password')} /></Field>
        <Field label="Confirmar contraseña"><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('confirm')} /></Field>
        <label className="check legal-check">
          <input type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>He leído y acepto los <Link to={LEGAL_DOCS.terminos.path} target="_blank" rel="noopener">Términos y condiciones</Link> y el <Link to={LEGAL_DOCS.privacidad.path} target="_blank" rel="noopener">Aviso de privacidad</Link>.</span>
        </label>
        <FormError error={local || f.state.error} />
        <Button type="submit" loading={f.state.busy}>Crear cuenta</Button>
        <p className="small muted">La plataforma es educativa y de organización financiera; no constituye asesoría de inversión.</p>
      </form>
    </AuthCard>
  );
}

export function TwoFactorSetup() {
  const { activateTwoFactor } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const challenge = challengeStore.get();
  const [setup, setSetup] = useState({ data: null, error: null });
  const f = useForm({ code: '' });

  useEffect(() => {
    if (!challenge?.challengeToken) return;
    api.post('/auth/2fa/setup', { challengeToken: challenge.challengeToken })
      .then((data) => setSetup({ data, error: null }))
      .catch((error) => setSetup({ data: null, error }));
  }, [challenge?.challengeToken]);

  if (!challenge?.challengeToken) return <Navigate to="/login" replace />;

  const submit = (e) => {
    e.preventDefault();
    f.run(async ({ code }) => {
      const res = await activateTwoFactor(code);
      nav(loc.state?.from || homeFor(res.user), { replace: true });
    });
  };

  return (
    <AuthCard wide title="Protege tu cuenta" subtitle="Configura la verificación en dos pasos. La necesitarás para entrar con código y para restablecer tu contraseña."
      footer={<Link to="/login" onClick={() => challengeStore.set(null)}>Cancelar y volver a iniciar sesión</Link>}>
      <ol className="twofa-steps">
        <li>Instala <b>Google Authenticator</b> en tu teléfono.</li>
        <li>Escanea el código QR o captura la clave manualmente.</li>
        <li>Escribe el código de 6 dígitos que aparece en la aplicación.</li>
      </ol>
      {setup.error && <FormError error={setup.error} />}
      {!setup.data && !setup.error && <div className="twofa-qr skeleton" aria-label="Generando código QR" />}
      {setup.data && (
        <div className="twofa-setup">
          <img className="twofa-qr" src={setup.data.qr} alt={`Código QR para ${setup.data.account}`} width="200" height="200" />
          <div className="twofa-key">
            <span className="field-label">Clave manual</span>
            <code className="code-line">{setup.data.secret.match(/.{1,4}/g).join(' ')}</code>
            <span className="small muted">Cuenta: {setup.data.account} · Emisor: {setup.data.issuer}</span>
          </div>
        </div>
      )}
      <form className="stack" onSubmit={submit}>
        <Field label="Código de verificación"><CodeInput {...f.bind('code')} /></Field>
        <FormError error={f.state.error} />
        <Button type="submit" loading={f.state.busy} disabled={!setup.data}>Activar y continuar</Button>
      </form>
    </AuthCard>
  );
}

export function ForgotPassword() {
  const f = useForm({ email: '', code: '', password: '', confirm: '' });
  const [local, setLocal] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (f.values.password !== f.values.confirm) return setLocal({ message: 'Las contraseñas no coinciden' });
    setLocal(null);
    f.run(({ email, code, password }) => api.post('/auth/reset-password', { email, code, password }));
  };
  return (
    <AuthCard title="Restablecer contraseña" subtitle="Usa el código de Google Authenticator que registraste en tu cuenta."
      footer={<Link to="/login">Volver a iniciar sesión</Link>}>
      {f.state.done ? (
        <div className="stack">
          <p className="notice">{f.state.done.message}</p>
          <Link className="btn-primary" to="/login">Iniciar sesión</Link>
        </div>
      ) : (
        <form className="stack" onSubmit={submit}>
          <Field label="Correo electrónico"><Input type="email" required autoComplete="email" {...f.bind('email')} /></Field>
          <Field label="Código de Google Authenticator"><CodeInput {...f.bind('code')} /></Field>
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres."><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('password')} /></Field>
          <Field label="Confirmar contraseña"><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('confirm')} /></Field>
          <FormError error={local || f.state.error} />
          <Button type="submit" loading={f.state.busy}>Guardar nueva contraseña</Button>
          <p className="small muted">Si no registraste tu verificación en dos pasos o perdiste el acceso a tu teléfono, solicita a un administrador que la restablezca.</p>
        </form>
      )}
    </AuthCard>
  );
}
