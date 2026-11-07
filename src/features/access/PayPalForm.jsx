import { useEffect, useRef, useState } from 'react';
import { api } from '../../api/client.js';
import { Button } from '../../components/ui/Button.jsx';
import { FormError } from '../../components/ui/Form.jsx';
import { Loading } from '../../components/ui/States.jsx';
import { priceMoney } from '../../utils/format.js';
import { tr } from '../../i18n/tr.js';

const SCRIPT_ID = 'qlc-paypal-sdk';

const loadPayPal = ({ clientId, currency, recurring }) => new Promise((resolve, reject) => {
  const params = new URLSearchParams({ 'client-id': clientId, currency, intent: recurring ? 'subscription' : 'capture', ...(recurring ? { vault: 'true' } : {}) });
  const src = `https://www.paypal.com/sdk/js?${params}`;
  const current = document.getElementById(SCRIPT_ID);
  if (current?.src === src && window.paypal) {
    resolve(window.paypal);
    return;
  }
  current?.remove();
  delete window.paypal;
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = src;
  script.onload = () => resolve(window.paypal);
  script.onerror = () => {
    script.remove();
    reject(new Error(tr('No pudimos cargar PayPal. Revisa tu conexión e inténtalo de nuevo.')));
  };
  document.body.appendChild(script);
});

export function PayPalForm({ attempt, clientId, currency, productName, onResult, onCancel }) {
  const box = useRef(null);
  const handler = useRef(onResult);
  handler.current = onResult;
  const [ready, setReady] = useState(false);
  const [state, setState] = useState({ busy: false, error: null, info: null });
  const recurring = !!attempt.billingCycle;

  useEffect(() => {
    let alive = true;
    let buttons = null;
    const path = `/payments/attempts/${encodeURIComponent(attempt.id)}/paypal`;
    const fail = (error) => {
      if (alive) setState({ busy: false, error, info: null });
    };
    const create = async (key) => {
      if (alive) setState({ busy: false, error: null, info: null });
      try {
        return (await api.post(`${path}/create`, {}))[key];
      } catch (error) {
        fail(error);
        throw error;
      }
    };
    const confirm = async (body) => {
      if (alive) setState({ busy: true, error: null, info: null });
      try {
        handler.current(await api.post(`${path}/confirm`, body));
      } catch (error) {
        fail(error);
      }
    };
    loadPayPal({ clientId, currency, recurring }).then((paypal) => {
      if (!alive || !box.current) return undefined;
      buttons = paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: recurring ? 'subscribe' : 'paypal' },
        ...(recurring
          ? { createSubscription: () => create('subscriptionId'), onApprove: (data) => confirm({ subscriptionId: data.subscriptionID }) }
          : { createOrder: () => create('orderId'), onApprove: (data) => confirm({ orderId: data.orderID }) }),
        onCancel: () => {
          if (alive) setState({ busy: false, error: null, info: tr('Cerraste la ventana de PayPal. No se realizó ningún cobro; puedes intentarlo de nuevo.') });
        },
        onError: () => fail(new Error(tr('PayPal no pudo completar la operación. Inténtalo de nuevo.'))),
      });
      setReady(true);
      return buttons.render(box.current);
    }).catch(fail);
    return () => {
      alive = false;
      buttons?.close?.().catch?.(() => null);
    };
  }, [attempt.id, clientId, currency, recurring]);

  const total = `${priceMoney(attempt.chargedAmount)} ${attempt.chargedCurrency}`;
  return (
    <div className="card-form">
      <div className="checkout-processing">
        <span className="checkout-pulse" aria-hidden="true" />
        <div>
          <b>{tr(productName)}</b>
          <small>{recurring ? tr('{amount} cada {period}', { amount: total, period: tr(attempt.billingCycle === 'YEARLY' ? 'año' : 'mes') }) : `${tr('Total a pagar')}: ${total}`}</small>
        </div>
      </div>
      {(!ready || state.busy) && !state.error && <Loading />}
      <div ref={box} className={`paypal-buttons ${state.busy ? 'is-hidden' : ''}`} />
      <p className="small muted">{recurring
        ? tr('Pagarás en PayPal con tu cuenta o tarjeta. El cobro se repetirá automáticamente hasta que canceles en Mi acceso.')
        : tr('Pagarás en PayPal con tu cuenta o tarjeta.')}</p>
      {state.info && <p className="small">{state.info}</p>}
      <FormError error={state.error} />
      <div className="form-actions">
        <Button type="button" variant="secondary" disabled={state.busy} onClick={onCancel}>{tr('Cancelar')}</Button>
      </div>
    </div>
  );
}
