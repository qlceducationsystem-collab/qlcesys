import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { Brand, Disclaimer } from '../components/layout/Brand.jsx';
import { PeriodSelector } from '../features/periods/PeriodControls.jsx';
import { AccessOffers } from '../features/access/AccessOffers.jsx';
import { ACCESS_MODES, ADMIN_LEVELS } from '../utils/labels.js';

export const NAV = [
  { to: '', icon: '⌂', label: 'Inicio', end: true },
  { to: 'academia', icon: '▤', label: 'Academia', free: true },
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

const FREE_PATHS = ['/academia', '/acceso'];

function AccessGate() {
  return (
    <div className="access-gate">
      <AccessOffers />
    </div>
  );
}

export function AppLayout() {
  const { user, logout, hasAccess, access } = useAuth();
  const { basePath, isAdminView, client, canEdit } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const relative = location.pathname.slice(basePath.length);
  const gated = !isAdminView && !hasAccess && !FREE_PATHS.some((p) => relative.startsWith(p));

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`app ${menuOpen ? 'menu-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand to={basePath} />
          <button type="button" className="icon-btn menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menú" aria-expanded={menuOpen}>
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to ? `${basePath}/${n.to}` : basePath} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="ico">{n.icon}</span>{n.label}
              {!isAdminView && !hasAccess && !n.free && <span className="nav-lock" aria-label="Requiere acceso">🔒</span>}
            </NavLink>
          ))}
          {!isAdminView && (
            <NavLink to={`${basePath}/acceso`} className={({ isActive }) => (isActive ? 'active' : '')}><span className="ico">◇</span>Mi acceso</NavLink>
          )}
          {isAdminView && <Link to="/admin"><span className="ico">←</span>Panel administrativo</Link>}
          <button type="button" className="nav-logout" onClick={logout}><span className="ico">⎋</span>Cerrar sesión</button>
        </nav>
        <div className="userbox">
          {user?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}: {user?.name}
          <br />
          <span>{isAdminView ? ADMIN_LEVELS[user?.adminLevel] : ACCESS_MODES[access.mode]}</span>
        </div>
      </aside>

      <main className="main">
        {isAdminView && (
          <div className="admin-banner">
            <span>
              Gestionando como cliente: <b>{client?.name || '…'}</b> {client?.email && <span className="muted">· {client.email}</span>}
              {!canEdit && <span className="pill warn">Solo visualización</span>}
            </span>
            <Link to="/admin/clientes" className="btn-secondary">Salir de la vista del cliente</Link>
          </div>
        )}
        {(hasAccess || isAdminView) && !relative.startsWith('/academia') && !relative.startsWith('/acceso') && (
          <div className="topbar"><PeriodSelector /></div>
        )}
        <div className="page-enter" key={location.pathname}>{gated ? <AccessGate /> : <Outlet />}</div>
        <Disclaimer />
      </main>
    </div>
  );
}
