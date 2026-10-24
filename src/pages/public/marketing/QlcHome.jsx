import { useCallback } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { BrandLogo } from '../../../components/layout/BrandLogo.jsx';
import { AnimatedHeading } from '../../../components/public/AnimatedHeading.jsx';
import { SectionStage } from '../../../components/public/SectionStage.jsx';
import { SectionThread } from '../../../components/public/SectionThread.jsx';
import { LeadButton } from '../../../features/leads/LeadModal.jsx';
import { CopytradingButton } from '../experience/CopytradingFilter.jsx';
import { Eyebrow, MarketingFooter, MarketingShell } from './MarketingShell.jsx';

export const EDUCATION_PATH = '/educacion-financiera';
export const TRADING_PATH = '/trading-academy';

const SLIDES = ['inicio', 'productos', 'copytrading', 'enfoque', 'qlc'];

const PRODUCT_ROUTES = [
  { key: 'education', label: 'QLC Financial Education', to: EDUCATION_PATH },
  { key: 'trading', label: 'Institutional Trading Academy', to: TRADING_PATH },
];

const VALUE_ROUTES = [EDUCATION_PATH, TRADING_PATH, `${TRADING_PATH}#copytrading`];

function Reveal({ as: Tag = 'div', step = 0, className = '', children }) {
  return <Tag className={`reveal ${className}`} style={{ '--r': step }}>{children}</Tag>;
}

export default function QlcHome() {
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const requested = hash.slice(1);
  const active = SLIDES.includes(requested) ? requested : SLIDES[0];
  const go = useCallback((key) => navigate(key === SLIDES[0] ? '/' : `/#${key}`), [navigate]);

  if (params.get('s')) return <Navigate to={`${EDUCATION_PATH}?s=${encodeURIComponent(params.get('s'))}`} replace />;

  const slides = {
    inicio: () => (
      <div className="mk-wrap mk-slide mk-hero">
        <div className="mk-hero-copy">
          <Reveal step={0}><Eyebrow>{t('home.hero.eyebrow')}</Eyebrow></Reveal>
          <AnimatedHeading as="h1" text={t('home.hero.title')} highlight={t('home.hero.accent')} delay={120} />
          <Reveal as="p" step={3} className="mk-lead">{t('home.hero.lead')}</Reveal>
          <Reveal step={4} className="mk-note">{t('home.hero.note')}</Reveal>
          <Reveal step={5} className="mk-cta-row">
            <button type="button" className="mk-btn mk-primary" onClick={() => go('productos')}>{t('home.hero.primary')}</button>
            <button type="button" className="mk-btn mk-ghost" onClick={() => go('enfoque')}>{t('home.hero.secondary')}</button>
          </Reveal>
        </div>
        <div className="mk-visual mk-monogram reveal-visual" aria-hidden="true">
          <div className="mk-visual-head"><span>Quantum Liquidity Capital</span><span className="mk-status">● Learning ecosystem</span></div>
          <div className="mk-logo-stage"><BrandLogo /></div>
          <div className="mk-logo-title">QLC <small>Institutional Investment Academy</small></div>
          <div className="mk-metrics">
            {t('home.hero.metrics').map(([b, s]) => <div key={b}><b>{b}</b><small>{s}</small></div>)}
          </div>
        </div>
      </div>
    ),
    productos: () => (
      <div className="mk-wrap mk-slide">
        <div className="mk-head">
          <Reveal step={0}><Eyebrow>{t('home.products.eyebrow')}</Eyebrow></Reveal>
          <AnimatedHeading as="h2" text={t('home.products.title')} delay={80} />
          <Reveal as="p" step={2}>{t('home.products.text')}</Reveal>
        </div>
        <div className="mk-two mk-fill">
          {PRODUCT_ROUTES.map((route) => ({ ...route, ...t(`home.products.${route.key}`) })).map((p, i) => (
            <article key={p.key} className={`mk-product is-${p.key} reveal-card`} style={{ '--c': i * 2 }}>
              <span className="mk-pill">{p.pill}</span>
              <div className="mk-product-label">{p.label}</div>
              <h3>{p.title[0]}<span className={p.key === 'trading' ? 'mk-gold' : 'mk-accent'}>{p.title[1]}</span></h3>
              <p>{p.text}</p>
              <ul className="mk-checks">{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
              <Link className={`mk-btn ${p.key === 'trading' ? 'mk-ghost' : 'mk-primary'}`} to={p.to}>{p.cta}</Link>
            </article>
          ))}
        </div>
      </div>
    ),
    copytrading: () => (
      <div className="mk-wrap mk-slide mk-slide-center">
        <div className="mk-spotlight">
          <Reveal step={0}><Eyebrow tone="gold">{t('home.products.calloutEyebrow')}</Eyebrow></Reveal>
          <AnimatedHeading as="h2" text={t('home.products.calloutTitle')} delay={80} />
          <Reveal as="p" step={3}>{t('home.products.calloutBefore')}<strong>{t('home.products.calloutStrong')}</strong>{t('home.products.calloutAfter')}</Reveal>
          <Reveal step={4} className="mk-cta-row"><CopytradingButton>{t('home.products.calloutCta')}</CopytradingButton></Reveal>
        </div>
      </div>
    ),
    enfoque: () => (
      <div className="mk-wrap mk-slide">
        <div className="mk-head">
          <Reveal step={0}><Eyebrow>{t('home.approach.eyebrow')}</Eyebrow></Reveal>
          <AnimatedHeading as="h2" text={t('home.approach.title')} delay={80} />
          <Reveal as="p" step={2}>{t('home.approach.text')}</Reveal>
        </div>
        <div className="mk-grid mk-fill">
          {t('home.approach.values').map((v, i) => (
            <article key={v.num} className="mk-card mk-card-cta reveal-card" style={{ '--c': i * 2 }}>
              <div className="mk-num">{v.num}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
              <Link className="mk-btn mk-primary mk-sm" to={VALUE_ROUTES[i]}>{v.cta}</Link>
            </article>
          ))}
        </div>
      </div>
    ),
    qlc: () => (
      <div className="mk-wrap mk-slide mk-slide-center">
        <div className="mk-spotlight">
          <Reveal step={0}><Eyebrow>QLC · Institutional Investment Academy</Eyebrow></Reveal>
          <AnimatedHeading as="h2" text={t('home.closing.title')} delay={80} />
          <Reveal as="p" step={3}>{t('home.closing.text')}</Reveal>
          <Reveal step={4} className="mk-cta-row"><LeadButton interest="GENERAL">{t('home.closing.cta')}</LeadButton></Reveal>
          <Reveal as="p" step={5} className="mk-disclaimer">{t('home.closing.disclaimer')}</Reveal>
        </div>
        <Reveal step={6} className="mk-slide-foot"><MarketingFooter tagline={t('home.footerTagline')} /></Reveal>
      </div>
    ),
  };

  return (
    <MarketingShell
      staged
      title={t('home.title')}
      links={[{ href: '#productos', label: t('home.links.products') }, { href: '#enfoque', label: t('home.links.approach') }]}
      cta={<button type="button" className="mk-btn mk-primary mk-sm" onClick={() => go('productos')}>{t('home.navCta')}</button>}
      footerTagline={t('home.footerTagline')}
    >
      <div className="mk-stage-area">
        <SectionStage activeKey={active} render={(key) => slides[key]()} />
      </div>
      <SectionThread
        label={t('home.thread.label')}
        activeKey={active}
        onSelect={go}
        items={SLIDES.map((key) => ({ key, label: t(`home.thread.${key}`) }))}
      />
    </MarketingShell>
  );
}
