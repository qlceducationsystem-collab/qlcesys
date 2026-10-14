// Membresía mensual. El pago se crea en el backend (Mercado Pago) y el acceso
// se activa SOLO cuando el backend confirma el pago vía webhook.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { date, money } from '../../utils/format.js';
import { SUBSCRIPTION_STATUS } from '../../utils/labels.js';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { FormError } from '../../components/ui/Form.jsx';
import { Pill, Row } from '../../components/ui/Card.jsx';
import { Loading } from '../../components/ui/States.jsx';

export function Subscription() {
  const { membership, refreshMembership, user } = useAuth();
  const plan = useAsync(() => api.get('/subscriptions/plan'), []);
  const [state, setState] = useState({ busy: false, error: null });
  const [confirmCancel, setConfirmCancel] = useState(false);
  if (!membership) return <Loading />;
  const sub = membership.subscription;
  const status = membership.effectiveStatus;

  const checkout = async () => {
    setState({ busy: true, error: null });
    try {
      const { initPoint } = await api.post('/subscriptions/checkout');
      window.location.assign(initPoint);
    } catch (error) {
      setState({ busy: false, error });
    }
  };

  const cancel = async () => {
    setState({ busy: true, error: null });
    try {
      await api.post('/subscriptions/cancel');
      await refreshMembership();
      setConfirmCancel(false);
      setState({ busy: false, error: null });
    } catch (error) {
      setState({ busy: false, error });
    }
  };

  return (
    <div className="auth-card wide">
      <div className="section-kicker">Hola, {user?.name}</div>
      <h1>Mi membresía</h1>
      <p className="subtitle">{plan.data?.name || 'QLC Financial Education - Membresía mensual'}</p>
      <div className="card">
        <Row label="Estado" value={<Pill variant={status === 'ACTIVE' ? '' : 'warn'}>{SUBSCRIPTION_STATUS[status] || status}</Pill>} />
        {plan.data?.amount ? <Row label="Precio" value={`${money(plan.data.amount)} ${plan.data.currency} / mes`} /> : <Row label="Precio" value="Por configurar" />}
        {sub?.activatedAt && <Row label="Fecha de activación" value={date(sub.activatedAt)} />}
        {sub?.nextBillingDate && status === 'ACTIVE' && <Row label="Siguiente cobro" value={date(sub.nextBillingDate)} />}
        {sub?.lastPaymentAt && <Row label="Último pago" value={date(sub.lastPaymentAt)} />}
        {membership.hasAccess && <Row label="Mes de suscripción" value={`${membership.academy.currentMonth} · ${membership.academy.unlocked} módulos desbloqueados`} />}
      </div>
      <FormError error={state.error} />
      {membership.hasAccess ? (
        <div className="form-actions">
          <Link className="btn-primary" to="/app">Ir a mi plataforma</Link>
          {status === 'ACTIVE' && <Button variant="secondary" onClick={() => setConfirmCancel(true)}>Cancelar membresía</Button>}
        </div>
      ) : (
        <div className="stack">
          {status === 'PENDING' && <p className="notice">Tu pago está en proceso. El acceso se activa automáticamente cuando Mercado Pago confirma el pago.</p>}
          {['CANCELLED', 'EXPIRED', 'PAST_DUE'].includes(status) && <p className="notice">Tu información financiera se conserva. Reactiva tu membresía para volver a acceder.</p>}
          <Button onClick={checkout} loading={state.busy} disabled={!plan.data?.amount}>Pagar membresía con Mercado Pago</Button>
          {status === 'PENDING' && <Button variant="secondary" onClick={refreshMembership}>Actualizar estado</Button>}
        </div>
      )}
      <p className="small muted">El cobro mensual recurrente se gestiona con Mercado Pago. Al cancelar, tus datos no se eliminan.</p>
      <ConfirmDialog open={confirmCancel} title="Cancelar membresía" danger confirmLabel="Cancelar membresía" loading={state.busy}
        message="Se detendrán los cobros y se bloqueará el acceso a la plataforma privada. Tu información financiera se conserva."
        onConfirm={cancel} onClose={() => setConfirmCancel(false)} />
    </div>
  );
}

// back_url de Mercado Pago: solo consulta el estado real en el backend.
export function SubscriptionReturn() {
  const { membership, refreshMembership } = useAuth();
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (membership?.hasAccess || tries >= 10) return undefined;
    const t = setTimeout(async () => { await refreshMembership(); setTries((n) => n + 1); }, 3000);
    return () => clearTimeout(t);
  }, [membership, tries, refreshMembership]);

  return (
    <div className="auth-card">
      <h1>Confirmando tu pago</h1>
      {membership?.hasAccess ? (
        <>
          <p className="notice">¡Pago confirmado! Tu membresía está activa.</p>
          <Link className="btn-primary" to="/app">Ir a mi plataforma</Link>
        </>
      ) : tries >= 10 ? (
        <>
          <p className="notice">Aún no recibimos la confirmación de Mercado Pago. Puede tardar unos minutos; tu acceso se activará automáticamente.</p>
          <Link className="btn-secondary" to="/suscripcion">Ver mi membresía</Link>
        </>
      ) : <Loading text="Esperando la confirmación de Mercado Pago…" />}
    </div>
  );
}
