import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { FormError } from '../../components/ui/Form.jsx';
import { date, priceMoney } from '../../utils/format.js';
import { tr } from '../../i18n/tr.js';

const METHODS = [
  { value: 'CARD', label: 'Tarjeta', hint: 'Débito o crédito' },
  { value: 'TRANSFER', label: 'Transferencia', hint: 'Pago bancario' },
];

export const offerPrice = (offer) =>
  offer?.price === null || offer?.price === undefined ? tr('Precio por definir') : `${priceMoney(offer.price)} ${offer.currency}`;

function Summary({ offer, method, setMethod }) {
  return (
    <div className="checkout-summary">
      <div className="checkout-product">
        <span className="checkout-kicker">{offer.type === 'FULL_ANNUAL' ? tr('Acceso completo') : (offer.moduleNumber ? tr('Herramienta · Módulo {n}', { n: offer.moduleNumber }) : tr('Herramientas M1–M12'))}</span>
        <b>{tr(offer.name)}</b>
        {offer.description && <p>{tr(offer.description)}</p>}
      </div>
      <div className="checkout-amount">
        <span>{tr('Total')}</span>
        <strong>{offer.price === null || offer.price === undefined ? tr('Precio por definir — simulación de acceso') : offerPrice(offer)}</strong>
        {offer.type === 'FULL_ANNUAL' && <small>{tr('Vigencia de')}{' '}{offer.accessDays || 365}{' '}{tr('días')}</small>}
        {offer.type === 'TOOL_ONLY' && <small>{tr('Suscripción mensual ·')}{' '}{offer.accessDays || 30}{' '}{tr('días de acceso por pago')}</small>}
      </div>
      <fieldset className="checkout-methods">
        <legend>{tr('Método de pago')}</legend>
        {METHODS.map((m) => (
          <label key={m.value} className={`checkout-method ${method === m.value ? 'is-selected' : ''}`}>
            <input type="radio" name="method" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} />
            <span><b>{tr(m.label)}</b><small>{tr(m.hint)}</small></span>
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
      <h4>{ok ? tr('Pago aprobado') : tr('Pago rechazado')}</h4>
      <p>{ok ? tr('Tu acceso a {name} ya está activo.', { name: offer.name }) : tr('No se otorgó ningún acceso. Puedes intentarlo de nuevo.')}</p>
      <div className="form-actions">
        {!ok && <Button variant="secondary" onClick={onRetry}>{tr('Intentar de nuevo')}</Button>}
        <Button onClick={onClose}>{ok ? tr('Continuar') : 'Cerrar'}</Button>
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
    <Modal open title={tr('Pago seguro')} onClose={onClose} className="checkout">
      <div className="checkout-env">{tr('ENTORNO DE PRUEBA · No se realiza ningún cobro real')}</div>
      {step === 'summary' && (
        <>
          <Summary offer={offer} method={method} setMethod={setMethod} />
          <FormError error={state.error} />
          <div className="form-actions">
            <Button variant="secondary" onClick={onClose}>{tr('Cancelar')}</Button>
            <Button loading={state.busy} onClick={start} data-autofocus>{tr('Continuar al pago')}</Button>
          </div>
        </>
      )}
      {step === 'test' && attempt && (
        <div className="checkout-test">
          <div className="checkout-processing">
            <span className="checkout-pulse" aria-hidden="true" />
            <div>
              <b>{tr('Solicitud de pago creada')}</b>
              <small>Referencia {attempt.id.slice(-8).toUpperCase()} · {date(attempt.createdAt)}</small>
            </div>
          </div>
          <p className="muted small">{tr('Controles internos de prueba: elige el resultado que devolverá el proveedor simulado.')}</p>
          <FormError error={state.error} />
          <div className="checkout-sim">
            <Button variant="danger" loading={state.busy} onClick={() => simulate('REJECTED')}>{tr('Simular pago rechazado')}</Button>
            <Button loading={state.busy} onClick={() => simulate('APPROVED')}>{tr('Simular pago aprobado')}</Button>
          </div>
        </div>
      )}
      {step === 'result' && attempt && (
        <Result status={attempt.status} offer={offer} onClose={onClose} onRetry={() => { setAttempt(null); setStep('summary'); }} />
      )}
    </Modal>
  );
}
