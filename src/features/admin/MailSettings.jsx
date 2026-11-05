import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Card, Notice, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, Input, Textarea } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { tr } from '../../i18n/tr.js';

function Editor({ data, canManage, onSaved }) {
  const [f, setF] = useState({
    clientId: '',
    clientSecret: '',
    senderName: data.senderName || '',
    recipients: (data.recipients || []).join(', '),
    disabled: new Set(data.disabled || []),
    clientDisabled: new Set(data.clientDisabled || []),
  });
  const [state, setState] = useState({ busy: false, error: null, info: null });
  const run = async (fn, info) => {
    setState({ busy: true, error: null, info: null });
    try {
      await fn();
      setState({ busy: false, error: null, info });
      onSaved();
    } catch (error) {
      setState({ busy: false, error, info: null });
    }
  };
  const save = () => run(() => api.put('/admin/mail-settings', {
    ...(f.clientId.trim() ? { clientId: f.clientId.trim() } : {}),
    ...(f.clientSecret.trim() ? { clientSecret: f.clientSecret.trim() } : {}),
    senderName: f.senderName.trim() || 'QLC Financial Education',
    recipients: f.recipients.split(/[,\s;]+/).map((e) => e.trim()).filter(Boolean),
    disabled: [...f.disabled],
    clientDisabled: [...f.clientDisabled],
  }), tr('Configuración guardada.'));
  const connect = () => run(async () => {
    const { url } = await api.get('/admin/integrations/gmail/connect');
    window.location.assign(url);
  });
  const test = () => run(async () => {
    const res = await api.post('/admin/integrations/gmail/test');
    if (!res.sent) throw new Error(res.error || tr('No se pudo enviar'));
  }, tr('Correo de prueba enviado a tu cuenta.'));
  const toggle = (key, type) => {
    const next = new Set(f[key]);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setF({ ...f, [key]: next });
  };
  const setGroup = (key, events, on) => {
    const next = new Set(f[key]);
    events.forEach((e) => (on ? next.delete(e.type) : next.add(e.type)));
    setF({ ...f, [key]: next });
  };
  const groupsFor = (key, groups) => (
    <div className="notify-groups">
      {groups.map((g) => (
        <fieldset key={g.label} className="notify-group">
          <legend>
            {tr(g.label)}
            {canManage && <button type="button" className="btn-link" onClick={() => setGroup(key, g.events, g.events.some((e) => f[key].has(e.type)))}>{g.events.some((e) => f[key].has(e.type)) ? tr('Activar todos') : tr('Desactivar todos')}</button>}
          </legend>
          {g.events.map((e) => (
            <label key={e.type} className="check">
              <input type="checkbox" checked={!f[key].has(e.type)} disabled={!canManage} onChange={() => toggle(key, e.type)} />
              {tr(e.label)}
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
  const connected = data.gmail.status === 'CONNECTED';
  return (
    <div className="stack">
      <div className="source-line">
        <span>{tr('Cuenta de Gmail que envía los correos')}</span>
        <span>{connected ? <Pill>{tr('Conectado')}</Pill> : <Pill variant="muted">{tr('No conectado')}</Pill>} <b>{data.gmail.email || '—'}</b></span>
      </div>
      {data.gmail.lastError && <p className="small down">{tr(data.gmail.lastError)}</p>}

      <h4>{tr('1. Aplicación OAuth2 de Google Cloud')}</h4>
      <p className="small muted">{data.source === 'PANEL'
        ? tr('Credenciales configuradas desde este panel.')
        : data.source === 'SERVER' ? tr('Credenciales configuradas en el servidor. Puedes reemplazarlas aquí.') : tr('Aún no hay credenciales. Agrégalas para poder conectar la cuenta de Gmail.')}</p>
      <div className="form-grid cols-2">
        <Field label={tr('Client ID')} hint={data.clientId ? tr('Actual: {value}. Déjalo vacío para conservarlo.', { value: data.clientId }) : null}>
          <Input value={f.clientId} disabled={!canManage} autoComplete="off" onChange={(e) => setF({ ...f, clientId: e.target.value })} placeholder="xxxxxxxx.apps.googleusercontent.com" />
        </Field>
        <Field label={tr('Client Secret')} hint={data.hasSecret ? tr('Se guarda cifrado y nunca se muestra. Déjalo vacío para conservar el actual.') : tr('Se guarda cifrado y nunca se muestra.')}>
          <Input type="password" value={f.clientSecret} disabled={!canManage} autoComplete="new-password" onChange={(e) => setF({ ...f, clientSecret: e.target.value })} placeholder={data.hasSecret ? '••••••••' : ''} />
        </Field>
      </div>
      <details className="more-actions">
        <summary>{tr('Cómo obtener el Client ID y el Client Secret')}</summary>
        <ol className="small">
          <li>{tr('Entra a Google Cloud Console con la cuenta de Gmail que enviará los correos y crea un proyecto.')}</li>
          <li>{tr('Activa la Gmail API en «APIs y servicios».')}</li>
          <li>{tr('En «Pantalla de consentimiento de OAuth» registra la aplicación y agrega tu correo como usuario de prueba.')}</li>
          <li>{tr('En «Credenciales» crea un «ID de cliente de OAuth» de tipo «Aplicación web».')}</li>
          <li>{tr('En «URI de redireccionamiento autorizados» agrega: {uri}', { uri: data.redirectUri })}</li>
          <li>{tr('Copia el Client ID y el Client Secret aquí, guarda y pulsa «Conectar con Google».')}</li>
        </ol>
      </details>
      {!data.encryptionReady && <Notice variant="gold">{tr('Falta TOKEN_ENCRYPTION_KEY en el servidor: sin ella no se pueden guardar credenciales cifradas.')}</Notice>}

      <h4>{tr('2. Remitente y destinatarios de los avisos')}</h4>
      <div className="form-grid cols-2">
        <Field label={tr('Nombre del remitente')}><Input maxLength={120} value={f.senderName} disabled={!canManage} onChange={(e) => setF({ ...f, senderName: e.target.value })} /></Field>
        <Field label={tr('Correos que reciben los avisos')} hint={tr('Separa varios correos con comas. Si lo dejas vacío, se avisa a los administradores con nivel total.')}>
          <Textarea rows={2} value={f.recipients} disabled={!canManage} onChange={(e) => setF({ ...f, recipients: e.target.value })} placeholder="avisos@qlc.com, direccion@qlc.com" />
        </Field>
      </div>

      <h4>{tr('3. Notificaciones para administradores')}</h4>
      <p className="small muted">{tr('Avisos que reciben los correos de administración indicados arriba. Todos vienen activados. Desmarca los que no quieras recibir por correo; siguen guardándose en el panel.')}</p>
      {groupsFor('disabled', data.groups)}

      <h4>{tr('4. Correos para clientes')}</h4>
      <p className="small muted">{tr('Correos que recibe cada cliente en su propia cuenta de correo. Desmarca los que no quieras enviar. Los correos de verificación, recuperación de contraseña y avisos antes de eliminar una cuenta siempre se envían.')}</p>
      {groupsFor('clientDisabled', data.clientGroups || [])}

      <FormError error={state.error} />
      {state.info && <p className="small up">{state.info}</p>}
      {canManage && (
        <div className="form-actions">
          {connected && <Button variant="secondary" loading={state.busy} onClick={test}>{tr('Enviar correo de prueba')}</Button>}
          <Button variant="secondary" loading={state.busy} disabled={!data.clientId && !f.clientId.trim()} onClick={connect}>{connected ? tr('Reconectar con Google') : tr('Conectar con Google')}</Button>
          <Button loading={state.busy} onClick={save}>{tr('Guardar')}</Button>
        </div>
      )}
    </div>
  );
}

export function MailSettings({ canManage, onChanged }) {
  const res = useAsync(() => api.get('/admin/mail-settings'), []);
  return (
    <Card title={tr('Correo (Gmail) y notificaciones')}>
      <p className="small muted">{tr('QLC envía un correo por cada aviso importante de la plataforma: suscriptores activos, vencidos o cancelados, pagos, regalos, nuevos registros, citas, ejercicios y más. Usa una cuenta de Gmail dedicada a estos envíos.')}</p>
      <AsyncView {...res} onRetry={res.reload}>
        {(data) => <Editor key={data.clientId || 'new'} data={data} canManage={canManage} onSaved={() => { res.reload(); onChanged?.(); }} />}
      </AsyncView>
    </Card>
  );
}
