import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loading } from '../components/ui/States.jsx';

// Requiere sesión (y opcionalmente un rol). El backend valida siempre los permisos.
export function RequireAuth({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Loading text="Verificando sesión…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/app'} replace />;
  return children || <Outlet />;
}

// Cliente con membresía activa; si no, va a la página de suscripción (sus datos se conservan).
export function RequireMembership({ children }) {
  const { membership, hasAccess } = useAuth();
  if (!membership) return <Loading />;
  if (!hasAccess) return <Navigate to="/suscripcion" replace />;
  return children;
}
