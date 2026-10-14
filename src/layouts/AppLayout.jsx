// Layout del área privada. Lo usan el cliente y el administrador ("Ver / gestionar como cliente").
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { Brand, Disclaimer } from '../components/layout/Brand.jsx';
import { PeriodSelector } from '../features/periods/PeriodControls.jsx';
import { ADMIN_LEVELS } from '../utils/labels.js';

export const NAV = [
  { to: '', icon: '⌂', label: 'Inicio', end: true },
  { to: 'academia', icon: '▤', label: 'Academia financiera' },
  { to: 'cartera', icon: '◈', label: 'Mi cartera' },
  { to: 'patrimonio', icon: '◫', label: 'Patrimonio' },
  { to: 'ingresos-gastos', icon: '↕', label: 'Ingresos y gastos' },
  { to: 'proteccion', icon: '▣', label: 'Protección financiera' },
  { to: 'deudas', icon: '⊟', label: 'Deudas' },
  { to: 'negocios', icon: '▥', label: 'Negocios y flujo' },
  { to: 'allocation', icon: '◉', label: 'Allocation' },
  { to: 'movimientos', icon: '⇄', label: 'Movimientos patrimoniales' },
  { to: 'cortes', icon: '▧', label: 'Cortes mensuales' },
  { to: 'informe-anual', icon: '◎', label: 'Informe anual' },
  { to: 'asesoria', icon: '◌', label: 'Asesoría personalizada' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { basePath, isAdminView, client, canEdit } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className={`app ${menuOpen ? 'menu-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand to={basePath} />
          <button className="icon-btn menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menú" aria-expanded={menuOpen}>
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to ? `${basePath}/${n.to}` : basePath} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="ico">{n.icon}</span>{n.label}
            </NavLink>
          ))}
          {!isAdminView && (
            <NavLink to="/suscripcion" className={({ isActive }) => (isActive ? 'active' : '')}><span className="ico">◇</span>Mi suscripción</NavLink>
          )}
          {isAdminView && <Link to="/admin"><span className="ico">←</span>Panel administrativo</Link>}
          <button className="nav-logout" onClick={logout}><span className="ico">⎋</span>Cerrar sesión</button>
        </nav>
        <div className="userbox">
          {user?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}: {user?.name}
          <br />
          <span>{isAdminView ? ADMIN_LEVELS[user?.adminLevel] : 'Cuenta educativa activa'}</span>
        </div>
      </aside>

      <main className="main">
        {isAdminView && (
          <div className="admin-banner">
            <span>
              Gestionando como cliente: <b>{client?.name || '…'}</b> {client?.email && <span className="muted">· {client.email}</span>}
              {!canEdit && <span className="pill warn">Solo visualización</span>}
            </span>
            <Link to="/admin" className="btn-secondary">Salir de la vista del cliente</Link>
          </div>
        )}
        <div className="topbar">
          <PeriodSelector />
        </div>
        <Outlet />
        <Disclaimer />
      </main>
    </div>
  );
}
