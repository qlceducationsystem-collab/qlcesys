import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { LeadRequestProvider } from '../../../features/leads/LeadModal.jsx';
import { LegalLinks } from '../legal/LegalPage.jsx';

export function Eyebrow({ children, tone = '' }) {
  return <div className={`mk-eyebrow ${tone}`}>{children}</div>;
}

export function MarketingShell({ title, brandTitle, brandSub, links = [], cta, footerTagline, children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const home = user ? (user.role === 'ADMIN' ? '/admin' : '/app') : null;

  useEffect(() => {
    document.title = title;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <LeadRequestProvider>
      <div className="mk">
        <header className={`mk-header ${open ? 'is-open' : ''}`}>
          <div className="mk-wrap mk-nav">
            <Link className="mk-brand" to="/" aria-label="QLC · Academia de Inversiones">
              <img src="/brand/qlc-logo.png" alt="" width="42" height="36" />
              <span><strong>{brandTitle}</strong><small>{brandSub}</small></span>
            </Link>
            <nav className="mk-links" aria-label="Navegación principal">
              {links.map((l) => (l.to
                ? <Link key={l.label} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
                : <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>))}
            </nav>
            <div className="mk-actions">
              {home ? <Link className="mk-btn mk-ghost mk-sm" to={home}>Mi plataforma</Link> : <Link className="mk-btn mk-ghost mk-sm mk-login" to="/login">Iniciar sesión</Link>}
              {cta}
              <button type="button" className="mk-burger" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen((v) => !v)}><span /><span /></button>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mk-footer">
          <div className="mk-wrap mk-foot">
            <span>© QLC · Quantum Liquidity Capital</span>
            <span>{footerTagline}</span>
            <LegalLinks />
          </div>
        </footer>
      </div>
    </LeadRequestProvider>
  );
}
