import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LEGAL_DOCS, LEGAL_UPDATED } from './legalContent.js';

export function LegalLinks({ className = '' }) {
  return (
    <span className={`legal-links ${className}`}>
      <NavLink to={LEGAL_DOCS.terminos.path}>Términos y condiciones</NavLink>
      <span aria-hidden="true">·</span>
      <NavLink to={LEGAL_DOCS.privacidad.path}>Aviso de privacidad</NavLink>
    </span>
  );
}

export default function LegalPage({ doc }) {
  const content = LEGAL_DOCS[doc];
  useEffect(() => {
    document.title = `${content.title} · QLC Financial Education`;
    window.scrollTo(0, 0);
  }, [content.title]);

  return (
    <article className="auth-card legal-card">
      <nav className="auth-methods" aria-label="Documentos legales">
        {Object.entries(LEGAL_DOCS).map(([key, d]) => (
          <NavLink key={key} to={d.path} className={({ isActive }) => (isActive ? 'is-active' : '')}>{d.label}</NavLink>
        ))}
      </nav>
      <div className="section-kicker">QLC Financial Education</div>
      <h1>{content.title}</h1>
      <p className="small muted">Última actualización: {LEGAL_UPDATED}</p>
      <p className="subtitle">{content.intro}</p>
      {content.sections.map(([title, paragraphs]) => (
        <section key={title} className="legal-section">
          <h2>{title}</h2>
          {paragraphs.map((p) => <p key={p}>{p}</p>)}
        </section>
      ))}
    </article>
  );
}
