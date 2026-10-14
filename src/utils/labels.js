// Etiquetas en español de los catálogos del backend (fuente única en el frontend).
const toOptions = (map) => Object.entries(map).map(([value, label]) => ({ value, label }));

export const INCOME_CATEGORIES = {
  SALARIO: 'Salario', NEGOCIO: 'Negocio', RENTAS: 'Rentas', DIVIDENDOS: 'Dividendos', INTERESES: 'Intereses', OTROS: 'Otros',
};

export const EXPENSE_CATEGORIES = {
  VIVIENDA: 'Vivienda', ALIMENTACION: 'Alimentación', SERVICIOS: 'Servicios', TRANSPORTE: 'Transporte', SEGUROS: 'Seguros',
  EDUCACION: 'Educación', ENTRETENIMIENTO: 'Entretenimiento', VIAJES: 'Viajes', DEUDAS: 'Deudas', OTROS: 'Otros',
};

export const PROTECTION_TYPES = {
  LIQUIDEZ: 'Liquidez', FONDO_EMERGENCIA: 'Fondo de emergencia', RESERVA: 'Reserva',
  SEGURO_GASTOS_MEDICOS: 'Seguro de gastos médicos mayores', SEGURO_VIDA: 'Seguro de vida', OTRO_SEGURO: 'Otro seguro',
};
export const INSURANCE_TYPES = ['SEGURO_GASTOS_MEDICOS', 'SEGURO_VIDA', 'OTRO_SEGURO'];

export const MOVEMENT_TYPES = { APORTACION: 'Aportación', DEDUCCION: 'Deducción' };

export const APPOINTMENT_STATUS = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', COMPLETED: 'Completada', CANCELLED: 'Cancelada' };
export const APPOINTMENT_CHANNELS = { VIDEOLLAMADA: 'Videollamada', LLAMADA: 'Llamada', WHATSAPP: 'WhatsApp', PRESENCIAL: 'Presencial' };
export const APPOINTMENT_REASONS = [
  'Organización financiera', 'Planificación de metas', 'Presupuesto', 'Deudas',
  'Construcción patrimonial', 'Diversificación', 'Educación sobre inversiones',
];

export const SUBSCRIPTION_STATUS = {
  NONE: 'Sin suscripción', PENDING: 'Pendiente de pago', ACTIVE: 'Activa', PAST_DUE: 'Pago vencido', CANCELLED: 'Cancelada', EXPIRED: 'Expirada',
};

export const ADMIN_LEVELS = { VIEW: 'Visualización', EDIT: 'Edición', FULL: 'Administración completa' };

export const options = {
  income: toOptions(INCOME_CATEGORIES),
  expense: toOptions(EXPENSE_CATEGORIES),
  protection: toOptions(PROTECTION_TYPES),
  movement: toOptions(MOVEMENT_TYPES),
  channel: toOptions(APPOINTMENT_CHANNELS),
};
