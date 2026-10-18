import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal.jsx';

const QLC_URL = import.meta.env.VITE_QLC_URL || '';

export function CopytradingFilter({ open, onClose }) {
  const [answer, setAnswer] = useState(null);
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
            <Link className="btn-secondary" to="/?s=plataforma" onClick={close}>Conocer la plataforma</Link>
            {QLC_URL && <a className="btn-primary" href={QLC_URL} target="_blank" rel="noopener noreferrer">Continuar a QLC</a>}
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
