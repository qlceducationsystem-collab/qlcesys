import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, Input, Textarea } from '../../components/ui/Form.jsx';
import { date, priceMoney } from '../../utils/format.js';
import { GiftCardModal } from '../gifts/GiftCard.jsx';
import { tr } from '../../i18n/tr.js';

const METHODS = [
  { value: 'CARD', label: 'Tarjeta', hint: 'Débito o crédito' },
  { value: 'TRANSFER', label: 'Transferencia', hint: 'Pago bancario' },
];

export const offerPrice = (offer) =>
  offer?.price === null || offer?.price === undefined ? tr('Precio por definir') : `${priceMoney(offer.price)} ${offer.currency}`;

const durationText = (offer) => {
  const days = offer.accessDays || (offer.type === 'FULL_ANNUAL' ? 365 : 30);
  return days >= 365 ? tr('Anual') : days >= 28 && days <= 31 ? tr('Mensual') : tr('{n} días', { n: days });
};

function Summary({ offer, method, setMethod, gift, setGift, promo }) {
  const unit = offer.price === null || offer.price === undefined ? null : Number(offer.price);
  const total = promo ? promo.finalPrice : unit === null ? null : unit * (gift ? Number(gift.quantity || 1) : 1);
  return (
    <div className="checkout-summary">
      <div className="checkout-product">
        <span className="checkout-kicker">{gift ? tr('Regalo · {duration}', { duration: durationText(offer) }) : promo ? tr('Promoción personalizada') : offer.type === 'FULL_ANNUAL' ? tr('Acceso completo') : (offer.moduleNumber ? tr('Herramienta · Módulo {n}', { n: offer.moduleNumber }) : tr('Herramientas M1–M12'))}</span>
        <b>{tr(offer.name)}</b>
        {offer.description && <p>{tr(offer.description)}</p>}
      </div>
      {gift && (
        <div className="checkout-gift">
          <Field label={tr('Número de accesos a regalar')} hint={tr('Se genera un código único por cada acceso.')}>
            <Input type="number" min="1" max="20" value={gift.quantity} onChange={(e) => setGift({ ...gift, quantity: e.target.value })} />
          </Field>
          <Field label={tr('Nombre de quien recibe (opcional)')}><Input maxLength={120} value={gift.recipientName} onChange={(e) => setGift({ ...gift, recipientName: e.target.value })} /></Field>
          <Field label={tr('Mensaje para la tarjeta (opcional)')}><Textarea maxLength={500} rows={3} value={gift.message} onChange={(e) => setGift({ ...gift, message: e.target.value })} /></Field>
        </div>
      )}
      <div className="checkout-amount">
        <span>{tr('Total')}</span>
        {promo && unit !== null && <small className="checkout-strike">{priceMoney(unit)} {offer.currency} · −{promo.discountPercent}%</small>}
        <strong>{total === null ? tr('Precio por definir — simulación de acceso') : `${priceMoney(total)} ${offer.currency}`}</strong>
        {gift && <small>{tr('El periodo empieza cuando la persona active su regalo, no hoy.')}</small>}
        {promo && <small>{tr('Tu acceso se activará cuando el equipo de QLC autorice el pago.')}</small>}
        {!gift && !promo && offer.type === 'FULL_ANNUAL' && <small>{tr('Vigencia de')}{' '}{offer.accessDays || 365}{' '}{tr('días')}</small>}
        {!gift && !promo && offer.type === 'TOOL_ONLY' && <small>{tr('Suscripción mensual ·')}{' '}{offer.accessDays || 30}{' '}{tr('días de acceso por pago')}</small>}
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

function Result({ attempt, offer, codes, gift, onClose, onRetry }) {
  const [card, setCard] = useState(null);
  const ok = attempt.status === 'APPROVED';
  const pending = ok && attempt.kind === 'PROMO';
  return (
    <div className={`checkout-result ${ok ? 'is-ok' : 'is-bad'}`} role="status">
      <span className="checkout-result-icon" aria-hidden="true">{ok ? '✓' : '!'}</span>
      <h4>{!ok ? tr('Pago rechazado') : pending ? tr('Pago confirmado') : tr('Pago aprobado')}</h4>
      {!ok && <p>{tr('No se otorgó ningún acceso. Puedes intentarlo de nuevo.')}</p>}
      {pending && <p>{tr('Recibimos tu pago promocional. Tu acceso a {name} se activará en cuanto el Administrador de QLC lo autorice; te avisaremos al quedar listo.', { name: offer.name })}</p>}
      {ok && !pending && codes && (
        <>
          <p>{tr('Tu regalo está listo. Comparte el código con la persona que quieres obsequiar; también te lo enviamos por correo.')}</p>
          <div className="gift-codes">
            {codes.map((code) => (
              <div key={code} className="gift-code-row">
                <strong>{code}</strong>
                <Button variant="secondary" onClick={() => setCard({ code, product: offer.name, duration: durationText(offer), message: gift?.message, recipientName: gift?.recipientName, redeemBy: null })}>{tr('Ver tarjeta')}</Button>
              </div>
            ))}
          </div>
        </>
      )}
      {ok && !pending && !codes && <p>{tr('Tu acceso a {name} ya está activo.', { name: offer.name })}</p>}
      <div className="form-actions">
        {!ok && <Button variant="secondary" onClick={onRetry}>{tr('Intentar de nuevo')}</Button>}
        <Button onClick={onClose}>{ok ? tr('Continuar') : 'Cerrar'}</Button>
      </div>
      {card && <GiftCardModal gift={card} onClose={() => setCard(null)} />}
    </div>
  );
}

export function CheckoutModal({ offer, mode = 'buy', promo = null, onClose, onCompleted }) {
  const { refreshAccess } = useAuth();
  const [step, setStep] = useState('summary');
  const [method, setMethod] = useState('CARD');
  const [gift, setGift] = useState(mode === 'gift' ? { quantity: 1, recipientName: '', message: '' } : null);
  const [attempt, setAttempt] = useState(null);
  const [codes, setCodes] = useState(null);
  const [state, setState] = useState({ busy: false, error: null });
  const product = promo ? promo.offer : offer;

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
    const body = promo
      ? { promoCode: promo.code }
      : { offerCode: offer.code, ...(gift ? { gift: { quantity: Number(gift.quantity || 1), recipientName: gift.recipientName || null, message: gift.message || null } } : {}) };
    const res = await api.post('/payments/checkout', body);
    setAttempt(res.attempt);
    if (res.checkout.mode === 'REDIRECT' && res.checkout.initPoint) window.location.assign(res.checkout.initPoint);
    else setStep('test');
  });

  const simulate = (outcome) => run(async () => {
    const res = await api.post(`/payments/attempts/${attempt.id}/simulate`, { outcome });
    setAttempt(res.attempt);
    setCodes(res.gifts || null);
    setStep('result');
    if (outcome === 'APPROVED') {
      await refreshAccess();
      onCompleted?.(res);
    }
  });

  return (
    <Modal open title={gift ? tr('Regalar acceso') : tr('Pago seguro')} onClose={onClose} className="checkout">
      <div className="checkout-env">{tr('ENTORNO DE PRUEBA · No se realiza ningún cobro real')}</div>
      {step === 'summary' && (
        <>
          <Summary offer={product} method={method} setMethod={setMethod} gift={gift} setGift={setGift} promo={promo} />
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
        <Result attempt={attempt} offer={product} codes={codes} gift={gift} onClose={onClose} onRetry={() => { setAttempt(null); setStep('summary'); }} />
      )}
    </Modal>
  );
}
