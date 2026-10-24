import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { BrandLogo } from '../../../components/layout/BrandLogo.jsx';
import { LeadButton } from '../../../features/leads/LeadModal.jsx';
import { CopytradingButton } from '../experience/CopytradingFilter.jsx';
import { Eyebrow, MarketingShell } from './MarketingShell.jsx';

export const EDUCATION_PATH = '/educacion-financiera';
export const TRADING_PATH = '/trading-academy';

const PRODUCT_ROUTES = [
  { key: 'education', label: 'QLC Financial Education', to: EDUCATION_PATH },
  { key: 'trading', label: 'Institutional Trading Academy', to: TRADING_PATH },
];

const VALUE_ROUTES = [EDUCATION_PATH, TRADING_PATH, `${TRADING_PATH}#copytrading`];

export default function QlcHome() {
  const [params] = useSearchParams();
  const { t } = useI18n();
  if (params.get('s')) return <Navigate to={`${EDUCATION_PATH}?s=${encodeURIComponent(params.get('s'))}`} replace />;

  return (
    <MarketingShell
      title={t('home.title')}
      links={[{ href: '#productos', label: t('home.links.products') }, { href: '#enfoque', label: t('home.links.approach') }]}
      cta={<a className="mk-btn mk-primary mk-sm" href="#productos">{t('home.navCta')}</a>}
      footerTagline={t('home.footerTagline')}
    >
      <section className="mk-wrap mk-hero" id="inicio">
        <div>
          <Eyebrow>{t('home.hero.eyebrow')}</Eyebrow>
          <h1>{t('home.hero.title')} <span className="mk-accent">{t('home.hero.accent')}</span></h1>
          <p className="mk-lead">{t('home.hero.lead')}</p>
          <div className="mk-note">{t('home.hero.note')}</div>
          <div className="mk-cta-row">
            <a className="mk-btn mk-primary" href="#productos">{t('home.hero.primary')}</a>
            <a className="mk-btn mk-ghost" href="#enfoque">{t('home.hero.secondary')}</a>
          </div>
        </div>
        <div className="mk-visual mk-monogram" aria-hidden="true">
          <div className="mk-visual-head"><span>Quantum Liquidity Capital</span><span className="mk-status">● Learning ecosystem</span></div>
          <div className="mk-logo-stage"><BrandLogo /></div>
          <div className="mk-logo-title">QLC <small>Institutional Investment Academy</small></div>
          <div className="mk-metrics">
            {t('home.hero.metrics').map(([b, s]) => <div key={b}><b>{b}</b><small>{s}</small></div>)}
          </div>
        </div>
      </section>

      <section className="mk-section" id="productos">
        <div className="mk-wrap">
          <div className="mk-head">
            <Eyebrow>{t('home.products.eyebrow')}</Eyebrow>
            <h2>{t('home.products.title')}</h2>
            <p>{t('home.products.text')}</p>
          </div>
          <div className="mk-two">
            {PRODUCT_ROUTES.map((route) => ({ ...route, ...t(`home.products.${route.key}`) })).map((p) => (
              <article key={p.key} className={`mk-product is-${p.key}`}>
                <span className="mk-pill">{p.pill}</span>
                <div className="mk-product-label">{p.label}</div>
                <h3>{p.title[0]}<span className={p.key === 'trading' ? 'mk-gold' : 'mk-accent'}>{p.title[1]}</span></h3>
                <p>{p.text}</p>
                <ul className="mk-checks">{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
                <Link className={`mk-btn ${p.key === 'trading' ? 'mk-ghost' : 'mk-primary'}`} to={p.to}>{p.cta}</Link>
              </article>
            ))}
          </div>
          <div className="mk-callout">
            <div>
              <h3>{t('home.products.calloutTitle')}</h3>
              <p>{t('home.products.calloutBefore')}<strong>{t('home.products.calloutStrong')}</strong>{t('home.products.calloutAfter')}</p>
            </div>
            <CopytradingButton>{t('home.products.calloutCta')}</CopytradingButton>
          </div>
        </div>
      </section>

      <section className="mk-section" id="enfoque">
        <div className="mk-wrap">
          <div className="mk-head">
            <Eyebrow>{t('home.approach.eyebrow')}</Eyebrow>
            <h2>{t('home.approach.title')}</h2>
            <p>{t('home.approach.text')}</p>
          </div>
          <div className="mk-grid">
            {t('home.approach.values').map((v, i) => ({ ...v, to: VALUE_ROUTES[i] })).map((v) => (
              <article key={v.num} className="mk-card mk-card-cta">
                <div className="mk-num">{v.num}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
                <Link className="mk-btn mk-primary mk-sm" to={v.to}>{v.cta}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section" id="qlc">
        <div className="mk-wrap">
          <div className="mk-callout">
            <div>
              <Eyebrow>QLC · Institutional Investment Academy</Eyebrow>
              <h3>{t('home.closing.title')}</h3>
              <p>{t('home.closing.text')}</p>
            </div>
            <LeadButton interest="GENERAL">{t('home.closing.cta')}</LeadButton>
          </div>
          <p className="mk-disclaimer">{t('home.closing.disclaimer')}</p>
        </div>
      </section>
    </MarketingShell>
  );
}
