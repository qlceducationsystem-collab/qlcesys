import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { date } from '../../utils/format.js';
import { SUBSCRIPTION_STATUS } from '../../utils/labels.js';
import { Card, PageHeader, Row } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Field, FormError, Select, Textarea } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { AuditTable } from './AdminAudit.jsx';
import { statusPill } from './AdminClients.jsx';

function SubscriptionManager({ client, onSaved }) {
  const [status, setStatus] = useState(client.subscription?.status || 'ACTIVE');
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ busy: false, error: null });
  const save = async () => {
    setState({ busy: true, error: null });
    try {
      await api.patch(`/admin/clients/${client.id}/subscription`, { status, reason });
      setOpen(false);
      setReason('');
      onSaved();
      setState({ busy: false, error: null });
    } catch (error) {
      setState({ busy: false, error });
    }
  };
  return (
    <Card title="Gestionar membresía (manual)">
      <p className="small muted">Para cortesías o correcciones. Los pagos normales se confirman automáticamente por Mercado Pago. Queda registrado en la bitácora.</p>
      <Field label="Nuevo estado">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} options={['ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'PENDING'].map((s) => ({ value: s, label: SUBSCRIPTION_STATUS[s] }))} />
      </Field>
      <Field label="Motivo (obligatorio)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} /></Field>
      <Button disabled={!reason.trim()} onClick={() => setOpen(true)}>Aplicar cambio</Button>
      <ConfirmDialog open={open} title="Confirmar cambio de membresía" loading={state.busy} onConfirm={save} onClose={() => setOpen(false)}
        message={`El estado de la membresía de ${client.name} cambiará y el acceso a la plataforma dependerá del nuevo estado. Sus datos financieros se conservan.`}
        details={[{ field: 'Estado', from: SUBSCRIPTION_STATUS[client.effectiveStatus], to: SUBSCRIPTION_STATUS[status] }]}>
        <FormError error={state.error} />
      </ConfirmDialog>
    </Card>
  );
}

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const client = useAsync(() => api.get(`/admin/clients/${clientId}`), [clientId]);
  const audit = useAsync(() => api.get(`/admin/audit?clientId=${clientId}`), [clientId]);

  return (
    <AsyncView {...client} onRetry={client.reload}>
      {(c) => (
        <>
          <Link className="btn-secondary back" to="/admin">← Clientes</Link>
          <PageHeader title={c.name} subtitle={c.email} actions={<Link className="btn-primary" to={`/admin/clientes/${c.id}/app`}>Ver / gestionar como cliente</Link>} />
          <div className="layout">
            <Card title="Información">
              <Row label="Membresía" value={statusPill(c.effectiveStatus)} />
              <Row label="Activación" value={date(c.subscription?.activatedAt)} />
              <Row label="Siguiente cobro" value={date(c.subscription?.nextBillingDate)} />
              <Row label="Último pago" value={date(c.subscription?.lastPaymentAt)} />
              <Row label="Mes de suscripción" value={c.academy.currentMonth || '—'} />
              <Row label="Teléfono" value={c.phone || '—'} />
              <Row label="Periodos / cortes / citas" value={`${c.counts.periods} / ${c.counts.monthlyCloses} / ${c.counts.appointments}`} />
              <Row label="Cliente desde" value={date(c.createdAt)} />
            </Card>
            {user?.adminLevel === 'FULL' && <SubscriptionManager client={c} onSaved={() => { client.reload(); audit.reload(); }} />}
          </div>
          <Card title="Historial de cambios administrativos del cliente">
            <AsyncView {...audit} onRetry={audit.reload}>{(a) => <AuditTable items={a.items} hideClient />}</AsyncView>
          </Card>
        </>
      )}
    </AsyncView>
  );
}
