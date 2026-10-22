import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal.jsx';

export const QLC_COPYTRADING_URL = import.meta.env.VITE_QLC_URL || 'https://www.qlctrade.net/';

export function CopytradingFilter({ open, onClose }) {
  const [answer, setAnswer] = useState(null);
  const { pathname } = useLocation();
  const close = () => {
    setAnswer(null);
    onClose();
  };
  return (
    <Modal open={open} title="Copytrading institucional QLC" onClose={close}>
      {answer === null && (
        <div className="stack">
          <p>¿Usted tiene conocimiento de qué es el copytrading?</p>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setAnswer('no')}>No</button>
            <button type="button" className="btn-primary" onClick={() => setAnswer('yes')}>Sí</button>
          </div>
        </div>
      )}
      {answer === 'yes' && (
        <div className="stack">
          <p>El contenido de QLC está dirigido a personas con conocimientos previos de copytrading y trading. Es una estrategia de alto riesgo y ningún resultado está garantizado.</p>
          <p>Una vez que sabes que es una estrategia de alto riesgo, conoce la plataforma y podrás adquirir conocimientos.</p>
          <div className="form-actions">
            {pathname !== '/trading-academy' && <Link className="btn-secondary" to="/trading-academy" onClick={close}>Conocer Trading Institucional</Link>}
            <a className="btn-primary" href={QLC_COPYTRADING_URL} target="_blank" rel="noopener noreferrer" onClick={close}>Continuar a QLC Copytrading ↗</a>
          </div>
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

export function CopytradingButton({ className = 'mk-btn mk-primary', children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>{children}</button>
      <CopytradingFilter open={open} onClose={() => setOpen(false)} />
    </>
  );
}
