import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function PublicNav({ links = [] }) {
  const { user } = useAuth();
  const home = user ? (user.role === 'ADMIN' ? '/admin' : '/app') : null;
  return (
    <nav className="pnav">
      <div className="container pnav-inner">
        <Link className="plogo" to="/"><img alt="Quantum Liquidity Capital" src="/brand/qlc-logo.png" /></Link>
        <div className="navlinks">
          {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </div>
        <div className="pnav-actions">
          {home ? <Link className="btn" to={home}>Ir a mi plataforma</Link> : (
            <>
              <Link className="pnav-login" to="/login">Iniciar sesión</Link>
              <Link className="btn" to="/registro">QLC Financial Education</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="pfooter">
      <div className="container disclaimer">
        <strong>AVISO IMPORTANTE</strong>
        <p>Este sitio tiene fines exclusivamente informativos y educativos. No constituye asesoría financiera personalizada, recomendación de inversión, oferta pública ni garantía de resultados. Los activos digitales y el trading apalancado pueden implicar pérdidas significativas. Los resultados históricos o métricas públicas no garantizan resultados futuros.</p>
        <p>Las referencias a QLC describen el concepto educativo y operativo presentado en su documentación. La estructura contractual, regulatoria y operativa de QLC deberá validarse antes de cualquier lanzamiento comercial. Cada persona debe evaluar de manera independiente su situación financiera, tolerancia al riesgo, objetivos, obligaciones y marco legal aplicable, y consultar profesionales independientes cuando corresponda.</p>
        <p>© Quantum Liquidity Capital · Educación Financiera</p>
      </div>
    </footer>
  );
}

// Layout de autenticación y suscripción.
export function AuthLayout() {
  return (
    <div className="public">
      <PublicNav />
      <main className="auth-main"><Outlet /></main>
      <PublicFooter />
    </div>
  );
}
