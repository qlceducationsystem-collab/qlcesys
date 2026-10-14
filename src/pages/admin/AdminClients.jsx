import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAsync } from '../../hooks/useAsync.js';
import { date } from '../../utils/format.js';
import { SUBSCRIPTION_STATUS } from '../../utils/labels.js';
import { Card, PageHeader, Pill, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';

export const statusPill = (s) => <Pill variant={s === 'ACTIVE' ? '' : s === 'NONE' || s === 'PENDING' ? 'warn' : 'bad'}>{SUBSCRIPTION_STATUS[s] || s}</Pill>;

export default function AdminClients() {
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const stats = useAsync(() => api.get('/admin/stats'), []);
  const clients = useAsync(() => api.get(`/admin/clients?q=${encodeURIComponent(term)}`), [term]);

  return (
    <>
      <PageHeader title="Clientes" subtitle="Selecciona un cliente para ver o gestionar su información" />
      {stats.data && (
        <StatGrid>
          <StatCard label="Clientes" value={stats.data.clients} />
          <StatCard label="Membresías activas" value={stats.data.active} />
          <StatCard label="Citas pendientes" value={stats.data.pendingAppointments} />
          <StatCard label="Cortes vigentes" value={stats.data.closes} />
        </StatGrid>
      )}
      <Card title="Lista de clientes" actions={
        <form className="search" onSubmit={(e) => { e.preventDefault(); setTerm(q); }}>
          <Input placeholder="Buscar por nombre o correo" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar cliente" />
        </form>
      }>
        <AsyncView {...clients} onRetry={clients.reload}>
          {(list) => (
            <DataTable rows={list} empty="Sin clientes registrados." columns={[
              { key: 'name', label: 'Cliente', render: (c) => <>{c.name}<span className="small block">{c.email}</span></> },
              { key: 'status', label: 'Membresía', render: (c) => statusPill(c.effectiveStatus) },
              { key: 'month', label: 'Mes', render: (c) => (c.academy.currentMonth ? `Mes ${c.academy.currentMonth}` : '—') },
              { key: 'periods', label: 'Periodos / cortes', render: (c) => `${c.counts.periods} / ${c.counts.monthlyCloses}` },
              { key: 'createdAt', label: 'Registro', render: (c) => date(c.createdAt) },
              { key: 'x', label: 'Acciones', render: (c) => (
                <div className="row-actions">
                  <Link className="btn-link" to={`/admin/clientes/${c.id}`}>Detalle</Link>
                  <Link className="btn-secondary" to={`/admin/clientes/${c.id}/app`}>Ver / gestionar como cliente</Link>
                </div>
              ) },
            ]} />
          )}
        </AsyncView>
      </Card>
    </>
  );
}
