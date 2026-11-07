import { useEffect, useRef, useState } from 'react';
import { api } from '../../api/client.js';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, Input } from '../../components/ui/Form.jsx';
import { Loading } from '../../components/ui/States.jsx';
import { priceMoney } from '../../utils/format.js';
import { tr } from '../../i18n/tr.js';

const SDK_URL = 'https://sdk.mercadopago.com/js/v2';
const FIELD_STYLE = { color: '#ffffff', placeholderColor: '#9ca9b7', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', fontSize: '16px' };
const FONTS = [{ src: 'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap' }];
const CHALLENGE_POLL_MS = 5000;
const CHALLENGE_LIMIT_MS = 6 * 60 * 1000;

let sdkPromise = null;
const loadSdk = () => {
  if (window.MercadoPago) return Promise.resolve();
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.onload = () => resolve();
      script.onerror = () => {
        sdkPromise = null;
        script.remove();
        reject(new Error(tr('No pudimos cargar el formulario de pago. Revisa tu conexión e inténtalo de nuevo.')));
      };
      document.body.appendChild(script);
    });
  }
  return sdkPromise;
};

export function CardForm({ attempt, publicKey, productName, onResult, onCancel }) {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState(null);
  const [marks, setMarks] = useState({});
  const [state, setState] = useState({ busy: false, error: null });
  const sdk = useRef({ mp: null, method: null });

  useEffect(() => {
    let alive = true;
    const mounted = [];
    const mark = (id, value) => setMarks((m) => ({ ...m, [id]: value }));
    loadSdk().then(() => {
      if (!alive) return;
      const mp = new window.MercadoPago(publicKey);
      sdk.current.mp = mp;
      const add = (type, id, placeholder) => {
        const field = mp.fields.create(type, { placeholder, style: FIELD_STYLE, customFonts: FONTS });
        field.on('focus', () => mark(id, 'is-focus'));
        field.on('blur', () => setMarks((m) => ({ ...m, [id]: m[id] === 'is-focus' ? '' : m[id] })));
        field.on('validityChange', ({ errorMessages }) => mark(id, errorMessages?.length ? 'is-bad' : ''));
        field.mount(id);
        mounted.push(field);
        return field;
      };
      const number = add('cardNumber', 'qlc-card-number', '0000 0000 0000 0000');
      add('expirationDate', 'qlc-card-expiry', tr('MM/AA'));
      const code = add('securityCode', 'qlc-card-code', tr('CVV'));
      number.on('binChange', async ({ bin }) => {
        if (!bin) {
          sdk.current.method = null;
          if (alive) setBrand(null);
          return;
        }
        try {
          const { results } = await mp.getPaymentMethods({ bin });
          const method = results?.[0];
          if (!alive || !method) return;
          sdk.current.method = method;
          sdk.current.bin = bin;
          setBrand(method.name || method.id);
          const settings = method.settings?.[0];
          if (settings?.card_number) number.update({ settings: settings.card_number });
          if (settings?.security_code) code.update({ settings: settings.security_code });
        } catch {
          sdk.current.method = null;
        }
      });
      setReady(true);
    }).catch((error) => {
      if (alive) setState({ busy: false, error });
    });
    return () => {
      alive = false;
      mounted.forEach((field) => {
        try { field.unmount(); } catch { return undefined; }
        return undefined;
      });
    };
  }, [publicKey]);

  const issuerOf = async (method) => {
    if (!method.additional_info_needed?.includes('issuer_id')) return method.issuer?.id ?? null;
    const issuers = await sdk.current.mp.getIssuers({ paymentMethodId: method.id, bin: sdk.current.bin });
    return issuers?.[0]?.id ?? method.issuer?.id ?? null;
  };

  const pay = async (e) => {
    e.preventDefault();
    const method = sdk.current.method;
    if (!name.trim()) return setState({ busy: false, error: new Error(tr('Escribe el nombre como aparece en la tarjeta.')) });
    if (!method) return setState({ busy: false, error: new Error(tr('Revisa el número de tu tarjeta.')) });
    setState({ busy: true, error: null });
    let token;
    try {
      token = await sdk.current.mp.fields.createCardToken({ cardholderName: name.trim() });
    } catch {
      return setState({ busy: false, error: new Error(tr('Revisa los datos de tu tarjeta.')) });
    }
    try {
      const issuerId = await issuerOf(method).catch(() => method.issuer?.id ?? null);
      const res = await api.post(`/payments/attempts/${encodeURIComponent(attempt.id)}/card`, {
        token: token.id,
        paymentMethodId: method.id,
        ...(issuerId !== null ? { issuerId: String(issuerId) } : {}),
        ...(window.MP_DEVICE_SESSION_ID ? { deviceId: String(window.MP_DEVICE_SESSION_ID) } : {}),
      });
      onResult(res);
    } catch (error) {
      setState({ busy: false, error });
    }
    return undefined;
  };

  return (
    <form className="card-form" onSubmit={pay}>
      <div className="checkout-processing">
        <span className="checkout-pulse" aria-hidden="true" />
        <div>
          <b>{tr(productName)}</b>
          <small>{attempt.billingCycle ? tr('{amount} cada {period}', { amount: `${priceMoney(attempt.chargedAmount)} ${attempt.chargedCurrency}`, period: tr(attempt.billingCycle === 'YEARLY' ? 'año' : 'mes') }) : `${tr('Total a pagar')}: ${priceMoney(attempt.chargedAmount)} ${attempt.chargedCurrency}`}</small>
        </div>
      </div>
      {!ready && !state.error && <Loading />}
      <div className={`card-fields ${ready ? '' : 'is-hidden'}`}>
        <Field label={tr('Número de tarjeta')} hint={brand || undefined} full>
          <div id="qlc-card-number" className={`input card-field ${marks['qlc-card-number'] || ''}`} />
        </Field>
        <Field label={tr('Nombre del titular')} full>
          <Input value={name} maxLength={100} autoComplete="cc-name" onChange={(e) => setName(e.target.value)} placeholder={tr('Como aparece en la tarjeta')} />
        </Field>
        <div className="form-grid cols-2">
          <Field label={tr('Vencimiento')}><div id="qlc-card-expiry" className={`input card-field ${marks['qlc-card-expiry'] || ''}`} /></Field>
          <Field label={tr('Código de seguridad')}><div id="qlc-card-code" className={`input card-field ${marks['qlc-card-code'] || ''}`} /></Field>
        </div>
        <p className="small muted">{attempt.billingCycle ? tr('Se cobrará automáticamente en cada periodo hasta que canceles en Mi acceso. Tus datos viajan cifrados: QLC no recibe ni guarda el número ni el código de tu tarjeta.') : tr('Pago en una sola exhibición. Tus datos viajan cifrados: QLC no recibe ni guarda el número ni el código de tu tarjeta.')}</p>
      </div>
      <FormError error={state.error} />
      <div className="form-actions">
        <Button type="button" variant="secondary" disabled={state.busy} onClick={onCancel}>{tr('Cancelar')}</Button>
        <Button type="submit" loading={state.busy} disabled={!ready}>{tr(attempt.billingCycle ? 'Suscribirme por {amount}' : 'Pagar {amount}', { amount: `${priceMoney(attempt.chargedAmount)} ${attempt.chargedCurrency}` })}</Button>
      </div>
    </form>
  );
}

export function CardChallenge({ attemptId, challenge, onDone }) {
  const form = useRef(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    form.current?.submit();
    let alive = true;
    const started = Date.now();
    const check = async () => {
      const res = await api.post(`/payments/attempts/${encodeURIComponent(attemptId)}/sync`, {}).catch(() => null);
      if (!alive || !res) return;
      if (res.attempt.status !== 'PENDING' || Date.now() - started > CHALLENGE_LIMIT_MS) {
        alive = false;
        done.current(res);
      }
    };
    const timer = setInterval(check, CHALLENGE_POLL_MS);
    const onMessage = (e) => {
      if (e.data?.status === 'COMPLETE') check();
    };
    window.addEventListener('message', onMessage);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('message', onMessage);
    };
  }, [attemptId]);

  return (
    <div className="card-challenge">
      <p className="small muted">{tr('Tu banco pide confirmar que eres tú. Completa este paso para terminar el pago.')}</p>
      <iframe name="qlc-card-challenge" title={tr('Verificación de tu banco')} />
      <form ref={form} method="post" action={challenge.url} target="qlc-card-challenge">
        <input type="hidden" name="creq" value={challenge.creq} />
      </form>
    </div>
  );
}
