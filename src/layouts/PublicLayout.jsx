import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/public/PublicNavbar.jsx';
import { TradingBackdrop } from '../components/public/TradingBackdrop.jsx';
import { LegalLinks } from '../pages/public/legal/LegalPage.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));
  return (
    <div className="auth-shell">
      <TradingBackdrop />
      <PublicNavbar onSelect={() => navigate('/')} extraLink={false} />
      <main className="auth-main">
        <button type="button" className="auth-back" onClick={goBack}><span aria-hidden="true">←</span> {t('common.back')}</button>
        <Outlet />
      </main>
      <p className="auth-legal">{t('common.disclaimer')}<br /><LegalLinks /></p>
    </div>
  );
}
