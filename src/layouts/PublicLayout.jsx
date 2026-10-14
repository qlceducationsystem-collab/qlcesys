import { Outlet, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/public/PublicNavbar.jsx';
import { TradingBackdrop } from '../components/public/TradingBackdrop.jsx';

export function AuthLayout() {
  const navigate = useNavigate();
  return (
    <div className="auth-shell">
      <TradingBackdrop />
      <PublicNavbar onSelect={() => navigate('/')} />
      <main className="auth-main"><Outlet /></main>
      <p className="auth-legal">Herramienta educativa y de organización financiera. No constituye asesoría financiera personalizada ni garantiza rendimientos.</p>
    </div>
  );
}
