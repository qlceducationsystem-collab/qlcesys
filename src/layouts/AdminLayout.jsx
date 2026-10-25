import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { WorkspaceProvider } from '../context/WorkspaceContext.jsx';
import { Brand, Disclaimer } from '../components/layout/Brand.jsx';
import { ErrorState, Loading } from '../components/ui/States.jsx';
import { SecurityNavButton } from '../features/security/AccountSecurity.jsx';
import { ADMIN_LEVELS } from '../utils/labels.js';
import { AppLayout } from './AppLayout.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher.jsx';

const NAV = [
  { group: 'general' },
  { to: '/admin', icon: '◎', label: 'dashboard', end: true },
  { to: '/admin/clientes', icon: '◫', label: 'clients' },
  { to: '/admin/solicitudes', icon: '✉', label: 'leads' },
  { to: '/admin/ejercicios', icon: '✎', label: 'exercises' },
  { to: '/admin/citas', icon: '◌', label: 'appointments' },
  { group: 'content' },
  { to: '/admin/archivos', icon: '▤', label: 'files' },
  { group: 'commercial' },
  { to: '/admin/precios', icon: '◇', label: 'pricing' },
  { to: '/admin/pagos', icon: '⇄', label: 'payments' },
  { group: 'system' },
  { to: '/admin/integraciones', icon: '⚙', label: 'integrations' },
  { to: '/admin/equipo', icon: '◈', label: 'team', full: true },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { t, lang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={`app ${menuOpen ? 'menu-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand to="/admin" />
          <button type="button" className="icon-btn menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label={t('app.openMenu')} aria-expanded={menuOpen}>{menuOpen ? '×' : '☰'}</button>
        </div>
        <nav className="nav">
          {NAV.filter((n) => !n.full || user?.adminLevel === 'FULL').map((n) =>
            n.group ? (
              <div key={n.group} className="nav-group">{t(`app.adminNav.${n.group}`)}</div>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="ico">{n.icon}</span>{t(`app.adminNav.${n.label}`)}
              </NavLink>
            ),
          )}
          <SecurityNavButton />
          <button type="button" className="nav-logout" onClick={logout}><span className="ico">⎋</span>{t('app.logout')}</button>
        </nav>
        <div className="sidebar-lang"><LanguageSwitcher /></div>
        <div className="userbox">{t('app.admin')}: {user?.name}<br /><span>{ADMIN_LEVELS[user?.adminLevel] || t('app.noLevel')}</span></div>
      </aside>
      <main className="main">
        <div className="page-enter" key={`${location.pathname}-${lang}`}><Outlet /></div>
        <Disclaimer />
      </main>
    </div>
  );
}

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
