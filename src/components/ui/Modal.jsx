import { useEffect } from 'react';
import { Button } from './Button.jsx';

export function Modal({ open, title, onClose, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">×</button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

// Confirmación visual para cambios importantes (requisito de trazabilidad).
export function ConfirmDialog({ open, title = "Confirmar cambio", message, details, confirmLabel = "Confirmar", danger, loading, onConfirm, onClose, children }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="muted">{message}</p>
      {details?.length > 0 && (
        <table className="diff-table">
          <thead><tr><th>Campo</th><th>Anterior</th><th>Nuevo</th></tr></thead>
          <tbody>
            {details.map((d) => (
              <tr key={d.field}><td>{d.field}</td><td>{d.from}</td><td><b>{d.to}</b></td></tr>
            ))}
          </tbody>
        </table>
      )}
      {children}
    </Modal>
  );
}
