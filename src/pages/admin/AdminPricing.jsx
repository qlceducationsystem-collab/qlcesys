import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { money } from '../../utils/format.js';
import { Card, Notice, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Field, FormError, Input, MoneyInput } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';

const priceText = (o) => (o.price === null ? 'Precio por definir' : `${money(o.price)} ${o.currency}`);

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
        accessDays: offer.type === 'FULL_ANNUAL' ? Number(f.accessDays || 365) : null,
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
        <span className="price-code">{offer.type === 'FULL_ANNUAL' ? 'Acceso completo anual' : `Herramienta M${offer.moduleNumber}`}</span>
        <Pill variant={offer.active ? '' : 'muted'}>{offer.active ? 'Activo' : 'Inactivo'}</Pill>
      </header>
      <strong className="price-current">{priceText(offer)}</strong>
      <div className="form-grid cols-2">
        <Field label="Nombre" full><Input value={f.name} onChange={set('name')} disabled={!canEdit} /></Field>
        <Field label="Precio" hint="Vacío = Precio por definir"><MoneyInput value={f.price} onChange={set('price')} disabled={!canEdit} placeholder="Por definir" /></Field>
        <Field label="Moneda"><Input maxLength={3} value={f.currency} onChange={set('currency')} disabled={!canEdit} /></Field>
        {offer.type === 'FULL_ANNUAL' && <Field label="Días de acceso"><Input type="number" min="1" value={f.accessDays} onChange={set('accessDays')} disabled={!canEdit} /></Field>}
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} disabled={!canEdit} /> Disponible para compra</label>
      </div>
      <FormError error={state.error} />
      {canEdit && <Button onClick={() => setConfirm(true)}>Guardar</Button>}
      <ConfirmDialog
        open={confirm}
        title="Confirmar cambio de precio"
        message="El cambio se aplica a nuevas compras y queda registrado en la auditoría."
        details={[
          { field: 'Precio', from: priceText(offer), to: f.price === '' ? 'Precio por definir' : `${money(f.price)} ${f.currency}` },
          { field: 'Estado', from: offer.active ? 'Activo' : 'Inactivo', to: f.active ? 'Activo' : 'Inactivo' },
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
      <PageHeader kicker="Comercial" title="Precios y accesos" subtitle="Los precios provienen de la base de datos. Ninguno está escrito en el código." />
      <Notice>Si un precio no está configurado, la plataforma muestra “Precio por definir” y el entorno de pruebas permite simular la compra.</Notice>
      <AsyncView {...res} onRetry={res.reload}>
        {(offers) => (
          <>
            <Card title="Acceso completo anual">
              <div className="price-grid single">{offers.filter((o) => o.type === 'FULL_ANNUAL').map((o) => <OfferEditor key={`${o.code}-${o.price}-${o.active}`} offer={o} onSaved={res.reload} canEdit={canEdit} />)}</div>
            </Card>
            <Card title="Solo herramientas · pago único por módulo">
              <div className="price-grid">{offers.filter((o) => o.type === 'TOOL_ONLY').map((o) => <OfferEditor key={`${o.code}-${o.price}-${o.active}`} offer={o} onSaved={res.reload} canEdit={canEdit} />)}</div>
            </Card>
          </>
        )}
      </AsyncView>
    </>
  );
}
