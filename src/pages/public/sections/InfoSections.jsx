import { priceMoney } from '../../../utils/format.js';
import { responsiveImage } from '../../../utils/media.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { LegalLinks } from '../legal/LegalPage.jsx';
import { CtaButton, MoreInfo, SectionCtas, SectionHead } from './SectionParts.jsx';

const hasPrice = (offer) => offer?.price !== null && offer?.price !== undefined;
const priceLabel = (offer, t) => (hasPrice(offer) ? `${priceMoney(offer.price)} ${offer.currency}` : t('public.priceTbd'));

function SectionImage({ section }) {
  if (!section.image) return null;
  const img = responsiveImage(section.image.url, [360, 560, 840]);
  return (
    <div className="ps-image reveal-visual">
      <img {...img} sizes="(max-width: 820px) 60vw, 420px" alt={section.title} loading="lazy" decoding="async" />
    </div>
  );
}

export function LayersSection({ section, go }) {
  const { t } = useI18n();
  const layers = section.items || [];
  return (
    <div className="ps-container split">
      <div className="split-copy">
        <SectionHead section={section} />
        {section.secondaryText && <p className="ps-note reveal" style={{ '--r': 3 }}>{section.secondaryText}</p>}
        <SectionCtas section={section} go={go} />
      </div>
      <ol className="layers" aria-label={t('public.layers')}>
        {layers.map((l, i) => (
          <li key={l.title} className="layer reveal-card" style={{ '--c': i, '--w': `${100 - (layers.length - 1 - i) * 7}%` }}>
            <span className="layer-tag">{l.tag || String(i + 1).padStart(2, '0')}</span>
            <div>
              <b>{l.title}</b>
              <span>{l.text}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function FeatureSection({ section, go }) {
  const { t } = useI18n();
  const items = section.items || [];
  return (
    <div className="ps-container features">
      <div className="features-head">
        <SectionHead section={section} compact />
        {section.secondaryText && <p className="ps-lead features-extra reveal" style={{ '--r': 3 }}>{section.secondaryText}</p>}
        <SectionCtas section={section} go={go} />
      </div>
      <div className="feature-grid">
        {items.map((f, i) => (
          <article key={f.title} className={`feature reveal-card ${i > 3 ? 'is-secondary' : ''}`} style={{ '--c': i }}>
            <span className="feature-index">{String(i + 1).padStart(2, '0')}</span>
            <b>{f.title}</b>
            <p>{f.text}</p>
          </article>
        ))}
      </div>
      {items.length > 4 && (
        <div className="features-more">
          <MoreInfo label={t('public.allFeatures')} title={section.title}>
            <ul className="modal-list">{items.map((f) => <li key={f.title}><b>{f.title}.</b> {f.text}</li>)}</ul>
          </MoreInfo>
        </div>
      )}
      <SectionImage section={section} />
    </div>
  );
}

export function AccessSection({ section, offers, go }) {
  const { t, lang } = useI18n();
  const full = offers.find((o) => o.type === 'FULL_ANNUAL');
  const tools = offers.find((o) => o.type === 'TOOL_ONLY');
  const [optionFull, optionTools] = section.items || [];
  return (
    <div className="ps-container access">
      <SectionHead section={section} compact />
      <div className="access-grid">
        <article className="access-card is-featured reveal-card" style={{ '--c': 0 }}>
          <span className="access-tag">{optionFull?.tag || t('public.option1')}</span>
          <h3>{(lang === 'es' && full?.name) || optionFull?.title || t('public.fullAnnual')}</h3>
          <p>{optionFull?.text || (lang === 'es' ? full?.description : '')}</p>
          <div className="access-price">{priceLabel(full, t)}</div>
          <ul className="access-list">
            {t('public.fullIncludes').map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="access-card reveal-card" style={{ '--c': 1 }}>
          <span className="access-tag">{optionTools?.tag || t('public.option2')}</span>
          <h3>{optionTools?.title || t('public.toolsOnly')}</h3>
          <p>{optionTools?.text}</p>
          <div className="access-price">{priceLabel(tools, t)}<small>{t('public.perTool')}</small></div>
          <ul className="access-tools">
            {Array.from({ length: 12 }, (_, i) => <li key={i}><span>M{i + 1}</span></li>)}
          </ul>
        </article>
      </div>
      <SectionCtas section={section} go={go} />
    </div>
  );
}

export function RoutesSection({ section, go }) {
  return (
    <div className="ps-container routes">
      <SectionHead section={section} compact />
      <div className="routes-grid">
        {(section.items || []).map((r, i) => (
          <article key={r.title} className={`access-card route-card reveal-card ${r.gold ? 'is-gold' : i === 0 ? 'is-featured' : ''}`} style={{ '--c': i }}>
            <span className="access-tag">{r.tag}</span>
            {r.label && <span className="route-label">{r.label}</span>}
            <h3>{r.title}</h3>
            <p>{r.text}</p>
            {r.list?.length > 0 && <ul className="access-list route-list">{r.list.map((item) => <li key={item}>{item}</li>)}</ul>}
            <CtaButton label={r.cta} target={r.target} go={go} variant={i === 0 ? 'primary' : 'ghost'} />
          </article>
        ))}
      </div>
    </div>
  );
}

export function ClosingSection({ section, go }) {
  return (
    <div className="ps-container closing">
      <div className="closing-panel">
        <SectionHead section={section} />
        <SectionCtas section={section} go={go} />
        {section.secondaryText && <p className="closing-note reveal" style={{ '--r': 5 }}>{section.secondaryText}</p>}
      </div>
      <footer className="closing-foot reveal" style={{ '--r': 6 }}>
        <span>© QLC · Quantum Liquidity Capital</span>
        {section.footer && <span>{section.footer}</span>}
        <LegalLinks />
      </footer>
    </div>
  );
}

export function QlcSection({ section, go }) {
  const { t } = useI18n();
  return (
    <div className="ps-container qlc">
      <div className="qlc-panel">
        <SectionHead section={section} />
        {section.secondaryText && <p className="ps-risk reveal" style={{ '--r': 3 }}>{section.secondaryText}</p>}
        <SectionCtas section={section} go={go} />
      </div>
      <div className="qlc-steps reveal-visual" aria-hidden="true">
        {t('public.qlcSteps').map((s, i) => (
          <div key={s} className="qlc-step" style={{ '--c': i }}><span>{String(i + 1).padStart(2, '0')}</span>{s}</div>
        ))}
      </div>
    </div>
  );
}

export function GenericSection({ section, go }) {
  return (
    <div className="ps-container split">
      <div className="split-copy">
        <SectionHead section={section} />
        <SectionCtas section={section} go={go} />
      </div>
      {section.items?.length > 0 ? (
        <div className="feature-grid compact">
          {section.items.map((f, i) => (
            <article key={f.title} className="feature reveal-card" style={{ '--c': i }}><b>{f.title}</b><p>{f.text}</p></article>
          ))}
        </div>
      ) : <SectionImage section={section} />}
    </div>
  );
}
