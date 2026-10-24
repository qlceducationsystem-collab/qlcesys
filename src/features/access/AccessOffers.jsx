import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { date } from '../../utils/format.js';
import { Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { BRAND_FULL } from '../../components/layout/Brand.jsx';
import { CheckoutModal, offerPrice } from './CheckoutModal.jsx';
import { tr } from '../../i18n/tr.js';

const TOOL_LABELS = {
  1: 'Diagnóstico financiero',
  2: 'Mapa de productos',
  3: 'Constructor de cartera',
  4: 'Riesgo y exposición',
  5: 'Simulador de operación',
  6: 'Operación profesional',
  7: 'Presupuesto y control',
  8: 'Fondo de emergencia',
  9: 'Panel de obligaciones',
  10: 'Rendimiento neto',
  11: 'Poder adquisitivo',
  12: 'Evolución patrimonial',
};

export function AccessOffers({ title = 'Dos formas de adquirir QLC Financial Education', compact }) {
  const { accessInfo, access } = useAuth();
  const [selected, setSelected] = useState(null);
  const offers = accessInfo?.offers || [];
  const full = offers.find((o) => o.type === 'FULL_ANNUAL');
  const tools = offers.filter((o) => o.type === 'TOOL_ONLY');

  return (
    <section className={`offers ${compact ? 'is-compact' : ''}`}>
      <header className="offers-head">
        <div className="section-kicker">{tr(BRAND_FULL)}</div>
        <h2>{tr(title)}</h2>
        <p className="muted">{tr('Elige el programa completo o adquiere únicamente las herramientas que necesitas. Los datos que registres siempre se conservan.')}</p>
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
              <li>{tr('Mi cartera, patrimonio, cortes e informe anual')}</li>
              <li>{tr('Orientación financiera personalizada en sesiones 1 a 1')}</li>
            </ul>
            <div className="offer-price">{offerPrice(full)}</div>
            <Button onClick={() => setSelected(full)}>{access.full ? tr('Renovar acceso anual') : tr('Adquirir acceso completo')}</Button>
          </article>
        )}
        <article className="offer-card">
          <div className="offer-top"><span className="offer-tag">{tr('Opción 2')}</span></div>
          <h3>{tr('Solo herramientas')}</h3>
          <p>{tr('Sin la academia: pagas una mensualidad por la herramienta práctica de cada módulo que necesites.')}</p>
          <ul className="offer-tools">
            {tools.map((t) => {
              const owned = !!access.full || access.tools.includes(t.moduleNumber);
              const until = access.toolAccess?.find((x) => x.moduleNumber === t.moduleNumber)?.expiresAt;
              return (
                <li key={t.code} className={owned ? 'is-owned' : ''}>
                  <span className="offer-tool-n">M{t.moduleNumber}</span>
                  <span className="offer-tool-name">{TOOL_LABELS[t.moduleNumber] || t.name}<small>{offerPrice(t)}{' '}{tr('/ mes')}{until && !access.full ? tr(' · vigente hasta {date}', { date: date(until) }) : ''}</small></span>
                  {owned && !until ? <Pill>{tr('Activa')}</Pill> : <Button variant="secondary" onClick={() => setSelected(t)}>{owned ? 'Renovar' : 'Suscribirme'}</Button>}
                </li>
              );
            })}
          </ul>
        </article>
      </div>
      {selected && <CheckoutModal offer={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
