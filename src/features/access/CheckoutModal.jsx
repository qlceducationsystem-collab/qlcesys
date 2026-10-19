import { useEffect, useState } from 'react';
import { api, trackEvent } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { FormError } from '../../components/ui/Form.jsx';
import { date, money } from '../../utils/format.js';

const METHODS = [
  { value: 'CARD', label: 'Tarjeta', hint: 'Débito o crédito' },
  { value: 'TRANSFER', label: 'Transferencia', hint: 'Pago bancario' },
];

export const offerPrice = (offer) =>
  offer?.price === null || offer?.price === undefined ? 'Precio por definir' : `${money(offer.price)} ${offer.currency}`;

function Summary({ offer, method, setMethod }) {
  return (
    <div className="checkout-summary">
      <div className="checkout-product">
        <span className="checkout-kicker">{offer.type === 'FULL_ANNUAL' ? 'Acceso completo' : `Herramienta · Módulo ${offer.moduleNumber}`}</span>
        <b>{offer.name}</b>
        {offer.description && <p>{offer.description}</p>}
      </div>
      <div className="checkout-amount">
        <span>Total</span>
        <strong>{offer.price === null || offer.price === undefined ? 'Precio por definir — simulación de acceso' : offerPrice(offer)}</strong>
        {offer.type === 'FULL_ANNUAL' && <small>Vigencia de {offer.accessDays || 365} días</small>}
        {offer.type === 'TOOL_ONLY' && <small>Suscripción mensual · {offer.accessDays || 30} días de acceso por pago</small>}
      </div>
      <fieldset className="checkout-methods">
        <legend>Método de pago</legend>
        {METHODS.map((m) => (
          <label key={m.value} className={`checkout-method ${method === m.value ? 'is-selected' : ''}`}>
            <input type="radio" name="method" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} />
            <span><b>{m.label}</b><small>{m.hint}</small></span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

function Result({ status, offer, onClose, onRetry }) {
  const ok = status === 'APPROVED';
  return (
    <div className={`checkout-result ${ok ? 'is-ok' : 'is-bad'}`} role="status">
      <span className="checkout-result-icon" aria-hidden="true">{ok ? '✓' : '!'}</span>
      <h4>{ok ? 'Pago aprobado' : 'Pago rechazado'}</h4>
      <p>{ok ? `Tu acceso a ${offer.name} ya está activo.` : 'No se otorgó ningún acceso. Puedes intentarlo de nuevo.'}</p>
      <div className="form-actions">
        {!ok && <Button variant="secondary" onClick={onRetry}>Intentar de nuevo</Button>}
        <Button onClick={onClose}>{ok ? 'Continuar' : 'Cerrar'}</Button>
      </div>
    </div>
  );
}

export function CheckoutModal({ offer, onClose, onCompleted }) {
  const { refreshAccess } = useAuth();
  const [step, setStep] = useState('summary');
  const [method, setMethod] = useState('CARD');
  const [attempt, setAttempt] = useState(null);
  const [state, setState] = useState({ busy: false, error: null });

  useEffect(() => {
    trackEvent('PAYMENT_MODAL_OPEN', { offer: offer.code });
  }, [offer.code]);

  const run = async (fn) => {
    setState({ busy: true, error: null });
    try {
      await fn();
      setState({ busy: false, error: null });
    } catch (error) {
      setState({ busy: false, error });
    }
  };

  const start = () => run(async () => {
    const res = await api.post('/payments/checkout', { offerCode: offer.code });
    setAttempt(res.attempt);
    if (res.checkout.mode === 'REDIRECT' && res.checkout.initPoint) window.location.assign(res.checkout.initPoint);
    else setStep('test');
  });

  const simulate = (outcome) => run(async () => {
    const res = await api.post(`/payments/attempts/${attempt.id}/simulate`, { outcome });
    setAttempt(res.attempt);
    setStep('result');
    if (outcome === 'APPROVED') {
      await refreshAccess();
      onCompleted?.(res);
    }
  });

  return (
    <Modal open title="Pago seguro" onClose={onClose} className="checkout">
      <div className="checkout-env">ENTORNO DE PRUEBA · No se realiza ningún cobro real</div>
      {step === 'summary' && (
        <>
          <Summary offer={offer} method={method} setMethod={setMethod} />
          <FormError error={state.error} />
          <div className="form-actions">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button loading={state.busy} onClick={start} data-autofocus>Continuar al pago</Button>
          </div>
        </>
      )}
      {step === 'test' && attempt && (
        <div className="checkout-test">
          <div className="checkout-processing">
            <span className="checkout-pulse" aria-hidden="true" />
            <div>
              <b>Solicitud de pago creada</b>
              <small>Referencia {attempt.id.slice(-8).toUpperCase()} · {date(attempt.createdAt)}</small>
            </div>
          </div>
          <p className="muted small">Controles internos de prueba: elige el resultado que devolverá el proveedor simulado.</p>
          <FormError error={state.error} />
          <div className="checkout-sim">
            <Button variant="danger" loading={state.busy} onClick={() => simulate('REJECTED')}>Simular pago rechazado</Button>
            <Button loading={state.busy} onClick={() => simulate('APPROVED')}>Simular pago aprobado</Button>
          </div>
        </div>
      )}
      {step === 'result' && attempt && (
        <Result status={attempt.status} offer={offer} onClose={onClose} onRetry={() => { setAttempt(null); setStep('summary'); }} />
      )}
    </Modal>
  );
}
