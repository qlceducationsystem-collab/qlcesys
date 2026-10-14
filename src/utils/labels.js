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

export const ACCESS_MODES = { FULL: 'Acceso completo anual', TOOLS: 'Solo herramientas', NONE: 'Sin acceso' };
export const PAYMENT_STATUS = { PENDING: 'Pendiente', APPROVED: 'Aprobado', REJECTED: 'Rechazado' };

export const ADMIN_LEVELS = { VIEW: 'Visualización', EDIT: 'Edición', FULL: 'Administración completa' };

export const PRODUCT_TYPES = {
  RENTA_FIJA: 'Renta fija', RENTA_VARIABLE: 'Renta variable', FONDOS: 'Fondos', ACCIONES: 'Acciones',
  BIENES_RAICES: 'Bienes raíces', NEGOCIO: 'Negocio', ACTIVO_DIGITAL: 'Activo digital', LIQUIDEZ: 'Liquidez',
};
export const HORIZONS = { CORTO: 'Corto plazo', MEDIANO: 'Mediano plazo', LARGO: 'Largo plazo' };
export const LIQUIDITY_LEVELS = { ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' };
export const PERCEIVED_RISK = { BAJO: 'Bajo', MEDIO: 'Medio', ALTO: 'Alto', MUY_ALTO: 'Muy alto' };
export const RISK_TOLERANCE = { CONSERVADOR: 'Conservador', MODERADO: 'Moderado', ALTO: 'Alto' };
export const FINANCIAL_GOALS = {
  CONSTRUIR_PATRIMONIO: 'Construir patrimonio', FONDO_EMERGENCIA: 'Crear fondo de emergencia',
  INVERTIR_MEJOR: 'Invertir mejor', REDUCIR_DEUDAS: 'Reducir deudas',
};
export const AUTOMATION_LEVELS = { MANUAL: 'Manual', SEMI: 'Semiautomatizado', AUTO: 'Automatizado' };
export const MONITORING_LEVELS = { BASIC: 'Básico', CONTINUOUS: 'Continuo', ALERTS: 'Continuo + alertas' };
export const LEVERAGE_OPTIONS = [1, 2, 5, 10, 25, 50, 100, 150];

export const MODULE_STATE = {
  COMPLETED: { label: 'Completado', tone: 'good' },
  AVAILABLE: { label: 'Disponible', tone: 'info' },
  LOCKED_ORDER: { label: 'Completa el módulo anterior', tone: 'muted' },
  LOCKED_ACCESS: { label: 'Requiere acceso', tone: 'warn' },
  LOCKED_FILTER: { label: 'Requiere filtro de mercados', tone: 'warn' },
  LOCKED_ROUTE: { label: 'Elige la Ruta de Mercados', tone: 'warn' },
  COMING_SOON: { label: 'Siguiente etapa', tone: 'muted' },
};

export const options = {
  income: toOptions(INCOME_CATEGORIES),
  expense: toOptions(EXPENSE_CATEGORIES),
  protection: toOptions(PROTECTION_TYPES),
  movement: toOptions(MOVEMENT_TYPES),
  channel: toOptions(APPOINTMENT_CHANNELS),
  productTypes: toOptions(PRODUCT_TYPES),
  horizons: toOptions(HORIZONS),
  liquidity: toOptions(LIQUIDITY_LEVELS),
  risk: toOptions(PERCEIVED_RISK),
  tolerance: toOptions(RISK_TOLERANCE),
  goals: toOptions(FINANCIAL_GOALS),
  automation: toOptions(AUTOMATION_LEVELS),
  monitoring: toOptions(MONITORING_LEVELS),
  leverage: LEVERAGE_OPTIONS.map((l) => ({ value: l, label: `${l}x` })),
};
