import { Link } from 'react-router-dom';
import { LeadButton } from '../../../features/leads/LeadModal.jsx';
import { Eyebrow, MarketingShell } from './MarketingShell.jsx';
import { APPROACHES, AUDIENCE, COPY_POINTS, KNOWLEDGE, REQUIREMENTS, TRADING_FAQ, TRADING_MODULES } from './tradingContent.js';

const LINKS = [
  { href: '#programa', label: 'Programa' },
  { href: '#perfil', label: 'Perfil' },
  { href: '#metodo', label: 'El método' },
  { href: '#copytrading', label: 'Copytrading' },
  { to: '/educacion-financiera', label: 'Educación financiera' },
];

const LINE = 'M15 202 L45 190 L68 207 L94 166 L120 178 L145 146 L168 157 L195 118 L222 139 L248 100 L273 117 L300 84 L325 110 L350 70 L378 91 L402 62 L428 81 L453 43 L480 62 L505 37 L530 53 L560 22 L585 31';

function QuantVisual() {
  return (
    <div className="mk-visual" aria-hidden="true">
      <div className="mk-visual-head"><span>QLC · Quantitative framework</span><span className="mk-status">● Sistema de análisis</span></div>
      <svg className="mk-chart" viewBox="0 0 600 260">
        <defs>
          <linearGradient id="mk-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#00a8ff" stopOpacity=".28" /><stop offset="1" stopColor="#00a8ff" stopOpacity="0" /></linearGradient>
        </defs>
        <g stroke="rgba(199,204,210,.12)" strokeWidth="1"><path d="M15 35H585M15 80H585M15 125H585M15 170H585M15 215H585" /><path d="M80 15V240M180 15V240M280 15V240M380 15V240M480 15V240" /></g>
        <path d={`${LINE} L585 240 L15 240Z`} fill="url(#mk-area)" />
        <path className="mk-chart-line" d={LINE} fill="none" stroke="#5bd4ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
        <path d="M15 153H585" stroke="#c89b3c" strokeWidth="1.5" strokeDasharray="6 6" />
        <text x="20" y="145" fill="#c89b3c" fontSize="11">Nivel de referencia</text>
        <circle cx="560" cy="22" r="5" fill="#f4f7fb" stroke="#00a8ff" strokeWidth="3" />
      </svg>
      <div className="mk-metrics">
        {[['Datos', 'Contexto histórico'], ['Reglas', 'Proceso repetible'], ['Riesgo', 'Exposición controlada']].map(([b, s]) => <div key={b}><b>{b}</b><small>{s}</small></div>)}
      </div>
    </div>
  );
}

export default function TradingAcademy() {
  return (
    <MarketingShell
      title="Institutional Trading Academy · QLC"
      brandTitle="Institutional"
      brandSub="Trading Academy · QLC"
      links={LINKS}
      cta={<LeadButton interest="TRADING_ACADEMY" className="mk-btn mk-primary mk-sm">Solicitar información ↗</LeadButton>}
      footerTagline="Formación cuantitativa · Gestión del riesgo · Disciplina"
    >
      <section className="mk-wrap mk-hero" id="inicio">
        <div>
          <Eyebrow>Formación avanzada · QLC</Eyebrow>
          <h1>Aprende a leer el mercado con <span className="mk-accent">criterio cuantitativo.</span></h1>
          <p className="mk-lead">Institutional Trading Academy es un programa de formación orientado al análisis sistemático, la medición del riesgo y la construcción de procesos de decisión. El objetivo no es perseguir cada movimiento: es aprender a evaluar escenarios con datos, reglas y disciplina.</p>
          <div className="mk-note">De la intuición a un proceso medible: hipótesis, evidencia histórica, control de exposición y evaluación continua.</div>
          <div className="mk-cta-row">
            <a className="mk-btn mk-primary" href="#programa">Explorar el programa →</a>
            <a className="mk-btn mk-ghost" href="#copytrading">Conocer Copytrading Institucional</a>
          </div>
        </div>
        <QuantVisual />
      </section>

      <section className="mk-section" id="programa">
        <div className="mk-wrap">
          <div className="mk-head">
            <Eyebrow>Ruta de aprendizaje</Eyebrow>
            <h2>Un programa por etapas, de los fundamentos a la validación.</h2>
            <p>Cada módulo desarrolla una competencia concreta. La secuencia está diseñada para que el alumno comprenda primero el riesgo y los datos, antes de construir, probar o aplicar un método operativo.</p>
          </div>
          <div className="mk-grid">
            {TRADING_MODULES.map(([title, text, tags], i) => (
              <article key={title} className="mk-card">
                <div className="mk-num">Módulo {String(i + 1).padStart(2, '0')}</div>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="mk-tags">{tags.map((t) => <span key={t}>{t}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section" id="perfil">
        <div className="mk-wrap">
          <div className="mk-head">
            <Eyebrow>Antes de inscribirte</Eyebrow>
            <h2>{AUDIENCE.title}</h2>
            {AUDIENCE.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="mk-two">
            <article className="mk-panel">
              <Eyebrow>Base sugerida</Eyebrow>
              <h3>{KNOWLEDGE.title}</h3>
              {KNOWLEDGE.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </article>
            <article className="mk-panel is-featured">
              <Eyebrow>Participación</Eyebrow>
              <h3>{REQUIREMENTS.title}</h3>
              <ul className="mk-checks">{REQUIREMENTS.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </article>
          </div>
          <div className="mk-callout">
            <div>
              <h3>Consideración sobre la <span className="mk-gold">aplicación institucional.</span></h3>
              <p>{REQUIREMENTS.note}</p>
            </div>
            <LeadButton interest="TRADING_ACADEMY" className="mk-btn mk-ghost">Consultar perfil recomendado →</LeadButton>
          </div>
        </div>
      </section>

      <section className="mk-section" id="metodo">
        <div className="mk-wrap">
          <div className="mk-head">
            <Eyebrow>Dos formas de abordar el mercado</Eyebrow>
            <h2>¿Qué diferencia al enfoque cuantitativo del trading retail?</h2>
            <p>La diferencia no es una etiqueta ni una garantía de resultados. Está en cómo se formula una decisión, cómo se prueba y cómo se administra el riesgo.</p>
          </div>
          <div className="mk-two">
            {APPROACHES.map((a) => (
              <article key={a.title} className={`mk-panel ${a.featured ? 'is-featured' : ''}`}>
                <Eyebrow>{a.eyebrow}</Eyebrow>
                <h3>{a.title}</h3>
                <ul className={a.featured ? 'mk-arrows' : 'mk-dots'}>{a.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="mk-callout">
            <div>
              <h3>Una metodología avanzada exige <span className="mk-gold">capital, infraestructura y disciplina.</span></h3>
              <p>El enfoque institucional se estudia para comprender cómo diseñar y evaluar procesos que puedan aplicarse a una operación con capital significativo. La inversión en el curso debe valorarse junto con la experiencia, el tiempo de estudio y la capacidad financiera del alumno. No se recomienda comprometer dinero necesario para gastos esenciales ni asumir que más capital garantiza mejores resultados.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section" id="copytrading">
        <div className="mk-wrap mk-two is-centered">
          <div>
            <Eyebrow>Alternativa de acceso</Eyebrow>
            <h2>¿No tienes el capital para cursar la academia?</h2>
            <p className="mk-intro">Puedes conocer nuestro <strong>Copytrading Institucional</strong>, el producto principal de QLC. Está pensado para personas que prefieren acceder a una estrategia gestionada mediante una plataforma compatible, en lugar de invertir primero en una formación avanzada y desarrollar su propio proceso operativo.</p>
            <ul className="mk-checks">{COPY_POINTS.map(([b, t]) => <li key={b}><strong>{b}</strong> {t}</li>)}</ul>
          </div>
          <article className="mk-panel is-gold">
            <Eyebrow tone="gold">QLC · Producto principal</Eyebrow>
            <h3>Copytrading <span className="mk-gold">Institucional</span></h3>
            <p>Una alternativa para quienes buscan seguir una operativa mediante las funciones de copytrading disponibles en la plataforma correspondiente, conociendo de antemano las reglas y los riesgos.</p>
            <LeadButton interest="COPYTRADING">Solicitar información →</LeadButton>
            <p className="mk-disclaimer">El copytrading no elimina el riesgo de mercado ni garantiza beneficios. Pueden producirse pérdidas parciales o totales del capital asignado. La disponibilidad, los requisitos y los cargos dependen de la plataforma y de las condiciones vigentes.</p>
          </article>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-head"><Eyebrow>Antes de decidir</Eyebrow><h2>Preguntas frecuentes</h2></div>
          <div className="mk-faq">
            {TRADING_FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="mk-section" id="contacto">
        <div className="mk-wrap">
          <div className="mk-callout">
            <div>
              <Eyebrow>Siguiente paso</Eyebrow>
              <h3>Conoce el programa o solicita información de QLC.</h3>
              <p>Recibe detalles del temario, perfil recomendado, condiciones de acceso y alternativas disponibles. Si apenas comienzas, empieza por <Link to="/educacion-financiera">Educación financiera</Link>.</p>
            </div>
            <LeadButton interest="TRADING_ACADEMY">Solicitar información ↗</LeadButton>
          </div>
          <p className="mk-disclaimer">Aviso: contenido educativo e informativo. No constituye asesoría financiera personalizada, oferta de inversión ni promesa de rendimientos. Toda operativa implica riesgo; verifica las condiciones legales y operativas aplicables en tu jurisdicción antes de participar.</p>
        </div>
      </section>
    </MarketingShell>
  );
}
