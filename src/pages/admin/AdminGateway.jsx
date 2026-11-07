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

function DlocalEditor({ data, canManage, onSaved }) {
  const [f, setF] = useState({ apiKey: '', secretKey: '', mode: data.mode, currency: data.currency, methods: data.methods, rates: { ...data.rates } });
  const [state, setState] = useState({ busy: false, error: null, info: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const run = async (fn, info) => {
    setState({ busy: true, error: null, info: null });
    try {
      await fn();
      setState({ busy: false, error: null, info });
      setF((v) => ({ ...v, apiKey: '', secretKey: '' }));
    } catch (error) {
      setState({ busy: false, error, info: null });
    }
    onSaved();
  };
  const body = () => ({
    ...(f.apiKey.trim() ? { apiKey: f.apiKey.trim() } : {}),
    ...(f.secretKey.trim() ? { secretKey: f.secretKey.trim() } : {}),
    mode: f.mode,
    currency: f.currency,
    methods: f.methods,
    rates: Object.fromEntries(Object.entries(f.rates).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)])),
  });
  const save = () => run(() => api.put('/admin/dlocal-settings', body()), tr('Configuración guardada.'));
  const test = () => run(async () => {
    await api.put('/admin/dlocal-settings', body());
    const res = await api.post('/admin/dlocal-settings/test', {});
    if (!res.lastTest?.ok) throw new Error(res.lastTest?.error || tr('No se pudo conectar'));
  }, tr('Conexión correcta con dLocal Go.'));
  const toggle = (enabled) => {
    if (enabled && f.mode === 'LIVE' && !window.confirm(tr('A partir de ahora los clientes podrán pagar con dinero real en dLocal Go. ¿Activar?'))) return;
    if (!enabled && !window.confirm(tr('Los clientes ya no podrán elegir el pago local. ¿Desactivar dLocal Go?'))) return;
    run(() => api.put('/admin/dlocal-settings', { ...body(), enabled }), enabled ? tr('dLocal Go activado.') : tr('dLocal Go desactivado.'));
  };
  const needed = data.ratesNeeded.filter((c) => c !== f.currency);

  return (
    <div className="stack">
      <div className="mail-status">
        {data.enabled ? <Pill>{tr('Activa')}</Pill> : <Pill variant="muted">{tr('Inactiva')}</Pill>}
        {data.mode === 'SANDBOX' && <Pill variant="warn">{tr('Credenciales de prueba')}</Pill>}
      </div>
      <p className="small muted">{tr('El cliente elige su país y paga en la página de dLocal Go con los métodos de ese país. Este pago no se renueva solo: el cliente recibe un correo 3 días antes de vencer para pagar de nuevo.')}</p>
      <h4>{tr('Credenciales')}</h4>
      <p className="small muted">{tr('Las llaves se guardan cifradas en la base de datos y nunca se muestran. Deja un campo vacío para conservar el ya guardado. Al cambiarlas o cambiar el modo, dLocal Go se desactiva hasta volver a probar la conexión.')}</p>
      <div className="form-grid cols-2">
        <Field label={tr('Modo')}>
          <select className="input" value={f.mode} disabled={!canManage} onChange={set('mode')}>
            <option value="SANDBOX">{tr('Prueba (Sandbox)')}</option>
            <option value="LIVE">{tr('Producción (Live)')}</option>
          </select>
        </Field>
        <Field label={tr('Moneda base del cobro')} hint={tr('Al pagar, dLocal Go convierte este monto a la moneda del país del cliente.')}>
          <select className="input" value={f.currency} disabled={!canManage} onChange={set('currency')}>
            {data.currencies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={tr('API Key')} hint={data.hasApiKey ? tr('Ya hay una llave guardada.') : undefined}>
          <Input type="password" name="qlc-dl-key" autoComplete="new-password" value={f.apiKey} disabled={!canManage} onChange={set('apiKey')} placeholder={data.hasApiKey ? '••••••••' : ''} />
        </Field>
        <Field label={tr('Secret Key')} hint={data.hasSecret ? tr('Ya hay una llave guardada.') : undefined}>
          <Input type="password" name="qlc-dl-secret" autoComplete="new-password" value={f.secretKey} disabled={!canManage} onChange={set('secretKey')} placeholder={data.hasSecret ? '••••••••' : ''} />
        </Field>
        <Field label={tr('Métodos de pago')} full>
          <select className="input" value={f.methods} disabled={!canManage} onChange={set('methods')}>
            <option value="NO_CARDS">{tr('Sin tarjeta: transferencia y efectivo')}</option>
            <option value="ALL">{tr('Todos los disponibles, incluidas tarjetas')}</option>
          </select>
        </Field>
      </div>
      <details className="more-actions">
        <summary>{tr('Cómo obtener estos datos')}</summary>
        <ol className="small">
          <li>{tr('Para probar, crea una cuenta en dashboard-sbx.dlocalgo.com. Para cobrar de verdad, usa dashboard.dlocalgo.com.')}</li>
          <li>{tr('En «Integrations» y luego «API Integration» copia la API Key y la Secret Key.')}</li>
          <li>{tr('Pégalas aquí con el modo correcto y pulsa «Guardar y probar conexión».')}</li>
          <li>{tr('Revisa los tipos de cambio y activa dLocal Go. Los avisos de pago se configuran solos en cada cobro.')}</li>
        </ol>
      </details>
      {needed.length > 0 && (
        <>
          <h4>{tr('Tipo de cambio')}</h4>
          <p className="small muted">{tr('Los precios se convierten a {currency} con este valor, que tú defines y actualizas aquí. Después, dLocal Go muestra al cliente el monto en la moneda de su país.', { currency: f.currency })}</p>
          <div className="form-grid cols-2">
            {needed.map((code) => (
              <Field key={code} label={tr('1 {from} equivale a ({to})', { from: code, to: f.currency })}>
                <Input type="number" min="0" step="0.0001" value={f.rates[code] ?? ''} disabled={!canManage} onChange={(e) => setF({ ...f, rates: { ...f.rates, [code]: e.target.value } })} />
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
          <Button variant="secondary" loading={state.busy} disabled={(!data.hasApiKey && !f.apiKey.trim()) || (!data.hasSecret && !f.secretKey.trim())} onClick={test}>{tr('Guardar y probar conexión')}</Button>
          <Button variant="secondary" loading={state.busy} onClick={save}>{tr('Guardar')}</Button>
          {data.enabled
            ? <Button variant="danger" loading={state.busy} onClick={() => toggle(false)}>{tr('Desactivar dLocal Go')}</Button>
            : <Button loading={state.busy} onClick={() => toggle(true)}>{tr('Activar dLocal Go')}</Button>}
        </div>
      )}
      {data.lastTest && <p className="small muted">{tr('Última prueba:')} {dateTime(data.lastTest.at)} — {data.lastTest.ok ? <span className="up">{tr('correcta')}</span> : <span className="down">{tr('falló')}{data.lastTest.error ? `: ${data.lastTest.error}` : ''}</span>}</p>}
    </div>
  );
}

export default function AdminGateway() {
  const { user } = useAuth();
  const dl = useAsync(() => api.get('/admin/dlocal-settings'), []);
  return (
    <>
      <PageHeader kicker={tr('Comercial')} title={tr('Pasarela de pago')} subtitle={tr('Configura dLocal Go para cobrar los accesos, las consultas y las sesiones de la plataforma.')} />
      <Card title={tr('dLocal Go')}>
        <AsyncView {...dl} onRetry={dl.reload}>
          {(data) => <DlocalEditor data={data} canManage={user?.adminLevel === 'FULL'} onSaved={dl.reload} />}
        </AsyncView>
      </Card>
    </>
  );
}
