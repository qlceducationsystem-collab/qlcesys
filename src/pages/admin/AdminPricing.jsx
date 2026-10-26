import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { priceMoney } from '../../utils/format.js';
import { Card, Notice, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Field, FormError, Input, MoneyInput } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { tr } from '../../i18n/tr.js';

const priceText = (o) => (o.price === null ? tr('Precio por definir') : `${priceMoney(o.price)} ${o.currency}`);

function OfferEditor({ offer, onSaved, canEdit }) {
  const [f, setF] = useState({ name: offer.name, description: offer.description || '', price: offer.price ?? '', currency: offer.currency, accessDays: offer.accessDays ?? '', active: offer.active });
  const [confirm, setConfirm] = useState(false);
  const [state, setState] = useState({ busy: false, error: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async () => {
    setState({ busy: true, error: null });
    try {
      await api.put(`/admin/pricing/${offer.code}`, {
        ...f,
        price: f.price === '' ? null : Number(f.price),
        accessDays: Number(f.accessDays || (offer.type === 'FULL_ANNUAL' ? 365 : 30)),
      });
      setConfirm(false);
      setState({ busy: false, error: null });
      onSaved();
    } catch (error) {
      setState({ busy: false, error });
    }
  };

  return (
    <article className={`price-card ${offer.type === 'FULL_ANNUAL' ? 'is-featured' : ''}`}>
      <header>
        <span className="price-code">{offer.type === 'FULL_ANNUAL' ? tr('Acceso completo anual') : (offer.moduleNumber ? `Herramienta M${offer.moduleNumber}` : tr('Herramientas M1–M12'))}</span>
        <Pill variant={offer.active ? '' : 'muted'}>{offer.active ? tr('Activo') : tr('Inactivo')}</Pill>
      </header>
      <strong className="price-current">{priceText(offer)}</strong>
      <div className="form-grid cols-2">
        <Field label={tr('Nombre')} full><Input value={f.name} onChange={set('name')} disabled={!canEdit} /></Field>
        <Field label={tr('Precio')} hint={tr('Vacío = Precio por definir')}><MoneyInput value={f.price} onChange={set('price')} disabled={!canEdit} placeholder={tr('Por definir')} /></Field>
        <Field label={tr('Moneda')}><Input maxLength={3} value={f.currency} onChange={set('currency')} disabled={!canEdit} /></Field>
        <Field label={offer.type === 'FULL_ANNUAL' ? tr('Días de acceso') : tr('Días por mensualidad')}><Input type="number" min="1" value={f.accessDays} onChange={set('accessDays')} disabled={!canEdit} /></Field>
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} disabled={!canEdit} />{' '}{tr('Disponible para compra')}</label>
      </div>
      <FormError error={state.error} />
      {canEdit && <Button onClick={() => setConfirm(true)}>{tr('Guardar')}</Button>}
      <ConfirmDialog
        open={confirm}
        title={tr('Confirmar cambio de precio')}
        message={tr('El cambio se aplica a nuevas compras.')}
        details={[
          { field: tr('Precio'), from: priceText(offer), to: f.price === '' ? tr('Precio por definir') : `${priceMoney(f.price)} ${f.currency}` },
          { field: tr('Estado'), from: offer.active ? tr('Activo') : tr('Inactivo'), to: f.active ? tr('Activo') : tr('Inactivo') },
        ]}
        loading={state.busy}
        onConfirm={save}
        onClose={() => setConfirm(false)}
      />
    </article>
  );
}

export default function AdminPricing() {
  const { user } = useAuth();
  const res = useAsync(() => api.get('/admin/pricing'), []);
  const canEdit = user?.adminLevel === 'FULL';
  return (
    <>
      <PageHeader kicker={tr('Comercial')} title={tr('Precios y accesos')} subtitle={tr('Los precios provienen de la base de datos. Ninguno está escrito en el código.')} />
      <Notice>{tr('Si un precio no está configurado, la plataforma muestra “Precio por definir” y el entorno de pruebas permite simular la compra.')}</Notice>
      <AsyncView {...res} onRetry={res.reload}>
        {(offers) => (
          <>
            <Card title={tr('Acceso completo anual')}>
              <div className="price-grid single">{offers.filter((o) => o.type === 'FULL_ANNUAL').map((o) => <OfferEditor key={`${o.code}-${o.price}-${o.active}`} offer={o} onSaved={res.reload} canEdit={canEdit} />)}</div>
            </Card>
            <Card title={tr('Solo herramientas · un solo pago mensual por las 12 herramientas')}>
              <div className="price-grid single">{offers.filter((o) => o.type === 'TOOL_ONLY' && !o.moduleNumber).map((o) => <OfferEditor key={`${o.code}-${o.price}-${o.active}`} offer={o} onSaved={res.reload} canEdit={canEdit} />)}</div>
            </Card>
          </>
        )}
      </AsyncView>
    </>
  );
}
