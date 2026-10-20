import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime } from '../../utils/format.js';
import { Card, PageHeader, Pill, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Field, FormError, Select, Textarea } from '../../components/ui/Form.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { LEAD_INTERESTS } from '../../features/leads/LeadModal.jsx';

const STATUS = { NEW: ['Nueva', 'warn'], CONTACTED: ['Contactado', ''], CLOSED: ['Cerrada', 'muted'] };
const toOptions = (map, label = (v) => v) => Object.entries(map).map(([value, v]) => ({ value, label: label(v) }));

function LeadEditor({ lead, onClose, onSaved }) {
  const [f, setF] = useState({ status: lead.status, adminNotes: lead.adminNotes || '' });
  const [state, setState] = useState({ busy: false, error: null });
  const save = async () => {
    setState({ busy: true, error: null });
    try {
      await api.patch(`/admin/leads/${lead.id}`, f);
      onSaved();
    } catch (error) {
      setState({ busy: false, error });
    }
  };
  return (
    <Modal open title={`Solicitud de ${lead.name}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button loading={state.busy} onClick={save}>Guardar</Button></>}>
      <div className="stack">
        <p className="small">{lead.email}{lead.phone ? ` · ${lead.phone}` : ''} · {LEAD_INTERESTS[lead.interest]}</p>
        {lead.message && <p className="notice">{lead.message}</p>}
        <Field label="Estado"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} options={toOptions(STATUS, (v) => v[0])} /></Field>
        <Field label="Notas internas"><Textarea rows={3} maxLength={1000} value={f.adminNotes} onChange={(e) => setF({ ...f, adminNotes: e.target.value })} /></Field>
        <FormError error={state.error} />
      </div>
    </Modal>
  );
}

export default function AdminLeads() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ status: '', interest: '' });
  const [editing, setEditing] = useState(null);
  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  const res = useAsync(() => api.get(`/admin/leads${query ? `?${query}` : ''}`), [query]);
  const canEdit = user?.adminLevel === 'EDIT' || user?.adminLevel === 'FULL';

  return (
    <>
      <PageHeader kicker="Panel administrativo" title="Solicitudes de información" subtitle="Prospectos de Educación financiera, Institutional Trading Academy y Copytrading Institucional." />
      <AsyncView {...res} onRetry={res.reload}>
        {(d) => (
          <>
            <StatGrid cols={3}>
              <StatCard label="Nuevas" value={d.counts.NEW || 0} accent />
              <StatCard label="Contactadas" value={d.counts.CONTACTED || 0} />
              <StatCard label="Cerradas" value={d.counts.CLOSED || 0} />
            </StatGrid>
            <Card>
              <div className="form-grid cols-2">
                <Field label="Estado"><Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} placeholder="Todos" options={toOptions(STATUS, (v) => v[0])} /></Field>
                <Field label="Interés"><Select value={filters.interest} onChange={(e) => setFilters({ ...filters, interest: e.target.value })} placeholder="Todos" options={toOptions(LEAD_INTERESTS)} /></Field>
              </div>
              <DataTable
                rows={d.items}
                empty="Aún no hay solicitudes de información."
                columns={[
                  { key: 'createdAt', label: 'Fecha', render: (l) => dateTime(l.createdAt) },
                  { key: 'name', label: 'Contacto', render: (l) => <><b>{l.name}</b><span className="small block">{l.email}{l.phone ? ` · ${l.phone}` : ''}</span></> },
                  { key: 'interest', label: 'Interés', render: (l) => LEAD_INTERESTS[l.interest] },
                  { key: 'message', label: 'Mensaje', render: (l) => l.message || '—' },
                  { key: 'status', label: 'Estado', render: (l) => <Pill variant={STATUS[l.status][1]}>{STATUS[l.status][0]}</Pill> },
                  ...(canEdit ? [{ key: 'x', label: '', align: 'right', render: (l) => <button type="button" className="btn-link" onClick={() => setEditing(l)}>Gestionar</button> }] : []),
                ]}
              />
            </Card>
          </>
        )}
      </AsyncView>
      {editing && <LeadEditor lead={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); res.reload(); }} />}
    </>
  );
}
