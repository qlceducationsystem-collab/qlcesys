import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime, money } from '../../utils/format.js';
import { ACCESS_MODES, PAYMENT_STATUS } from '../../utils/labels.js';
import { Card, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { AccessOffers } from '../../features/access/AccessOffers.jsx';
import { tr } from '../../i18n/tr.js';

export default function AccessPage() {
  const { access, accessInfo } = useAuth();
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
            { key: 'amount', label: tr('Monto'), align: 'right', render: (a) => (a.amount === null ? tr('Por definir') : `${money(a.amount)} ${a.currency}`) },
            { key: 'provider', label: tr('Proveedor'), render: (a) => (a.provider === 'MOCK' ? 'Simulado' : a.provider) },
            { key: 'status', label: tr('Estado'), render: (a) => <Pill variant={a.status === 'APPROVED' ? '' : a.status === 'REJECTED' ? 'bad' : 'warn'}>{tr(PAYMENT_STATUS[a.status])}</Pill> },
          ]}
        />
      </Card>
    </>
  );
}
