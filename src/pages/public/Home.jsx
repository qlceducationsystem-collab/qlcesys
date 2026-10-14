import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAsync } from '../../hooks/useAsync.js';
import { money } from '../../utils/format.js';
import { PublicFooter, PublicNav } from '../../layouts/PublicLayout.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { CourseSection } from './CourseBlocks.jsx';
import { HERO, PLATFORM_FEATURES, SECTIONS } from './courseContent.js';

// URL externa de la página de QLC (configurable; sin valor se oculta el enlace).
const QLC_URL = import.meta.env.VITE_QLC_URL || '';

// Filtro previo hacia QLC: ¿conoce el copytrading? (documento del proyecto, sección 15).
function CopytradingFilter({ open, onClose }) {
  const [answer, setAnswer] = useState(null);
  const close = () => { setAnswer(null); onClose(); };
  return (
    <Modal open={open} title="Copytrading institucional QLC" onClose={close}>
      {answer === null && (
        <div className="stack">
          <p>¿Usted tiene conocimiento de qué es el copytrading?</p>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setAnswer('no')}>No</button>
            <button className="btn-primary" onClick={() => setAnswer('yes')}>Sí</button>
          </div>
        </div>
      )}
      {answer === 'yes' && (
        <div className="stack">
          <p>El contenido de QLC está dirigido a personas con conocimientos previos de copytrading y trading. Recuerda que es una estrategia de alto riesgo y que ningún resultado está garantizado.</p>
          {QLC_URL ? <a className="btn-primary" href={QLC_URL} target="_blank" rel="noopener noreferrer">Continuar a QLC</a>
            : <p className="muted small">La página de QLC estará disponible próximamente.</p>}
        </div>
      )}
      {answer === 'no' && (
        <div className="stack">
          <p>El contenido de QLC está dirigido a personas con conocimientos previos de copytrading y trading.</p>
          <p><b>Si está comenzando en el mundo de las inversiones, puede comenzar por educación financiera</b> y aprender a organizar sus finanzas, establecer metas y construir patrimonio.</p>
          <Link className="btn-primary" to="/registro" onClick={close}>Conocer QLC Financial Education</Link>
        </div>
      )}
    </Modal>
  );
}

function PlanPrice() {
  const plan = useAsync(() => api.get('/subscriptions/plan'), []);
  if (!plan.data?.amount) return null;
  return <p className="plan-price"><strong>{money(plan.data.amount)}</strong> {plan.data.currency} / mes</p>;
}

export default function Home() {
  const [filterOpen, setFilterOpen] = useState(false);
  const links = SECTIONS.map((s) => ({ href: `#clase-${s.id}`, label: s.id }));

  return (
    <div className="public">
      <PublicNav links={[...links, { href: '#plataforma', label: 'Plataforma' }]} />
      <main id="inicio">
        <section className="phero">
          <div className="container hero-grid">
            <div className="hero-main">
              <div className="eyebrow">{HERO.eyebrow}</div>
              <h1>{HERO.title[0]}<span className="accent">{HERO.title[1]}</span></h1>
              <p className="lead">{HERO.lead}</p>
              <div className="hero-note"><strong>{HERO.note[0]}</strong>{HERO.note[1]}</div>
              <div className="hero-actions">
                <a className="btn" href="#clase-01">Comenzar el curso gratuito</a>
                <a className="btn-ghost" href="#plataforma">Conocer la plataforma</a>
              </div>
            </div>
            <div className="qlc-hero-brand">
              <img alt="Quantum Liquidity Capital" src="/brand/qlc-logo.png" />
              <div className="brand-financial">Financial Education</div>
              <div className="brand-rule" />
            </div>
          </div>
        </section>

        {SECTIONS.map((s) => <CourseSection key={s.id} section={s} />)}

        <section className="cta">
          <div className="container cta-box">
            <div>
              <div className="eyebrow">Fin del curso</div>
              <h2>Primero construye la base. Después decide dónde participar.</h2>
              <p className="lead">La educación financiera comienza protegiendo lo esencial, manteniendo una fuente productiva de ingresos, construyendo liquidez y diversificando el patrimonio. Las inversiones pueden convertirse con el tiempo en una fuente importante de ingresos, pero el objetivo no es enriquecerse de la noche a la mañana: es construir un patrimonio suficientemente sólido para que, algún día, pueda trabajar por ti.</p>
            </div>
            <a className="btn" href="#clase-01">Repasar desde el inicio</a>
          </div>
        </section>

        <section id="plataforma" className="psection">
          <div className="container">
            <div className="section-head">
              <div className="kicker">QLC Financial Education · Plataforma</div>
              <h2>De aprender conceptos a aplicarlos sobre tu propia situación financiera</h2>
              <p>La plataforma no es una biblioteca de artículos: es educación financiera acompañada de herramientas para registrar, organizar, medir y comprender tu patrimonio mes a mes.</p>
            </div>
            <div className="pgrid pgrid-3">
              {PLATFORM_FEATURES.map(([t, d]) => <article className="pcard" key={t}><h3>{t}</h3><p>{d}</p></article>)}
            </div>
            <div className="quote">
              “No solamente aprender sobre dinero. Aprender a organizar, medir y comprender tu propio patrimonio.”
              <small>Membresía mensual con contenido progresivo.</small>
            </div>
            <div className="cta-box">
              <div>
                <h3>Comienza tu membresía</h3>
                <PlanPrice />
                <p className="pnote">El pago se procesa de forma segura con Mercado Pago. Puedes cancelar tu membresía; tu información se conserva.</p>
              </div>
              <Link className="btn" to="/registro">Crear mi cuenta</Link>
            </div>
          </div>
        </section>

        <section className="psection">
          <div className="container cta-box">
            <div>
              <div className="kicker">¿Ya conoces el trading?</div>
              <h2>Copytrading institucional QLC</h2>
              <p className="lead">QLC es una alternativa posterior dentro del ecosistema, dirigida a personas con conocimientos previos de copytrading.</p>
            </div>
            <button className="btn" onClick={() => setFilterOpen(true)}>Conocer copytrading institucional QLC</button>
          </div>
        </section>
      </main>
      <PublicFooter />
      <CopytradingFilter open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}
