import { Link } from 'react-router-dom';

export function Button({ variant = 'primary', loading, children, className = '', ...rest }) {
  return (
    <button className={`btn-${variant} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? 'Procesando…' : children}
    </button>
  );
}

export function LinkButton({ to, variant = 'primary', children, className = '' }) {
  return (
    <Link to={to} className={`btn-${variant} ${className}`}>
      {children}
    </Link>
  );
}
