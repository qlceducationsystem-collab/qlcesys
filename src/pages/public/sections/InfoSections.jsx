import { money } from '../../../utils/format.js';
import { responsiveImage } from '../../../utils/media.js';
import { MoreInfo, SectionCtas, SectionHead } from './SectionParts.jsx';

const priceLabel = (offer) => (offer?.price === null || offer?.price === undefined ? 'Precio por definir' : `${money(offer.price)} ${offer.currency}`);

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
  const layers = section.items || [];
  return (
    <div className="ps-container split">
      <div className="split-copy">
        <SectionHead section={section} />
        {section.secondaryText && <p className="ps-note reveal" style={{ '--r': 3 }}>{section.secondaryText}</p>}
        <SectionCtas section={section} go={go} />
      </div>
      <ol className="layers" aria-label="Capas del patrimonio">
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
  const items = section.items || [];
  return (
    <div className="ps-container features">
      <div className="features-head">
        <SectionHead section={section} />
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
          <MoreInfo label="Ver todas las funciones" title={section.title}>
            <ul className="modal-list">{items.map((f) => <li key={f.title}><b>{f.title}.</b> {f.text}</li>)}</ul>
          </MoreInfo>
        </div>
      )}
      <SectionImage section={section} />
    </div>
  );
}

export function AccessSection({ section, offers, go }) {
  const full = offers.find((o) => o.type === 'FULL_ANNUAL');
  const tools = offers.filter((o) => o.type === 'TOOL_ONLY');
  const [optionFull, optionTools] = section.items || [];
  return (
    <div className="ps-container access">
      <SectionHead section={section} compact />
      <div className="access-grid">
        <article className="access-card is-featured reveal-card" style={{ '--c': 0 }}>
          <span className="access-tag">{optionFull?.tag || 'Opción 1'}</span>
          <h3>{full?.name || optionFull?.title || 'Acceso completo anual'}</h3>
          <p>{optionFull?.text || full?.description}</p>
          <div className="access-price">{priceLabel(full)}</div>
          <ul className="access-list">
            <li>Academia con explicaciones de cada módulo</li>
            <li>Herramientas M1–M6</li>
            <li>Plataforma patrimonial completa</li>
          </ul>
        </article>
        <article className="access-card reveal-card" style={{ '--c': 1 }}>
          <span className="access-tag">{optionTools?.tag || 'Opción 2'}</span>
          <h3>{optionTools?.title || 'Solo herramientas'}</h3>
          <p>{optionTools?.text}</p>
          <ul className="access-tools">
            {tools.slice(0, 6).map((t) => (
              <li key={t.code}><span>M{t.moduleNumber}</span><em>{priceLabel(t)}</em></li>
            ))}
          </ul>
        </article>
      </div>
      <SectionCtas section={section} go={go} />
    </div>
  );
}

export function QlcSection({ section, go }) {
  return (
    <div className="ps-container qlc">
      <div className="qlc-panel">
        <SectionHead section={section} />
        {section.secondaryText && <p className="ps-risk reveal" style={{ '--r': 3 }}>{section.secondaryText}</p>}
        <SectionCtas section={section} go={go} />
      </div>
      <div className="qlc-steps reveal-visual" aria-hidden="true">
        {['Educación financiera', 'Ruta de mercados', 'Filtro de conocimientos', 'Copytrading QLC'].map((s, i) => (
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
