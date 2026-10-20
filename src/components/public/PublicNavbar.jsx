import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function PublicNavbar({ sections = [], activeKey, onSelect, onLegal }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const home = user ? (user.role === 'ADMIN' ? '/admin' : '/app') : null;

  useEffect(() => {
    setOpen(false);
  }, [activeKey]);

  const select = (key) => {
    setOpen(false);
    onSelect?.(key);
  };

  return (
    <header className={`pnav ${open ? 'is-open' : ''}`}>
      <div className="pnav-inner">
        <button type="button" className="pnav-brand" onClick={() => select(sections[0]?.key)} aria-label="Ir al inicio">
          <img src="/brand/qlc-logo.png" alt="" width="40" height="34" />
          <span className="pnav-brand-text">
            <b>QLC</b>
            <small>Financial Education</small>
          </span>
        </button>
        <nav className="pnav-links" aria-label="Secciones">
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`${s.key === activeKey ? 'is-active' : ''} ${s.navHighlight ? 'is-highlight' : ''}`}
              aria-current={s.key === activeKey ? 'page' : undefined}
              onClick={() => select(s.key)}
            >
              {s.navLabel}
            </button>
          ))}
          <Link className="pnav-extra" to="/trading-academy">Trading Institucional</Link>
        </nav>
        <div className="pnav-actions">
          {onLegal && <button type="button" className="pnav-ghost pnav-legal" onClick={onLegal}>Aviso</button>}
          {home ? (
            <Link className="pbtn pbtn-primary pbtn-sm" to={home}>Mi plataforma</Link>
          ) : (
            <>
              <Link className="pnav-ghost pnav-login" to="/login">Iniciar sesión</Link>
              <Link className="pbtn pbtn-primary pbtn-sm" to="/registro">Crear cuenta</Link>
            </>
          )}
          {sections.length > 0 && (
            <button type="button" className="pnav-burger" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              <span />
              <span />
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="pnav-sheet">
          {sections.map((s, i) => (
            <button key={s.key} type="button" className={`${s.key === activeKey ? 'is-active' : ''} ${s.navHighlight ? 'is-highlight' : ''}`} style={{ '--i': i }} onClick={() => select(s.key)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s.navLabel}
            </button>
          ))}
          <Link className="pnav-sheet-link" to="/trading-academy" style={{ '--i': sections.length }}>
            <span>★</span>
            Trading Institucional
          </Link>
          <div className="pnav-sheet-actions">
            {!home && <Link className="pbtn pbtn-ghost" to="/login">Iniciar sesión</Link>}
            {onLegal && <button type="button" className="pbtn pbtn-ghost" onClick={onLegal}>Aviso legal</button>}
          </div>
        </div>
      )}
    </header>
  );
}
