import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime } from '../../utils/format.js';
import { Card, Notice, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, Input } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { tr } from '../../i18n/tr.js';

function Editor({ data, canManage, onSaved }) {
  const [f, setF] = useState({ accessToken: '', publicKey: data.publicKey || '', webhookSecret: '', rates: { ...data.rates } });
  const [state, setState] = useState({ busy: false, error: null, info: null });
  const run = async (fn, info) => {
    setState({ busy: true, error: null, info: null });
    try {
      await fn();
      setState({ busy: false, error: null, info });
      setF((v) => ({ ...v, accessToken: '', webhookSecret: '' }));
      onSaved();
    } catch (error) {
      setState({ busy: false, error, info: null });
      onSaved();
    }
  };
  const body = () => ({
    ...(f.accessToken.trim() ? { accessToken: f.accessToken.trim() } : {}),
    ...(f.publicKey.trim() ? { publicKey: f.publicKey.trim() } : {}),
    ...(f.webhookSecret.trim() ? { webhookSecret: f.webhookSecret.trim() } : {}),
    rates: Object.fromEntries(Object.entries(f.rates).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)])),
  });
  const save = () => run(() => api.put('/admin/payment-settings', body()), tr('Configuración guardada.'));
  const test = () => run(async () => {
    await api.put('/admin/payment-settings', body());
    const res = await api.post('/admin/payment-settings/test', {});
    if (!res.lastTest?.ok) throw new Error(res.lastTest?.error || tr('No se pudo conectar'));
  }, tr('Conexión correcta con Mercado Pago.'));
  const toggle = (enabled) => {
    if (enabled && !data.testMode && !window.confirm(tr('A partir de ahora los clientes pagarán con dinero real en Mercado Pago y ya no existirá el pago simulado. ¿Activar?'))) return;
    if (!enabled && !window.confirm(tr('Volverá el modo de prueba, donde cualquier cliente puede activar su acceso sin pagar. ¿Desactivar Mercado Pago?'))) return;
    run(() => api.put('/admin/payment-settings', { ...body(), enabled }), enabled ? tr('Mercado Pago activado.') : tr('Mercado Pago desactivado.'));
  };
  const setRate = (code, value) => setF({ ...f, rates: { ...f.rates, [code]: value } });

  return (
    <div className="stack">
      <div className="mail-status">
        {data.enabled ? <Pill>{tr('Activa')}</Pill> : <Pill variant="warn">{tr('Modo de prueba: los pagos son simulados')}</Pill>}
        {data.enabled && data.testMode && <Pill variant="warn">{tr('Credenciales de prueba')}</Pill>}
        {data.account && <span className="small muted">{tr('Cuenta: {name} · Cobra en {currency}', { name: data.account.nickname || data.account.siteId, currency: data.chargeCurrency })}</span>}
      </div>

      <h4>{tr('Credenciales')}</h4>
      <p className="small muted">{tr('Se guardan cifradas en la base de datos y nunca se muestran completas. Deja un campo vacío para conservar el ya guardado.')}</p>
      <div className="form-grid cols-2">
        <Field label={tr('Access Token')} hint={data.hasToken ? tr('Ya hay un token guardado. Al cambiarlo, Mercado Pago se desactiva hasta volver a probar la conexión.') : tr('Empieza con APP_USR- o TEST-.')}>
          <Input type="password" name="qlc-mp-token" autoComplete="new-password" value={f.accessToken} disabled={!canManage} onChange={(e) => setF({ ...f, accessToken: e.target.value })} placeholder={data.hasToken ? '••••••••' : 'APP_USR-...'} />
        </Field>
        <Field label={tr('Public Key')} hint={tr('Permite mostrar el formulario de tarjeta dentro de la plataforma. Debe ser del mismo tipo que el Access Token: prueba o producción.')}>
          <Input name="qlc-mp-public" autoComplete="off" value={f.publicKey} disabled={!canManage} onChange={(e) => setF({ ...f, publicKey: e.target.value })} placeholder="APP_USR-..." />
        </Field>
        <Field label={tr('Clave secreta del webhook')} hint={data.hasWebhookSecret ? tr('Ya hay una clave guardada.') : tr('Sirve para comprobar que cada aviso de pago viene de Mercado Pago.')}>
          <Input type="password" name="qlc-mp-webhook" autoComplete="new-password" value={f.webhookSecret} disabled={!canManage} onChange={(e) => setF({ ...f, webhookSecret: e.target.value })} placeholder={data.hasWebhookSecret ? '••••••••' : ''} />
        </Field>
      </div>

      <h4>{tr('URL del webhook')}</h4>
      <code className="code-line">{data.webhookUrl}</code>

      <details className="more-actions">
        <summary>{tr('Cómo obtener estos datos')}</summary>
        <ol className="small">
          <li>{tr('Entra a «Tus integraciones» en Mercado Pago Developers y crea una aplicación de tipo «Pagos en línea» con Checkout API.')}</li>
          <li>{tr('En «Credenciales de producción» copia la Public Key y el Access Token. Para probar sin dinero real usa las credenciales de prueba.')}</li>
          <li>{tr('En «Webhooks» pega la URL de arriba, marca los eventos «Pagos» y «Planes y suscripciones», y guarda.')}</li>
          <li>{tr('Copia la «Clave secreta» que muestra esa misma pantalla y pégala aquí.')}</li>
          <li>{tr('Pulsa «Guardar y probar conexión», revisa los tipos de cambio y activa Mercado Pago.')}</li>
        </ol>
      </details>

      {data.chargeCurrency && data.ratesNeeded.length > 0 && (
        <>
          <h4>{tr('Tipo de cambio')}</h4>
          <p className="small muted">{tr('Mercado Pago cobra en {currency}, no en USD ni en USDT. Los precios se convierten con este valor, que tú defines y actualizas aquí. El cliente ve el monto exacto antes de pagar.', { currency: data.chargeCurrency })}</p>
          <div className="form-grid cols-2">
            {data.ratesNeeded.map((code) => (
              <Field key={code} label={tr('1 {from} equivale a ({to})', { from: code, to: data.chargeCurrency })}>
                <Input type="number" min="0" step="0.01" value={f.rates[code] ?? ''} disabled={!canManage} onChange={(e) => setRate(code, e.target.value)} />
              </Field>
            ))}
          </div>
        </>
      )}

      {!data.encryptionReady && <Notice variant="gold">{tr('Falta TOKEN_ENCRYPTION_KEY en el servidor: sin ella no se pueden guardar credenciales cifradas.')}</Notice>}
      {!data.enabled && data.missing.length > 0 && <p className="small muted">{tr('Para activar falta:')} {data.missing.map((m) => tr(m)).join(', ')}.</p>}

      <FormError error={state.error} />
      {state.info && <p className="small up">{state.info}</p>}
      {canManage && (
        <div className="form-actions">
          <Button variant="secondary" loading={state.busy} disabled={!data.hasToken && !f.accessToken.trim()} onClick={test}>{tr('Guardar y probar conexión')}</Button>
          <Button variant="secondary" loading={state.busy} onClick={save}>{tr('Guardar')}</Button>
          {data.enabled
            ? <Button variant="danger" loading={state.busy} onClick={() => toggle(false)}>{tr('Desactivar Mercado Pago')}</Button>
            : <Button loading={state.busy} onClick={() => toggle(true)}>{tr('Activar Mercado Pago')}</Button>}
        </div>
      )}
      {data.lastTest && (
        <p className="small muted">{tr('Última prueba:')} {dateTime(data.lastTest.at)} — {data.lastTest.ok ? <span className="up">{tr('correcta')}</span> : <span className="down">{tr('falló')}{data.lastTest.error ? `: ${data.lastTest.error}` : ''}</span>}</p>
      )}
    </div>
  );
}

function PayPalEditor({ data, canManage, onSaved }) {
  const [f, setF] = useState({ clientId: data.clientId, clientSecret: '', webhookId: data.webhookId, mode: data.mode, currency: data.currency, rates: { ...data.rates } });
  const [state, setState] = useState({ busy: false, error: null, info: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const run = async (fn, info) => {
    setState({ busy: true, error: null, info: null });
    try {
      await fn();
      setState({ busy: false, error: null, info });
      setF((v) => ({ ...v, clientSecret: '' }));
    } catch (error) {
      setState({ busy: false, error, info: null });
    }
    onSaved();
  };
  const body = () => ({
    ...(f.clientId.trim() ? { clientId: f.clientId.trim() } : {}),
    ...(f.clientSecret.trim() ? { clientSecret: f.clientSecret.trim() } : {}),
    ...(f.webhookId.trim() ? { webhookId: f.webhookId.trim() } : {}),
    mode: f.mode,
    currency: f.currency,
    rates: Object.fromEntries(Object.entries(f.rates).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)])),
  });
  const save = () => run(() => api.put('/admin/paypal-settings', body()), tr('Configuración guardada.'));
  const test = () => run(async () => {
    await api.put('/admin/paypal-settings', body());
    const res = await api.post('/admin/paypal-settings/test', {});
    if (!res.lastTest?.ok) throw new Error(res.lastTest?.error || tr('No se pudo conectar'));
  }, tr('Conexión correcta con PayPal.'));
  const toggle = (enabled) => {
    if (enabled && f.mode === 'LIVE' && !window.confirm(tr('A partir de ahora los clientes podrán pagar con dinero real en PayPal. ¿Activar?'))) return;
    if (!enabled && !window.confirm(tr('Los clientes ya no podrán elegir PayPal. Las suscripciones ya contratadas siguen cobrándose en PayPal. ¿Desactivar?'))) return;
    run(() => api.put('/admin/paypal-settings', { ...body(), enabled }), enabled ? tr('PayPal activado.') : tr('PayPal desactivado.'));
  };
  const needed = [...new Set([...data.ratesNeeded.filter((c) => c !== f.currency)])];

  return (
    <div className="stack">
      <div className="mail-status">
        {data.enabled ? <Pill>{tr('Activa')}</Pill> : <Pill variant="muted">{tr('Inactiva')}</Pill>}
        {data.mode === 'SANDBOX' && <Pill variant="warn">{tr('Credenciales de prueba')}</Pill>}
      </div>
      <h4>{tr('Credenciales')}</h4>
      <p className="small muted">{tr('El Secret se guarda cifrado en la base de datos y nunca se muestra. Déjalo vacío para conservar el ya guardado. Al cambiar las credenciales o el modo, PayPal se desactiva hasta volver a probar la conexión.')}</p>
      <div className="form-grid cols-2">
        <Field label={tr('Modo')}>
          <select className="input" value={f.mode} disabled={!canManage} onChange={set('mode')}>
            <option value="SANDBOX">{tr('Prueba (Sandbox)')}</option>
            <option value="LIVE">{tr('Producción (Live)')}</option>
          </select>
        </Field>
        <Field label={tr('Moneda de cobro')}>
          <select className="input" value={f.currency} disabled={!canManage} onChange={set('currency')}>
            {data.currencies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={tr('Client ID')}><Input name="qlc-pp-client" autoComplete="off" value={f.clientId} disabled={!canManage} onChange={set('clientId')} /></Field>
        <Field label={tr('Secret')} hint={data.hasSecret ? tr('Ya hay un Secret guardado.') : undefined}>
          <Input type="password" name="qlc-pp-secret" autoComplete="new-password" value={f.clientSecret} disabled={!canManage} onChange={set('clientSecret')} placeholder={data.hasSecret ? '••••••••' : ''} />
        </Field>
        <Field label={tr('Webhook ID')} full hint={tr('Sirve para comprobar que cada aviso de pago viene de PayPal.')}><Input name="qlc-pp-webhook" autoComplete="off" value={f.webhookId} disabled={!canManage} onChange={set('webhookId')} /></Field>
      </div>
      <h4>{tr('URL del webhook')}</h4>
      <code className="code-line">{data.webhookUrl}</code>
      <details className="more-actions">
        <summary>{tr('Cómo obtener estos datos')}</summary>
        <ol className="small">
          <li>{tr('Entra a «Apps & Credentials» en PayPal Developer, elige Sandbox o Live y crea una app.')}</li>
          <li>{tr('Copia el Client ID y el Secret de esa app.')}</li>
          <li>{tr('En «Webhooks» de la app agrega la URL de arriba y marca todos los eventos («All events»).')}</li>
          <li>{tr('Copia el Webhook ID que aparece y pégalo aquí.')}</li>
          <li>{tr('Pulsa «Guardar y probar conexión», revisa los tipos de cambio y activa PayPal.')}</li>
        </ol>
      </details>
      {needed.length > 0 && (
        <>
          <h4>{tr('Tipo de cambio')}</h4>
          <p className="small muted">{tr('PayPal cobra en {currency}, no en USDT. Los precios se convierten con este valor, que tú defines y actualizas aquí. El cliente ve el monto exacto antes de pagar.', { currency: f.currency })}</p>
          <div className="form-grid cols-2">
            {needed.map((code) => (
              <Field key={code} label={tr('1 {from} equivale a ({to})', { from: code, to: f.currency })}>
                <Input type="number" min="0" step="0.01" value={f.rates[code] ?? ''} disabled={!canManage} onChange={(e) => setF({ ...f, rates: { ...f.rates, [code]: e.target.value } })} />
              </Field>
            ))}
          </div>
        </>
      )}
      {!data.encryptionReady && <Notice variant="gold">{tr('Falta TOKEN_ENCRYPTION_KEY en el servidor: sin ella no se pueden guardar credenciales cifradas.')}</Notice>}
      {!data.enabled && data.missing.length > 0 && <p className="small muted">{tr('Para activar falta:')} {data.missing.map((m) => tr(m)).join(', ')}.</p>}
      <FormError error={state.error} />
      {state.info && <p className="small up">{state.info}</p>}
      {canManage && (
        <div className="form-actions">
          <Button variant="secondary" loading={state.busy} disabled={!f.clientId.trim() || (!data.hasSecret && !f.clientSecret.trim())} onClick={test}>{tr('Guardar y probar conexión')}</Button>
          <Button variant="secondary" loading={state.busy} onClick={save}>{tr('Guardar')}</Button>
          {data.enabled
            ? <Button variant="danger" loading={state.busy} onClick={() => toggle(false)}>{tr('Desactivar PayPal')}</Button>
            : <Button loading={state.busy} onClick={() => toggle(true)}>{tr('Activar PayPal')}</Button>}
        </div>
      )}
      {data.lastTest && <p className="small muted">{tr('Última prueba:')} {dateTime(data.lastTest.at)} — {data.lastTest.ok ? <span className="up">{tr('correcta')}</span> : <span className="down">{tr('falló')}{data.lastTest.error ? `: ${data.lastTest.error}` : ''}</span>}</p>}
    </div>
  );
}

export default function AdminGateway() {
  const { user } = useAuth();
  const res = useAsync(() => api.get('/admin/payment-settings'), []);
  const pp = useAsync(() => api.get('/admin/paypal-settings'), []);
  return (
    <>
      <PageHeader kicker={tr('Comercial')} title={tr('Pasarela de pago')} subtitle={tr('Configura las pasarelas para cobrar los accesos, las suscripciones, las consultas y las sesiones de la plataforma.')} />
      <Card title={tr('Mercado Pago')}>
        <AsyncView {...res} onRetry={res.reload}>
          {(data) => <Editor data={data} canManage={user?.adminLevel === 'FULL'} onSaved={res.reload} />}
        </AsyncView>
      </Card>
      <Card title={tr('PayPal')}>
        <AsyncView {...pp} onRetry={pp.reload}>
          {(data) => <PayPalEditor data={data} canManage={user?.adminLevel === 'FULL'} onSaved={pp.reload} />}
        </AsyncView>
      </Card>
    </>
  );
}
