import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { WorkspaceProvider } from '../context/WorkspaceContext.jsx';
import { Brand, Disclaimer } from '../components/layout/Brand.jsx';
import { ErrorState, Loading } from '../components/ui/States.jsx';
import { ADMIN_LEVELS } from '../utils/labels.js';
import { AppLayout } from './AppLayout.jsx';

const NAV = [
  { to: '/admin', icon: '◫', label: 'Clientes', end: true },
  { to: '/admin/citas', icon: '◌', label: 'Citas de asesoría' },
  { to: '/admin/bitacora', icon: '▤', label: 'Historial de cambios' },
  { to: '/admin/equipo', icon: '◈', label: 'Administradores', full: true },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className={`app ${menuOpen ? 'menu-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand to="/admin" sub="PANEL ADMINISTRATIVO" />
          <button className="icon-btn menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menú">{menuOpen ? '×' : '☰'}</button>
        </div>
        <nav className="nav">
          {NAV.filter((n) => !n.full || user?.adminLevel === 'FULL').map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="ico">{n.icon}</span>{n.label}
            </NavLink>
          ))}
          <button className="nav-logout" onClick={logout}><span className="ico">⎋</span>Cerrar sesión</button>
        </nav>
        <div className="userbox">Administrador: {user?.name}<br /><span>{ADMIN_LEVELS[user?.adminLevel] || 'Sin nivel asignado'}</span></div>
      </aside>
      <main className="main">
        <Outlet />
        <Disclaimer />
      </main>
    </div>
  );
}

// "Ver / gestionar como cliente": misma interfaz y mismos registros del cliente.
export function AdminClientWorkspace() {
  const { clientId } = useParams();
  const [state, setState] = useState({ client: null, error: null });
  useEffect(() => {
    api.get(`/admin/clients/${clientId}`).then((client) => setState({ client, error: null })).catch((error) => setState({ client: null, error }));
  }, [clientId]);
  if (state.error) return <div className="main"><ErrorState error={state.error} /></div>;
  if (!state.client) return <Loading />;
  return (
    <WorkspaceProvider key={clientId} clientId={clientId} client={state.client}>
      <AppLayout />
    </WorkspaceProvider>
  );
}
