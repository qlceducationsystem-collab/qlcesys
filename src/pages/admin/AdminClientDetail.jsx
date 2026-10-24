import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { date, dateTime } from '../../utils/format.js';
import { Card, PageHeader, Pill, Row } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Field, FormError, Select } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { accessPill } from './AdminClients.jsx';

function GrantManager({ client, onSaved }) {
  const offers = useAsync(() => api.get('/admin/pricing'), []);
  const [offerCode, setOfferCode] = useState('FULL_ANNUAL');
  const [dialog, setDialog] = useState(null);
  const [state, setState] = useState({ busy: false, error: null });

  const run = async (fn) => {
    setState({ busy: true, error: null });
    try {
      await fn();
      setDialog(null);
      setState({ busy: false, error: null });
      onSaved();
    } catch (error) {
      setState({ busy: false, error });
    }
  };

  return (
    <Card title="Accesos del cliente">
      <DataTable rows={client.grants} empty="Sin accesos otorgados." columns={[
        { key: 'offer', label: 'Producto' },
        { key: 'startsAt', label: 'Inicio', render: (g) => date(g.startsAt) },
        { key: 'expiresAt', label: 'Vence', render: (g) => (g.expiresAt ? date(g.expiresAt) : 'Sin vencimiento') },
        { key: 'origin', label: 'Origen', render: (g) => (g.paymentAttemptId ? 'Pago' : 'Manual') },
        { key: 'active', label: 'Estado', render: (g) => <Pill variant={g.active ? '' : 'muted'}>{g.active ? 'Activo' : 'Revocado'}</Pill> },
        { key: 'x', label: '', render: (g) => g.active && <button type="button" className="btn-link danger" onClick={() => setDialog({ kind: 'revoke', grant: g })}>Revocar</button> },
      ]} />
      <Field label="Otorgar acceso manual (cortesía o corrección)">
        <Select value={offerCode} onChange={(e) => setOfferCode(e.target.value)} options={(offers.data || []).map((o) => ({ value: o.code, label: o.name }))} />
      </Field>
      <Button onClick={() => setDialog({ kind: 'grant' })}>Otorgar acceso</Button>
      <ConfirmDialog
        open={!!dialog}
        title={dialog?.kind === 'revoke' ? 'Revocar acceso' : 'Otorgar acceso'}
        danger={dialog?.kind === 'revoke'}
        loading={state.busy}
        message={dialog?.kind === 'revoke' ? `Se revocará “${dialog.grant.offer}”. Los datos del cliente se conservan.` : `Se otorgará el acceso seleccionado a ${client.name}.`}
        onConfirm={() => run(() => (dialog.kind === 'revoke'
          ? api.post(`/admin/clients/${client.id}/grants/${dialog.grant.id}/revoke`)
          : api.post(`/admin/clients/${client.id}/grants`, { offerCode })))}
        onClose={() => setDialog(null)}
      >
        <FormError error={state.error} />
      </ConfirmDialog>
    </Card>
  );
}

function TwoFactorReset({ client, onSaved }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ busy: false, error: null });
  const confirm = async () => {
    setState({ busy: true, error: null });
    try {
      await api.post(`/admin/clients/${client.id}/reset-2fa`);
      setOpen(false);
      setState({ busy: false, error: null });
      onSaved();
    } catch (error) {
      setState({ busy: false, error });
    }
  };
  if (!client.twoFactorEnabled) return null;
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Restablecer 2FA</Button>
      <ConfirmDialog
        open={open}
        title="Restablecer verificación en dos pasos"
        danger
        loading={state.busy}
        message={`${client.name} deberá configurar de nuevo Google Authenticator en su próximo inicio de sesión con contraseña.`}
        onConfirm={confirm}
        onClose={() => setOpen(false)}
      >
        <FormError error={state.error} />
      </ConfirmDialog>
    </>
  );
}

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const client = useAsync(() => api.get(`/admin/clients/${clientId}`), [clientId]);

  return (
    <AsyncView {...client} onRetry={client.reload}>
      {(c) => (
        <>
          <Link className="btn-secondary back" to="/admin/clientes">← Clientes</Link>
          <PageHeader title={c.name} subtitle={c.email} actions={<Link className="btn-primary" to={`/admin/clientes/${c.id}/app`}>Ver / gestionar como cliente</Link>} />
          <div className="layout">
            <Card title="Información">
              <Row label="Acceso" value={accessPill(c.access)} />
              {c.access.full && <Row label="Acceso anual vigente hasta" value={date(c.access.full.expiresAt)} />}
              <Row label="Módulos completados" value={`${c.completedModules} / 12`} />
              <Row label="Verificación en dos pasos" value={<Pill variant={c.twoFactorEnabled ? '' : 'warn'}>{c.twoFactorEnabled ? 'Activa' : 'Pendiente'}</Pill>} />
              {user?.adminLevel === 'FULL' && <TwoFactorReset client={c} onSaved={client.reload} />}
              <Row label="Teléfono" value={c.phone || '—'} />
              <Row label="Último acceso" value={dateTime(c.lastLoginAt)} />
              <Row label="Periodos / cortes / citas" value={`${c.counts.periods} / ${c.counts.monthlyCloses} / ${c.counts.appointments}`} />
              <Row label="Cliente desde" value={date(c.createdAt)} />
            </Card>
            {user?.adminLevel === 'FULL' && <GrantManager client={c} onSaved={client.reload} />}
          </div>
        </>
      )}
    </AsyncView>
  );
}
