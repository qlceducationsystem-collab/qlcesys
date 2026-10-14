import { Link } from 'react-router-dom';

export function Brand({ to = '/', sub = 'FINANCIAL EDUCATION' }) {
  return (
    <Link to={to} className="brand">
      <img className="brand-mark" src="/brand/qlc-logo.png" alt="QLC" width="43" height="43" />
      <div>
        <div className="brand-name">QLC</div>
        <span>{sub}</span>
      </div>
    </Link>
  );
}

export const Disclaimer = () => (
  <div className="footer-note">
    QLC Financial Education · Herramienta educativa y de organización financiera. No constituye asesoría financiera
    personalizada ni garantiza rendimientos.
  </div>
);
