import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAsync } from '../../hooks/useAsync.js';
import { ACCESS_MODES } from '../../utils/labels.js';
import { Card, PageHeader, StatCard, StatGrid } from '../../components/ui/Card.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { BarChart } from '../../components/charts/Charts.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';

const count = (v) => `${Number(v).toLocaleString('es-MX')}`;
const dayLabel = (d, i) => (i % 5 === 0 ? d.slice(8, 10) : '');
const ACCESS_LABEL = { FULL_ANNUAL: ACCESS_MODES.FULL, TOOL_ONLY: ACCESS_MODES.TOOLS };

function ModuleFunnel({ modules }) {
  const max = Math.max(1, ...modules.map((m) => m.started));
  return (
    <div className="funnel">
      {modules.map((m) => (
        <div key={m.module} className="funnel-row">
          <span className="funnel-label">M{m.module}</span>
          <div className="funnel-track">
            <span className="funnel-started" style={{ width: `${(m.started / max) * 100}%` }} />
            <span className="funnel-completed" style={{ width: `${(m.completed / max) * 100}%` }} />
          </div>
          <span className="funnel-values"><b>{m.completed}</b> / {m.started}</span>
        </div>
      ))}
      <div className="funnel-legend"><span className="lg-started" />Iniciados <span className="lg-completed" />Completados</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const res = useAsync(() => api.get(`/admin/analytics?days=${days}`), [days]);
  return (
    <>
      <PageHeader
        kicker="Panel administrativo"
        title="Cómo va la plataforma"
        subtitle="Métricas de uso. No incluyen datos financieros de los clientes."
        actions={
          <div className="segmented" role="group" aria-label="Periodo">
            {[7, 30, 90].map((d) => <button key={d} type="button" className={days === d ? 'is-active' : ''} onClick={() => setDays(d)}>{d} días</button>)}
          </div>
        }
      />
      <AsyncView {...res} onRetry={res.reload}>
        {(m) => (
          <>
            <StatGrid>
              <StatCard label="Usuarios totales" value={count(m.users.total)} delta={`${m.users.new} nuevos en ${m.days} días`} deltaTone={m.users.new ? 'up' : ''} />
              <StatCard label="Clientes con acceso activo" value={count(m.users.activeClients)} accent />
              <StatCard label="Inicios de sesión" value={count(m.logins)} delta={`${m.registrations} registros`} />
              <StatCard label="Progreso promedio" value={`${m.averageProgress}%`} delta={`${m.learners} alumnos con módulos iniciados`} />
            </StatGrid>
            <StatGrid>
              <StatCard label="Pagos simulados aprobados" value={count(m.payments.approved)} deltaTone="up" />
              <StatCard label="Pagos simulados rechazados" value={count(m.payments.rejected)} />
              <StatCard label="Visitas a la página pública" value={count(m.publicViews.total)} delta={`${m.publicViews.uniqueSessions} sesiones únicas`} />
              <StatCard label="Pagos pendientes" value={count(m.payments.pending)} />
            </StatGrid>
            <div className="layout even">
              <Card title="Visitas públicas por día">
                <BarChart data={m.series.publicViews.map((d, i) => ({ label: dayLabel(d.date, i), value: d.count, hint: d.date }))} format={count} />
              </Card>
              <Card title="Registros e inicios de sesión">
                <BarChart data={m.series.logins.map((d, i) => ({ label: dayLabel(d.date, i), value: d.count + m.series.registrations[i].count, hint: `${d.count} inicios · ${m.series.registrations[i].count} registros` }))} format={count} />
              </Card>
            </div>
            <div className="layout">
              <Card title="Módulos iniciados y completados · Bloque 1"><ModuleFunnel modules={m.modules.filter((x) => x.module <= 6)} /></Card>
              <Card title="Tipo de acceso elegido">
                <DataTable rowKey="key" rows={m.accessTypes} empty="Sin accesos activos" columns={[
                  { key: 'key', label: 'Modalidad', render: (r) => ACCESS_LABEL[r.key] || r.key },
                  { key: 'count', label: 'Accesos', align: 'right' },
                ]} />
              </Card>
            </div>
            <Card title="Secciones públicas visitadas">
              <DataTable rowKey="key" rows={m.sections} empty="Sin visitas registradas" columns={[
                { key: 'key', label: 'Sección' },
                { key: 'count', label: 'Visitas', align: 'right' },
              ]} />
            </Card>
          </>
        )}
      </AsyncView>
    </>
  );
}
