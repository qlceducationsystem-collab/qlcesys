import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime, priceMoney } from '../../utils/format.js';
import { ACCESS_MODES, PAYMENT_STATUS } from '../../utils/labels.js';
import { Card, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, Input } from '../../components/ui/Form.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { AccessOffers } from '../../features/access/AccessOffers.jsx';
import { tr } from '../../i18n/tr.js';

function clearPeriodSelection() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith('qlc_period_')).forEach((k) => localStorage.removeItem(k));
  } catch {
    return;
  }
}

function ResetProfile() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [state, setState] = useState({ busy: false, error: null });
  const reset = async () => {
    setState({ busy: true, error: null });
    try {
      await api.post('/auth/reset-profile', { confirm: word.trim().toUpperCase() });
      clearPeriodSelection();
      window.location.assign('/app');
    } catch (error) {
      setState({ busy: false, error });
    }
  };
  return (
    <Card title={tr('Reiniciar mi perfil (pruebas)')}>
      <p className="small muted">{tr('Borra tu diagnóstico, periodos, cartera, ingresos y gastos, deudas, presupuestos, cortes y avance de la academia para empezar desde cero. Tu cuenta, tu verificación en dos pasos, tus pagos, tu acceso y tus citas se conservan. No se puede deshacer.')}</p>
      <Button variant="secondary" onClick={() => setOpen(true)}>{tr('Reiniciar mi perfil')}</Button>
      <Modal
        open={open}
        title={tr('¿Reiniciar tu perfil?')}
        onClose={() => setOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>{tr('Cancelar')}</Button><Button loading={state.busy} disabled={word.trim().toUpperCase() !== 'REINICIAR'} onClick={reset}>{tr('Borrar y empezar de cero')}</Button></>}
      >
        <div className="stack">
          <p>{tr('Se borrará toda tu información financiera y tu avance. Esta acción no se puede deshacer.')}</p>
          <Field label={tr('Escribe REINICIAR para confirmar')}><Input value={word} onChange={(e) => setWord(e.target.value)} autoComplete="off" /></Field>
          <FormError error={state.error} />
        </div>
      </Modal>
    </Card>
  );
}

export default function AccessPage() {
  const { access, accessInfo, user } = useAuth();
  const attempts = useAsync(() => api.get('/payments/attempts'), [accessInfo]);
  return (
    <>
      <PageHeader kicker={tr('Mi acceso')} title={tr('Acceso a QLC Financial Education')} subtitle={`Modalidad actual: ${ACCESS_MODES[access.mode]}`} />
      <AccessOffers title={tr('Formas de adquirir')} />
      <Card title={tr('Historial de pagos')}>
        <DataTable
          rows={attempts.data || []}
          empty={tr('Aún no hay intentos de pago.')}
          columns={[
            { key: 'createdAt', label: tr('Fecha'), render: (a) => dateTime(a.createdAt) },
            { key: 'offer', label: tr('Producto'), render: (a) => a.offer?.name },
            { key: 'amount', label: tr('Monto'), align: 'right', render: (a) => (a.amount === null ? tr('Por definir') : `${priceMoney(a.amount)} ${a.currency}`) },
            { key: 'provider', label: tr('Proveedor'), render: (a) => (a.provider === 'MOCK' ? 'Simulado' : a.provider) },
            { key: 'status', label: tr('Estado'), render: (a) => <Pill variant={a.status === 'APPROVED' ? '' : a.status === 'REJECTED' ? 'bad' : 'warn'}>{tr(PAYMENT_STATUS[a.status])}</Pill> },
          ]}
        />
      </Card>
      {user?.role === 'CLIENT' && <ResetProfile />}
    </>
  );
}
