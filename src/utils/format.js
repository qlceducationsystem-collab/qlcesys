// Formato de cifras. Los cálculos viven en el backend; aquí solo se presentan.
const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const money = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '—' : mxn.format(Number(n)));

export const signedMoney = (n) => {
  if (n === null || n === undefined) return '—';
  const v = Number(n);
  return `${v > 0 ? '+' : v < 0 ? '−' : ''}${mxn.format(Math.abs(v))}`;
};

// ROI nulo (capital inicial 0) → N/D
export const pct = (n, { signed = false } = {}) => {
  if (n === null || n === undefined) return 'N/D';
  const v = Number(n);
  return `${signed && v > 0 ? '+' : ''}${v.toFixed(2)}%`;
};

export const tone = (n) => (n === null || n === undefined || Number(n) === 0 ? '' : Number(n) > 0 ? 'up' : 'down');

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const monthName = (m) => MONTHS[m - 1] || '';
export const periodLabel = (p) => (p ? `${MONTHS[p.month - 1]} ${p.year}` : '');
export const shortMonth = (m) => MONTHS[m - 1]?.slice(0, 3) || '';

export const date = (d) => (d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// Valor para <input type="date"> en zona local.
export const toDateInput = (d) => {
  const x = d ? new Date(d) : new Date();
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
