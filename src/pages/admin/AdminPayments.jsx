import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime, priceMoney } from '../../utils/format.js';
import { PAYMENT_STATUS } from '../../utils/labels.js';
import { Card, PageHeader, Pill, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { tr } from '../../i18n/tr.js';

const statusOptions = [{ value: '', label: 'Todos' }, ...Object.entries(PAYMENT_STATUS).map(([value, label]) => ({ value, label }))];

export default function AdminPayments() {
  const [status, setStatus] = useState('');
  const res = useAsync(() => api.get(`/admin/payments${status ? `?status=${status}` : ''}`), [status]);
  const rows = res.data || [];
  const by = (s) => rows.filter((r) => r.status === s).length;
  return (
    <>
      <PageHeader
        kicker={tr('Comercial')}
        title={tr('Pagos de prueba')}
        subtitle={tr('Intentos de pago registrados en Neon por el proveedor simulado.')}
        actions={<Select className="month" value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} aria-label={tr('Estado')} />}
      />
      <StatGrid cols={3}>
        <StatCard label={tr('Aprobados')} value={by('APPROVED')} />
        <StatCard label={tr('Rechazados')} value={by('REJECTED')} />
        <StatCard label={tr('Pendientes')} value={by('PENDING')} />
      </StatGrid>
      <Card>
        <AsyncView {...res} onRetry={res.reload}>
          {(list) => (
            <DataTable rows={list} empty={tr('Sin intentos de pago.')} columns={[
              { key: 'createdAt', label: tr('Fecha'), render: (a) => dateTime(a.createdAt) },
              { key: 'user', label: tr('Cliente'), render: (a) => <Link to={`/admin/clientes/${a.user.id}`}>{tr(a.user.name)}<span className="small block">{a.user.email}</span></Link> },
              { key: 'offer', label: tr('Producto'), render: (a) => a.offer?.name },
              { key: 'amount', label: tr('Monto'), align: 'right', render: (a) => (a.amount === null ? tr('Por definir') : `${priceMoney(a.amount)} ${a.currency}`) },
              { key: 'provider', label: tr('Proveedor'), render: (a) => (a.provider === 'MOCK' ? 'Simulado' : a.provider) },
              { key: 'status', label: tr('Estado'), render: (a) => <Pill variant={a.status === 'APPROVED' ? '' : a.status === 'REJECTED' ? 'bad' : 'warn'}>{tr(PAYMENT_STATUS[a.status])}</Pill> },
            ]} />
          )}
        </AsyncView>
      </Card>
    </>
  );
}
