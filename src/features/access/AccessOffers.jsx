import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { date } from '../../utils/format.js';
import { Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { BRAND_FULL } from '../../components/layout/Brand.jsx';
import { CheckoutModal, offerPrice } from './CheckoutModal.jsx';
import { tr } from '../../i18n/tr.js';

const TOOL_LABELS = [
  'Diagnóstico financiero', 'Mapa de productos', 'Constructor de portafolio', 'Riesgo y exposición', 'Simulador de operación', 'Operación profesional',
  'Presupuesto y control', 'Fondo de emergencia', 'Panel de obligaciones', 'Rendimiento neto', 'Poder adquisitivo', 'Evolución patrimonial',
];

export function AccessOffers({ title = 'Dos formas de adquirir QLC Financial Education', compact }) {
  const { accessInfo, access } = useAuth();
  const [selected, setSelected] = useState(null);
  const offers = accessInfo?.offers || [];
  const full = offers.find((o) => o.type === 'FULL_ANNUAL');
  const tools = offers.find((o) => o.type === 'TOOL_ONLY');
  const toolsOwned = !!access.full || access.tools.length === TOOL_LABELS.length;
  const toolsUntil = toolsOwned && !access.full ? access.toolAccess.reduce((min, t) => (t.expiresAt && (!min || t.expiresAt < min) ? t.expiresAt : min), null) : null;

  return (
    <section className={`offers ${compact ? 'is-compact' : ''}`}>
      <header className="offers-head">
        <div className="section-kicker">{tr(BRAND_FULL)}</div>
        <h2>{tr(title)}</h2>
        <p className="muted">{tr('Elige el programa completo o adquiere únicamente las herramientas. Los datos que registres siempre se conservan.')}</p>
      </header>
      <div className="offers-grid">
        {full && (
          <article className="offer-card is-featured">
            <div className="offer-top">
              <span className="offer-tag">{tr('Opción 1')}</span>
              {access.full && <Pill>Activo hasta {date(access.full.expiresAt)}</Pill>}
            </div>
            <h3>{tr(full.name)}</h3>
            <p>{tr('Academia + explicaciones + herramientas durante el periodo anual configurado.')}</p>
            <ul className="offer-list">
              <li>{tr('Clases y explicaciones de cada módulo')}</li>
              <li>{tr('Herramientas M1–M12 conectadas a tu plataforma')}</li>
              <li>{tr('Mi portafolio de inversión, patrimonio, cortes e informe anual')}</li>
              <li>{tr('Orientación financiera personalizada en sesiones 1 a 1')}</li>
            </ul>
            <div className="offer-price">{offerPrice(full)}</div>
            <Button onClick={() => setSelected(full)}>{access.full ? tr('Renovar acceso anual') : tr('Adquirir acceso completo')}</Button>
          </article>
        )}
        {tools && (
          <article className="offer-card">
            <div className="offer-top">
              <span className="offer-tag">{tr('Opción 2')}</span>
              {toolsUntil && <Pill>{tr('Activo hasta {date}', { date: date(toolsUntil) })}</Pill>}
            </div>
            <h3>{tr('Solo herramientas')}</h3>
            <p>{tr('Sin la academia: un solo pago mensual te da acceso a las 12 herramientas prácticas.')}</p>
            <ul className="offer-tools">
              {TOOL_LABELS.map((label, i) => (
                <li key={label} className={toolsOwned ? 'is-owned' : ''}>
                  <span className="offer-tool-n">M{i + 1}</span>
                  <span className="offer-tool-name">{tr(label)}</span>
                </li>
              ))}
            </ul>
            <div className="offer-price">{offerPrice(tools)}{' '}{tr('/ mes')}</div>
            {toolsOwned && !toolsUntil ? <Pill>{tr('Activa')}</Pill> : <Button variant="secondary" onClick={() => setSelected(tools)}>{toolsOwned ? tr('Renovar herramientas') : tr('Suscribirme a las herramientas')}</Button>}
          </article>
        )}
      </div>
      {selected && <CheckoutModal offer={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
