import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo.jsx';

export const BRAND_NAME = 'QLC';
export const BRAND_TAGLINE = 'Institutional Investment Academy';
export const BRAND_FULL = `${BRAND_NAME} · ${BRAND_TAGLINE}`;

export function Brand({ to = '/' }) {
  return (
    <Link to={to} className="brand">
      <BrandLogo className="brand-mark" alt={BRAND_NAME} width="43" height="43" />
      <div>
        <div className="brand-name">{BRAND_NAME}</div>
        <span>{BRAND_TAGLINE}</span>
      </div>
    </Link>
  );
}

export const Disclaimer = () => (
  <div className="footer-note">
    {BRAND_FULL} · Herramienta educativa y de organización financiera. No constituye asesoría financiera
    personalizada ni garantiza rendimientos.
  </div>
);
