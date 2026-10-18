export const LEGAL_VERSION = '2026-10-18';
export const LEGAL_UPDATED = '18 de octubre de 2026';
const CONTACT = import.meta.env.VITE_LEGAL_CONTACT_EMAIL || '';
const contactText = CONTACT ? `al correo ${CONTACT}` : 'a través de los canales oficiales de contacto de QLC Financial Education';

export const LEGAL_DOCS = {
  privacidad: {
    path: '/privacidad',
    label: 'Aviso de privacidad',
    title: 'Aviso de privacidad',
    intro: 'Este aviso explica qué datos personales trata QLC Financial Education, para qué los usa, con quién los comparte y cómo puedes ejercer tus derechos, conforme a la legislación mexicana aplicable en materia de protección de datos personales en posesión de particulares.',
    sections: [
      ['Responsable', [
        'QLC Financial Education es responsable del tratamiento de los datos personales que proporcionas al utilizar la plataforma.',
        `Para cualquier asunto relacionado con tus datos personales puedes escribirnos ${contactText}.`,
      ]],
      ['Datos que tratamos', [
        'Identificación y contacto: nombre, correo electrónico y, de forma opcional, teléfono.',
        'Datos de cuenta y seguridad: contraseña (almacenada solo como hash irreversible) y la clave de verificación en dos pasos (almacenada cifrada).',
        'Información financiera que tú mismo registras: ingresos, gastos, activos, deudas, presupuestos, metas, cortes mensuales y resultados de las herramientas educativas.',
        'Datos de compra: producto adquirido, monto, estado del pago y vigencia del acceso. QLC no almacena números completos de tarjetas; el cobro lo procesa el proveedor de pagos.',
        'Datos de uso: páginas visitadas, inicios de sesión y avance en los módulos, sin incluir cifras financieras en las métricas.',
      ]],
      ['Finalidades', [
        'Necesarias: crear y proteger tu cuenta, prestar el servicio educativo y de organización financiera, calcular indicadores y reportes, gestionar accesos y pagos, brindar soporte y cumplir obligaciones legales.',
        'Secundarias: mejorar la plataforma mediante métricas agregadas y enviarte comunicaciones informativas sobre el servicio. Puedes oponerte a las finalidades secundarias sin que esto afecte el servicio principal.',
      ]],
      ['Transferencias y encargados', [
        'Compartimos datos solo con proveedores que nos ayudan a operar la plataforma (alojamiento, base de datos, almacenamiento de imágenes y documentos, envío de correos y procesamiento de pagos), quienes actúan por nuestra cuenta y bajo obligaciones de confidencialidad.',
        'No vendemos tus datos personales. Solo los comunicaremos a autoridades cuando una ley o un mandato de autoridad competente lo exija.',
      ]],
      ['Derechos ARCO y revocación del consentimiento', [
        `Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos, así como revocar tu consentimiento, enviando tu solicitud ${contactText}. Indica tu nombre, el correo de tu cuenta, el derecho que deseas ejercer y una descripción clara de lo solicitado.`,
        'Responderemos en los plazos que establezca la legislación aplicable.',
      ]],
      ['Seguridad', [
        'Aplicamos medidas administrativas, técnicas y físicas razonables: cifrado de secretos, contraseñas con hash, verificación en dos pasos obligatoria, control de accesos por rol y registro de auditoría de cambios administrativos.',
      ]],
      ['Cookies y almacenamiento local', [
        'Usamos almacenamiento del navegador únicamente para mantener tu sesión, recordar preferencias de navegación y medir visitas de forma anónima. No usamos cookies publicitarias de terceros.',
      ]],
      ['Cambios a este aviso', [
        'Cualquier cambio se publicará en esta misma página con su fecha de actualización. Si el cambio es relevante, te lo informaremos dentro de la plataforma.',
      ]],
    ],
  },
  terminos: {
    path: '/terminos',
    label: 'Términos y condiciones',
    title: 'Términos y condiciones',
    intro: 'Estos términos regulan el uso de QLC Financial Education. Al crear una cuenta aceptas cumplirlos. Si no estás de acuerdo, no utilices la plataforma.',
    sections: [
      ['Naturaleza del servicio', [
        'QLC Financial Education es una plataforma educativa y de organización financiera. Sus contenidos, herramientas, simulaciones, estimaciones y reportes tienen fines exclusivamente informativos.',
        'Nada en la plataforma constituye asesoría financiera, fiscal o legal personalizada, recomendación de inversión, oferta de valores ni garantía de resultados.',
      ]],
      ['Riesgos', [
        'Toda inversión implica riesgos, incluida la posible pérdida del capital. Los activos digitales, el trading y el apalancamiento pueden generar pérdidas significativas. Los resultados pasados no garantizan resultados futuros.',
        'Las simulaciones, estimaciones de impuestos, intereses o inflación son aproximaciones basadas en los supuestos que tú introduces.',
      ]],
      ['Cuenta y seguridad', [
        'Debes proporcionar información veraz y mantener la confidencialidad de tu contraseña y de tu dispositivo de verificación en dos pasos.',
        'La verificación en dos pasos es obligatoria y es el medio para restablecer tu contraseña. Si pierdes acceso a ella, un administrador podrá restablecerla después de validar tu identidad.',
        'Eres responsable de la información financiera que registras y de las decisiones que tomes con base en ella.',
      ]],
      ['Accesos, precios y pagos', [
        'El acceso completo anual incluye la academia y las herramientas durante 365 días desde su activación. La modalidad Solo herramientas otorga acceso permanente a la herramienta del módulo adquirido, sin la academia.',
        'Los precios se muestran en pesos mexicanos dentro de la plataforma y pueden cambiar; el cambio no afecta accesos ya pagados.',
        'Las solicitudes de aclaración o reembolso se atienden conforme a la legislación de protección al consumidor aplicable.',
      ]],
      ['Uso permitido', [
        'No está permitido acceder a cuentas ajenas, intentar vulnerar la seguridad, automatizar solicitudes abusivas, copiar o redistribuir los contenidos ni usar la plataforma con fines ilícitos.',
      ]],
      ['Propiedad intelectual', [
        'Los contenidos educativos, textos, diseños, herramientas y marcas de la plataforma son propiedad de QLC Financial Education o de sus licenciantes. Se otorga una licencia personal, limitada y no transferible para su uso dentro de la plataforma.',
      ]],
      ['Suspensión y terminación', [
        'Podemos suspender o cancelar cuentas que incumplan estos términos. Puedes dejar de usar el servicio en cualquier momento y solicitar la cancelación de tu cuenta.',
      ]],
      ['Responsabilidad', [
        'En la medida permitida por la ley, QLC Financial Education no será responsable por pérdidas derivadas de decisiones de inversión o financieras tomadas con base en la información de la plataforma.',
      ]],
      ['Cambios y legislación aplicable', [
        'Podemos actualizar estos términos; la versión vigente estará siempre publicada en esta página. Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.',
      ]],
    ],
  },
};
