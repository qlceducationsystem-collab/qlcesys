import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime } from '../../utils/format.js';
import { Card, PageHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';

const ACTIONS = { CREATE: 'Alta', UPDATE: 'Modificación', DELETE: 'Eliminación', CLOSE_PERIOD: 'Cierre de periodo', GENERATE: 'Generación' };
const short = (v) => (v && v.length > 80 ? `${v.slice(0, 80)}…` : v || '—');

export function AuditTable({ items, hideClient }) {
  return (
    <DataTable rows={items} empty="Sin cambios administrativos registrados." columns={[
      { key: 'createdAt', label: 'Fecha', render: (l) => dateTime(l.createdAt) },
      ...(hideClient ? [] : [{ key: 'client', label: 'Cliente', render: (l) => l.client?.name || 'Sistema' }]),
      { key: 'admin', label: 'Administrador', render: (l) => l.admin?.name || 'Administrador eliminado' },
      { key: 'module', label: 'Sección' },
      { key: 'action', label: 'Acción', render: (l) => ACTIONS[l.action] || l.action },
      { key: 'field', label: 'Campo', render: (l) => l.field || '—' },
      { key: 'oldValue', label: 'Anterior', render: (l) => <span title={l.oldValue || ''}>{short(l.oldValue)}</span> },
      { key: 'newValue', label: 'Nuevo', render: (l) => <span title={l.newValue || ''}>{short(l.newValue)}</span> },
      { key: 'reason', label: 'Motivo', render: (l) => l.reason || '—' },
    ]} />
  );
}

export default function AdminAudit() {
  const [page, setPage] = useState(1);
  const res = useAsync(() => api.get(`/admin/audit?page=${page}`), [page]);
  return (
    <>
      <PageHeader title="Historial de cambios" subtitle="Trazabilidad de todas las modificaciones administrativas" />
      <Card>
        <AsyncView {...res} onRetry={res.reload}>
          {(d) => (
            <>
              <AuditTable items={d.items} />
              <div className="pager">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                <span className="small">Página {d.page} de {d.pages} · {d.total} registros</span>
                <Button variant="secondary" disabled={page >= d.pages} onClick={() => setPage(page + 1)}>Siguiente</Button>
              </div>
            </>
          )}
        </AsyncView>
      </Card>
    </>
  );
}
