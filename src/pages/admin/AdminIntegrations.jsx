import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime } from '../../utils/format.js';
import { Card, Notice, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { FormError } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { tr } from '../../i18n/tr.js';

const META = {
  DRIVE: { name: 'Google Drive', icon: '▲', purpose: 'Videos y documentos de la academia. Permiso limitado a los archivos creados por la aplicación.' },
  GMAIL: { name: 'Gmail', icon: '✉', purpose: 'Envío de correos del sistema (bienvenida, recuperación de contraseña, avisos). Solo permiso de envío.' },
};
const STATUS = { CONNECTED: ['Conectado', ''], ERROR: ['Error de conexión', 'bad'], DISCONNECTED: ['No conectado', 'muted'] };

function IntegrationCard({ item, canManage, onChanged }) {
  const meta = META[item.service];
  const [label, variant] = STATUS[item.status];
  const [confirm, setConfirm] = useState(false);
  const [state, setState] = useState({ busy: false, error: null, info: null });

  const run = async (fn) => {
    setState({ busy: true, error: null, info: null });
    try {
      const info = await fn();
      setState({ busy: false, error: null, info });
    } catch (error) {
      setState({ busy: false, error, info: null });
    }
  };

  const connect = () => run(async () => {
    const { url } = await api.get(`/admin/integrations/${item.service.toLowerCase()}/connect`);
    window.location.assign(url);
  });
  const disconnect = () => run(async () => {
    await api.del(`/admin/integrations/${item.service.toLowerCase()}`);
    setConfirm(false);
    onChanged();
  });
  const test = () => run(async () => {
    const res = await api.post('/admin/integrations/gmail/test');
    onChanged();
    return res.sent ? tr('Correo de prueba enviado a tu cuenta.') : tr('No se envió: {error}', { error: res.error });
  });

  return (
    <article className={`integration-card status-${item.status}`}>
      <header>
        <span className="integration-icon" aria-hidden="true">{meta.icon}</span>
        <div>
          <h3>{tr(meta.name)}</h3>
          <Pill variant={variant}>{tr(label)}</Pill>
        </div>
      </header>
      <p className="muted">{tr(meta.purpose)}</p>
      {!item.configured ? (
        <div className="notice gold">{tr('Configuración de Google pendiente en el servidor. Define GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI y TOKEN_ENCRYPTION_KEY.')}</div>
      ) : (
        <dl className="integration-meta">
          <div><dt>{tr('Cuenta conectada')}</dt><dd>{item.email || '—'}</dd></div>
          <div><dt>{tr('Fecha de conexión')}</dt><dd>{dateTime(item.connectedAt)}</dd></div>
          <div><dt>{tr('Última sincronización')}</dt><dd>{dateTime(item.lastSyncAt)}</dd></div>
          {item.lastError && <div><dt>{tr('Último error')}</dt><dd className="down">{tr(item.lastError)}</dd></div>}
        </dl>
      )}
      <FormError error={state.error} />
      {state.info && <p className="small up">{tr(state.info)}</p>}
      {canManage && item.configured && (
        <div className="form-actions">
          {item.status !== 'DISCONNECTED' && <Button variant="secondary" onClick={() => setConfirm(true)}>{tr('Desconectar')}</Button>}
          {item.service === 'GMAIL' && item.status === 'CONNECTED' && <Button variant="secondary" loading={state.busy} onClick={test}>{tr('Enviar correo de prueba')}</Button>}
          <Button loading={state.busy} onClick={connect}>{item.status === 'DISCONNECTED' ? `Conectar ${meta.name}` : 'Reconectar'}</Button>
        </div>
      )}
      <ConfirmDialog open={confirm} title={tr('Desconectar {name}', { name: meta.name })} danger confirmLabel={tr('Desconectar')} loading={state.busy}
        message={tr('Se revocará el acceso y se eliminará el token cifrado. Los archivos existentes en Drive no se borran.')} onConfirm={disconnect} onClose={() => setConfirm(false)} />
    </article>
  );
}

export default function AdminIntegrations() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const res = useAsync(() => api.get('/admin/integrations'), []);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const connected = params.get('connected');
    const error = params.get('error');
    if (connected || error) {
      setFlash(connected ? { ok: true, text: `${META[connected]?.name || connected} conectado correctamente.` } : { ok: false, text: error });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  return (
    <>
      <PageHeader kicker={tr('Sistema')} title={tr('Integraciones')} subtitle={tr('Conexiones OAuth 2.0 administradas por el servidor. Los tokens se guardan cifrados y nunca llegan al navegador.')} />
      {flash && <Notice variant={flash.ok ? '' : 'gold'}>{tr(flash.text)}</Notice>}
      <AsyncView {...res} onRetry={res.reload}>
        {(d) => (
          <>
            <div className="integration-grid">
              {d.items.map((item) => <IntegrationCard key={item.service} item={item} canManage={user?.adminLevel === 'FULL'} onChanged={res.reload} />)}
            </div>
            <Card title={tr('URI de redirección autorizada')}>
              <code className="code-line">{tr(d.redirectUri)}</code>
              <p className="small muted">{tr('Regístrala en Google Cloud Console dentro del cliente OAuth.')}</p>
            </Card>
            <Card title={tr('Últimos correos del sistema')}>
              <DataTable rows={d.emails} empty={tr('Sin envíos registrados.')} columns={[
                { key: 'createdAt', label: tr('Fecha'), render: (e) => dateTime(e.createdAt) },
                { key: 'to', label: tr('Destinatario') },
                { key: 'subject', label: tr('Asunto') },
                { key: 'status', label: tr('Estado'), render: (e) => <Pill variant={e.status === 'SENT' ? '' : 'bad'}>{e.status === 'SENT' ? tr('Enviado') : tr('Fallido')}</Pill> },
                { key: 'error', label: tr('Detalle'), render: (e) => e.error || '—' },
              ]} />
            </Card>
          </>
        )}
      </AsyncView>
    </>
  );
}
