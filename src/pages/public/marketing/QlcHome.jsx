import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { LeadButton } from '../../../features/leads/LeadModal.jsx';
import { Eyebrow, MarketingShell } from './MarketingShell.jsx';

export const EDUCATION_PATH = '/educacion-financiera';
export const TRADING_PATH = '/trading-academy';

const LINKS = [
  { href: '#productos', label: 'Programas' },
  { href: '#enfoque', label: '¿Por dónde comienzo?' },
];

const PRODUCTS = [
  {
    key: 'education',
    pill: 'Ruta 01 · Fundamentos',
    label: 'QLC Financial Education',
    title: ['Educación ', 'financiera'],
    text: 'Aprende a conocer tu situación financiera, organizar tus ingresos y gastos, construir una cartera y entender cómo se relacionan riesgo, rendimiento e inflación.',
    items: ['Diagnóstico de ingresos, gastos, deudas y patrimonio.', 'Organización y seguimiento de una cartera de inversiones.', 'Asignación, diversificación y exposición al riesgo.', 'Evaluación de resultados y reportes patrimoniales.'],
    to: EDUCATION_PATH,
    cta: 'Explorar educación financiera →',
  },
  {
    key: 'trading',
    pill: 'Ruta 02 · Formación avanzada',
    label: 'Institutional Trading Academy',
    title: ['Curso de ', 'trading'],
    text: 'Estudia el mercado con un proceso estructurado: hipótesis, datos, estadística, pruebas históricas, medición de escenarios y gestión de riesgo.',
    items: ['Microestructura, liquidez y estructura del precio.', 'Estadística aplicada y diseño de reglas objetivas.', 'Backtesting, MAE, MFE y validación fuera de muestra.', 'Construcción, control y evaluación de estrategias.'],
    to: TRADING_PATH,
    cta: 'Explorar curso de trading →',
  },
];

const VALUES = [
  { num: '01 · Organizar', title: 'Quiero ordenar mis finanzas', text: 'Empieza con Educación Financiera para conocer tu patrimonio, establecer objetivos y comprender mejor tus decisiones de inversión.', to: EDUCATION_PATH, cta: 'Ir a Educación financiera →' },
  { num: '02 · Profundizar', title: 'Quiero estudiar los mercados', text: 'Elige Trading Academy si buscas aprender análisis cuantitativo, pruebas de estrategias y evaluación sistemática del riesgo.', to: TRADING_PATH, cta: 'Ir a Trading Academy →' },
  { num: '03 · Explorar', title: 'Quiero invertir ahora', text: 'Solicita información sobre Copytrading Institucional y evalúa si sus condiciones y riesgos son compatibles con tu situación.', to: `${TRADING_PATH}#copytrading`, cta: 'Ir a Copytrading →' },
];

export default function QlcHome() {
  const [params] = useSearchParams();
  if (params.get('s')) return <Navigate to={`${EDUCATION_PATH}?s=${encodeURIComponent(params.get('s'))}`} replace />;

  return (
    <MarketingShell
      title="QLC · Academia de Inversiones"
      brandTitle="QLC"
      brandSub="Academia de Inversiones"
      links={LINKS}
      cta={<a className="mk-btn mk-primary mk-sm" href="#productos">Explorar programas ↗</a>}
      footerTagline="Educación financiera · Trading cuantitativo · Copytrading institucional"
    >
      <section className="mk-wrap mk-hero" id="inicio">
        <div>
          <Eyebrow>Quantum Liquidity Capital · Formación</Eyebrow>
          <h1>Construye tu conocimiento. <span className="mk-accent">Invierte con criterio.</span></h1>
          <p className="mk-lead">QLC Academia de Inversiones reúne dos rutas de aprendizaje complementarias: educación financiera para organizar y comprender tu patrimonio, y formación especializada en trading para estudiar los mercados con un enfoque cuantitativo.</p>
          <div className="mk-note">Primero entiende tu situación financiera. Después elige la formación que corresponde a tus objetivos, experiencia y capacidad de riesgo.</div>
          <div className="mk-cta-row">
            <a className="mk-btn mk-primary" href="#productos">Conocer los programas →</a>
            <a className="mk-btn mk-ghost" href="#enfoque">¿Cuál es para mí?</a>
          </div>
        </div>
        <div className="mk-visual mk-monogram" aria-hidden="true">
          <div className="mk-visual-head"><span>Quantum Liquidity Capital</span><span className="mk-status">● Learning ecosystem</span></div>
          <div className="mk-logo-stage"><img src="/brand/qlc-logo.png" alt="" /></div>
          <div className="mk-logo-title">QLC <small>Academia de Inversiones</small></div>
          <div className="mk-metrics">
            {[['Finanzas', 'Orden patrimonial'], ['Mercados', 'Análisis técnico'], ['Riesgo', 'Decisiones informadas']].map(([b, s]) => <div key={b}><b>{b}</b><small>{s}</small></div>)}
          </div>
        </div>
      </section>

      <section className="mk-section" id="productos">
        <div className="mk-wrap">
          <div className="mk-head">
            <Eyebrow>Dos productos · Una visión</Eyebrow>
            <h2>Elige tu ruta de formación.</h2>
            <p>Cada programa responde a una necesidad diferente. Puedes comenzar por las bases de las finanzas personales o profundizar en el análisis y la operativa de los mercados.</p>
          </div>
          <div className="mk-two">
            {PRODUCTS.map((p) => (
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
              <h3>¿Buscas participar en una estrategia en lugar de estudiar trading?</h3>
              <p>Conoce también el <strong>Copytrading Institucional de QLC</strong>, nuestro producto principal, y revisa su funcionamiento, condiciones y riesgos antes de tomar una decisión.</p>
            </div>
            <LeadButton interest="COPYTRADING">Conocer Copytrading →</LeadButton>
          </div>
        </div>
      </section>

      <section className="mk-section" id="enfoque">
        <div className="mk-wrap">
          <div className="mk-head">
            <Eyebrow>Una ruta adecuada para cada objetivo</Eyebrow>
            <h2>¿Por dónde conviene empezar?</h2>
            <p>No todos los alumnos necesitan lo mismo. La ruta depende de qué quieren aprender y de su punto de partida.</p>
          </div>
          <div className="mk-grid">
            {VALUES.map((v) => (
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
              <Eyebrow>QLC · Academia de Inversiones</Eyebrow>
              <h3>Aprender es el primer paso para decidir mejor.</h3>
              <p>Conoce los contenidos, el alcance y las condiciones de cada programa. La formación ayuda a desarrollar criterio; no elimina los riesgos ni garantiza resultados de inversión.</p>
            </div>
            <LeadButton interest="GENERAL">Solicitar información ↗</LeadButton>
          </div>
          <p className="mk-disclaimer">Aviso: contenido educativo e informativo; no constituye asesoría financiera personalizada ni promesa de rendimiento. Toda inversión y operativa de trading implica riesgos, incluidas pérdidas parciales o totales. Verifica las condiciones y la disponibilidad de cada producto en tu jurisdicción.</p>
        </div>
      </section>
    </MarketingShell>
  );
}
