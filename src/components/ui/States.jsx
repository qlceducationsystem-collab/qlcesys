import { Link } from 'react-router-dom';

export const Loading = ({ text = 'Cargando información…' }) => (
  <div className="state state-loading" role="status">
    <span className="spinner" aria-hidden="true" />
    <span>{text}</span>
  </div>
);

export function Empty({ title = 'Aún no hay información', text, action }) {
  return (
    <div className="state state-empty">
      <div className="state-icon" aria-hidden="true">◇</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

// Estados de error, incluidos 401 (sin sesión) y 403 (sin permiso / membresía).
export function ErrorState({ error, onRetry }) {
  const status = error?.status;
  if (status === 401) {
    return (
      <div className="state state-error">
        <h3>Tu sesión expiró</h3>
        <p>Inicia sesión nuevamente para continuar.</p>
        <Link className="btn-primary" to="/login">Iniciar sesión</Link>
      </div>
    );
  }
  if (status === 403) {
    return (
      <div className="state state-forbidden">
        <div className="state-icon" aria-hidden="true">🔒</div>
        <h3>Acceso restringido</h3>
        <p>{error.message}</p>
      </div>
    );
  }
  return (
    <div className="state state-error" role="alert">
      <h3>No se pudo cargar la información</h3>
      <p>{error?.message || 'Error inesperado'}</p>
      {onRetry && <button className="btn-secondary" onClick={onRetry}>Reintentar</button>}
    </div>
  );
}

// Envuelve el ciclo loading / error / empty / success.
export function AsyncView({ loading, error, data, onRetry, isEmpty, empty, children }) {
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (data === null || data === undefined) return null;
  if (isEmpty?.(data)) return empty || <Empty />;
  return children(data);
}
