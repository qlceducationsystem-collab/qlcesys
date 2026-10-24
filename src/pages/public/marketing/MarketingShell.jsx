import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { BrandLogo } from '../../../components/layout/BrandLogo.jsx';
import { BRAND_FULL, BRAND_NAME, BRAND_TAGLINE } from '../../../components/layout/Brand.jsx';
import { LanguageSwitcher } from '../../../components/ui/LanguageSwitcher.jsx';
import { LeadRequestProvider } from '../../../features/leads/LeadModal.jsx';
import { LegalLinks } from '../legal/LegalPage.jsx';

export function Eyebrow({ children, tone = '' }) {
  return <div className={`mk-eyebrow ${tone}`}>{children}</div>;
}

export function MarketingFooter({ tagline }) {
  return (
    <div className="mk-wrap mk-foot">
      <span>© QLC · Quantum Liquidity Capital</span>
      <span>{tagline}</span>
      <LegalLinks />
    </div>
  );
}

export function MarketingShell({ title, links = [], cta, footerTagline, staged = false, children }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const home = user ? (user.role === 'ADMIN' ? '/admin' : '/app') : null;
  const { hash } = useLocation();

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (staged) return;
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }, [hash, title, staged]);

  useEffect(() => {
    if (!staged) return undefined;
    document.body.classList.add('public-locked');
    return () => document.body.classList.remove('public-locked');
  }, [staged]);

  return (
    <LeadRequestProvider>
      <div className={`mk ${staged ? 'is-staged' : ''}`}>
        <header className={`mk-header ${open ? 'is-open' : ''}`}>
          <div className="mk-wrap mk-nav">
            <Link className="mk-brand" to="/" aria-label={BRAND_FULL}>
              <BrandLogo width="42" height="36" />
              <span><strong>{BRAND_NAME}</strong><small>{BRAND_TAGLINE}</small></span>
            </Link>
            <nav className="mk-links" aria-label={t('common.mainNav')}>
              {links.map((l) => (l.to
                ? <Link key={l.label} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
                : <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>))}
            </nav>
            <div className="mk-actions">
              <LanguageSwitcher />
              {home ? <Link className="mk-btn mk-ghost mk-sm" to={home}>{t('common.myPlatform')}</Link> : <Link className="mk-btn mk-ghost mk-sm mk-login" to="/login">{t('common.login')}</Link>}
              {cta}
              <button type="button" className="mk-burger" aria-label={t('common.openMenu')} aria-expanded={open} onClick={() => setOpen((v) => !v)}><span /><span /></button>
            </div>
          </div>
        </header>
        <main className={staged ? 'mk-stage' : undefined}>{children}</main>
        {!staged && (
          <footer className="mk-footer">
            <MarketingFooter tagline={footerTagline} />
          </footer>
        )}
      </div>
    </LeadRequestProvider>
  );
}
