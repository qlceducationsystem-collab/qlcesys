import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime, money } from '../../utils/format.js';
import { PAYMENT_STATUS } from '../../utils/labels.js';
import { Card, PageHeader, Pill, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';

const statusOptions = [{ value: '', label: 'Todos' }, ...Object.entries(PAYMENT_STATUS).map(([value, label]) => ({ value, label }))];

export default function AdminPayments() {
  const [status, setStatus] = useState('');
  const res = useAsync(() => api.get(`/admin/payments${status ? `?status=${status}` : ''}`), [status]);
  const rows = res.data || [];
  const by = (s) => rows.filter((r) => r.status === s).length;
  return (
    <>
      <PageHeader
        kicker="Comercial"
        title="Pagos de prueba"
        subtitle="Intentos de pago registrados en Neon por el proveedor simulado."
        actions={<Select className="month" value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} aria-label="Estado" />}
      />
      <StatGrid cols={3}>
        <StatCard label="Aprobados" value={by('APPROVED')} />
        <StatCard label="Rechazados" value={by('REJECTED')} />
        <StatCard label="Pendientes" value={by('PENDING')} />
      </StatGrid>
      <Card>
        <AsyncView {...res} onRetry={res.reload}>
          {(list) => (
            <DataTable rows={list} empty="Sin intentos de pago." columns={[
              { key: 'createdAt', label: 'Fecha', render: (a) => dateTime(a.createdAt) },
              { key: 'user', label: 'Cliente', render: (a) => <Link to={`/admin/clientes/${a.user.id}`}>{a.user.name}<span className="small block">{a.user.email}</span></Link> },
              { key: 'offer', label: 'Producto', render: (a) => a.offer?.name },
              { key: 'amount', label: 'Monto', align: 'right', render: (a) => (a.amount === null ? 'Por definir' : `${money(a.amount)} ${a.currency}`) },
              { key: 'provider', label: 'Proveedor', render: (a) => (a.provider === 'MOCK' ? 'Simulado' : a.provider) },
              { key: 'status', label: 'Estado', render: (a) => <Pill variant={a.status === 'APPROVED' ? '' : a.status === 'REJECTED' ? 'bad' : 'warn'}>{PAYMENT_STATUS[a.status]}</Pill> },
            ]} />
          )}
        </AsyncView>
      </Card>
    </>
  );
}
