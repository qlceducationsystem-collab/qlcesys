import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { challengeStore, useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { CodeInput, Field, FormError, Input } from '../../components/ui/Form.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { BRAND_FULL } from '../../components/layout/Brand.jsx';
import { LEGAL_PATHS, LEGAL_VERSION } from './legal/legalContent.js';

function AuthCard({ title, subtitle, children, footer, wide }) {
  return (
    <div className={`auth-card ${wide ? 'wide' : ''}`}>
      <div className="section-kicker">{BRAND_FULL}</div>
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

const METHODS = [['password', 'auth.login.methodPassword'], ['code', 'auth.login.methodCode']];

export function Login() {
  const { login, loginWithCode } = useAuth();
  const { t } = useI18n();
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
    <AuthCard title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}
      footer={<>{t('auth.login.noAccount')} <Link to="/registro">{t('common.register')}</Link> · <Link to="/recuperar">{t('auth.login.forgot')}</Link></>}>
      <div className="auth-methods" role="tablist" aria-label={t('auth.login.methods')}>
        {METHODS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={method === key} className={method === key ? 'is-active' : ''} onClick={() => setMethod(key)}>{t(label)}</button>
        ))}
      </div>
      <form className="stack" onSubmit={submit}>
        <Field label={t('auth.email')}><Input type="email" autoComplete="email" required {...f.bind('email')} /></Field>
        {method === 'password' ? (
          <Field label={t('auth.password')}><Input type="password" autoComplete="current-password" required {...f.bind('password')} /></Field>
        ) : (
          <Field label={t('auth.authenticatorCode')} hint={t('auth.login.codeHint')}>
            <CodeInput {...f.bind('code')} />
          </Field>
        )}
        <FormError error={f.state.error} />
        <Button type="submit" loading={f.state.busy}>{t('auth.login.submit')}</Button>
      </form>
    </AuthCard>
  );
}

export function Register() {
  const { register } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const f = useForm({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [local, setLocal] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (f.values.password !== f.values.confirm) return setLocal({ message: t('common.passwordMismatch') });
    if (!accepted) return setLocal({ message: t('auth.register.acceptRequired') });
    setLocal(null);
    f.run(async ({ confirm: _c, phone, ...v }) => {
      await register({ ...v, ...(phone ? { phone } : {}), acceptLegal: true, legalVersion: LEGAL_VERSION });
      nav(SETUP_PATH, { replace: true, state: { from: '/app/acceso' } });
    });
  };
  return (
    <AuthCard title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}
      footer={<>{t('auth.register.hasAccount')} <Link to="/login">{t('common.login')}</Link></>}>
      <form className="stack" onSubmit={submit}>
        <Field label={t('auth.register.name')}><Input required autoComplete="name" maxLength={120} {...f.bind('name')} /></Field>
        <Field label={t('auth.email')}><Input type="email" required autoComplete="email" {...f.bind('email')} /></Field>
        <Field label={t('auth.register.phone')}><Input type="tel" autoComplete="tel" maxLength={30} {...f.bind('phone')} /></Field>
        <Field label={t('auth.password')} hint={t('auth.minChars')}><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('password')} /></Field>
        <Field label={t('auth.confirmPassword')}><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('confirm')} /></Field>
        <label className="check legal-check">
          <input type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>{t('auth.register.acceptBefore')}<Link to={LEGAL_PATHS.terminos} target="_blank" rel="noopener">{t('common.terms')}</Link>{t('auth.register.acceptAnd')}<Link to={LEGAL_PATHS.privacidad} target="_blank" rel="noopener">{t('common.privacy')}</Link>.</span>
        </label>
        <FormError error={local || f.state.error} />
        <Button type="submit" loading={f.state.busy}>{t('auth.register.submit')}</Button>
        <p className="small muted">{t('auth.register.note')}</p>
      </form>
    </AuthCard>
  );
}

export function TwoFactorSetup() {
  const { activateTwoFactor } = useAuth();
  const { t } = useI18n();
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
    <AuthCard wide title={t('auth.setup.title')} subtitle={t('auth.setup.subtitle')}
      footer={<Link to="/login" onClick={() => challengeStore.set(null)}>{t('auth.setup.cancel')}</Link>}>
      <ol className="twofa-steps">
        <li>{t('auth.setup.stepInstallBefore')}<b>Google Authenticator</b>{t('auth.setup.stepInstallAfter')}</li>
        <li>{t('auth.setup.stepScan')}</li>
        <li>{t('auth.setup.stepCode')}</li>
      </ol>
      {setup.error && <FormError error={setup.error} />}
      {!setup.data && !setup.error && <div className="twofa-qr skeleton" aria-label={t('auth.setup.generating')} />}
      {setup.data && (
        <div className="twofa-setup">
          <img className="twofa-qr" src={setup.data.qr} alt={t('auth.setup.qrAlt', { account: setup.data.account })} width="200" height="200" />
          <div className="twofa-key">
            <span className="field-label">{t('auth.setup.manualKey')}</span>
            <code className="code-line">{setup.data.secret.match(/.{1,4}/g).join(' ')}</code>
            <span className="small muted">{t('auth.setup.account', { account: setup.data.account, issuer: setup.data.issuer })}</span>
          </div>
        </div>
      )}
      <form className="stack" onSubmit={submit}>
        <Field label={t('auth.setup.code')}><CodeInput {...f.bind('code')} /></Field>
        <FormError error={f.state.error} />
        <Button type="submit" loading={f.state.busy} disabled={!setup.data}>{t('auth.setup.submit')}</Button>
      </form>
    </AuthCard>
  );
}

export function ForgotPassword() {
  const { t } = useI18n();
  const f = useForm({ email: '', code: '', password: '', confirm: '' });
  const [local, setLocal] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (f.values.password !== f.values.confirm) return setLocal({ message: t('common.passwordMismatch') });
    setLocal(null);
    f.run(({ email, code, password }) => api.post('/auth/reset-password', { email, code, password }));
  };
  return (
    <AuthCard title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')}
      footer={<Link to="/login">{t('auth.reset.back')}</Link>}>
      {f.state.done ? (
        <div className="stack">
          <p className="notice">{f.state.done.message}</p>
          <Link className="btn-primary" to="/login">{t('common.login')}</Link>
        </div>
      ) : (
        <form className="stack" onSubmit={submit}>
          <Field label={t('auth.email')}><Input type="email" required autoComplete="email" {...f.bind('email')} /></Field>
          <Field label={t('auth.authenticatorCode')}><CodeInput {...f.bind('code')} /></Field>
          <Field label={t('auth.newPassword')} hint={t('auth.minChars')}><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('password')} /></Field>
          <Field label={t('auth.confirmPassword')}><Input type="password" required minLength={8} autoComplete="new-password" {...f.bind('confirm')} /></Field>
          <FormError error={local || f.state.error} />
          <Button type="submit" loading={f.state.busy}>{t('auth.reset.submit')}</Button>
          <p className="small muted">{t('auth.reset.note')}</p>
        </form>
      )}
    </AuthCard>
  );
}
