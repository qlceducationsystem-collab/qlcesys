import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { Brand, Disclaimer } from '../components/layout/Brand.jsx';
import { PeriodSelector } from '../features/periods/PeriodControls.jsx';
import { AccessOffers } from '../features/access/AccessOffers.jsx';
import { SecurityNavButton } from '../features/security/AccountSecurity.jsx';
import { ACCESS_MODES, ADMIN_LEVELS } from '../utils/labels.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher.jsx';

export const NAV = [
  { to: '', icon: '⌂', label: 'home', end: true },
  { to: 'academia', icon: '▤', label: 'academy', free: true },
  { to: 'cartera', icon: '◈', label: 'portfolio' },
  { to: 'patrimonio', icon: '◫', label: 'patrimony' },
  { to: 'ingresos-gastos', icon: '↕', label: 'cashflow' },
  { to: 'proteccion', icon: '▣', label: 'protection' },
  { to: 'deudas', icon: '⊟', label: 'debts' },
  { to: 'negocios', icon: '▥', label: 'business' },
  { to: 'allocation', icon: '◉', label: 'allocation' },
  { to: 'movimientos', icon: '⇄', label: 'movements' },
  { to: 'cortes', icon: '▧', label: 'closes' },
  { to: 'informe-anual', icon: '◎', label: 'annual' },
  { to: 'asesoria', icon: '◌', label: 'advisory' },
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
  const { t, lang } = useI18n();
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
          <button type="button" className="icon-btn menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label={t('app.openMenu')} aria-expanded={menuOpen}>
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to ? `${basePath}/${n.to}` : basePath} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="ico">{n.icon}</span>{t(`app.nav.${n.label}`)}
              {!isAdminView && !hasAccess && !n.free && <span className="nav-lock" aria-label={t('app.requiresAccess')}>🔒</span>}
            </NavLink>
          ))}
          {!isAdminView && (
            <NavLink to={`${basePath}/acceso`} className={({ isActive }) => (isActive ? 'active' : '')}><span className="ico">◇</span>{t('app.myAccess')}</NavLink>
          )}
          {isAdminView && <Link to="/admin"><span className="ico">←</span>{t('app.adminPanel')}</Link>}
          {!isAdminView && <SecurityNavButton />}
          <button type="button" className="nav-logout" onClick={logout}><span className="ico">⎋</span>{t('app.logout')}</button>
        </nav>
        <div className="sidebar-lang"><LanguageSwitcher /></div>
        <div className="userbox">
          {user?.role === 'ADMIN' ? t('app.admin') : t('app.user')}: {user?.name}
          <br />
          <span>{isAdminView ? ADMIN_LEVELS[user?.adminLevel] : ACCESS_MODES[access.mode]}</span>
        </div>
      </aside>

      <main className="main">
        {isAdminView && (
          <div className="admin-banner">
            <span>
              {t('app.managingAs')} <b>{client?.name || '…'}</b> {client?.email && <span className="muted">· {client.email}</span>}
              {!canEdit && <span className="pill warn">{t('app.viewOnly')}</span>}
            </span>
            <Link to="/admin/clientes" className="btn-secondary">{t('app.exitClient')}</Link>
          </div>
        )}
        {(hasAccess || isAdminView) && !relative.startsWith('/academia') && !relative.startsWith('/acceso') && (
          <div className="topbar"><PeriodSelector /></div>
        )}
        <div className="page-enter" key={`${location.pathname}-${lang}`}>{gated ? <AccessGate /> : <Outlet />}</div>
        <Disclaimer />
      </main>
    </div>
  );
}
