export const LEGAL_VERSION = '2026-10-18';
const CONTACT = import.meta.env.VITE_LEGAL_CONTACT_EMAIL || '';
const contactText = CONTACT ? `al correo ${CONTACT}` : 'a través de los canales oficiales de contacto de QLC Financial Education';
const contactTextEn = CONTACT ? `to ${CONTACT}` : 'through the official QLC Financial Education contact channels';

export const LEGAL_PATHS = { privacidad: '/privacidad', terminos: '/terminos' };

const ES = {
  privacidad: {
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
        'Datos de uso: inicios de sesión y avance en los módulos, sin incluir cifras financieras en las métricas.',
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
        'Aplicamos medidas administrativas, técnicas y físicas razonables: cifrado de secretos, contraseñas con hash, verificación en dos pasos obligatoria y control de accesos por rol.',
      ]],
      ['Cookies y almacenamiento local', [
        'Usamos almacenamiento del navegador únicamente para mantener tu sesión y recordar preferencias de navegación, como el idioma. No usamos cookies publicitarias de terceros.',
      ]],
      ['Cambios a este aviso', [
        'Cualquier cambio se publicará en esta misma página con su fecha de actualización. Si el cambio es relevante, te lo informaremos dentro de la plataforma.',
      ]],
    ],
  },
  terminos: {
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
        'El acceso completo anual incluye la academia y las herramientas durante 365 días desde su activación. La modalidad Solo herramientas es una suscripción mensual: cada pago otorga 30 días de acceso a la herramienta del módulo elegido, sin la academia, y puede renovarse.',
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

const EN = {
  privacidad: {
    label: 'Privacy notice',
    title: 'Privacy notice',
    intro: 'This notice explains what personal data QLC Financial Education processes, what it is used for, who it is shared with and how you can exercise your rights, in accordance with applicable Mexican legislation on the protection of personal data held by private parties.',
    sections: [
      ['Data controller', [
        'QLC Financial Education is responsible for processing the personal data you provide when using the platform.',
        `For any matter related to your personal data you can write to us ${contactTextEn}.`,
      ]],
      ['Data we process', [
        'Identification and contact: name, email and, optionally, phone number.',
        'Account and security data: password (stored only as an irreversible hash) and the two-step verification key (stored encrypted).',
        'Financial information you record yourself: income, expenses, assets, debts, budgets, goals, monthly closings and results of the educational tools.',
        'Purchase data: product purchased, amount, payment status and access validity. QLC does not store full card numbers; payments are processed by the payment provider.',
        'Usage data: sign-ins and progress in the modules, without including financial figures in the metrics.',
      ]],
      ['Purposes', [
        'Necessary: create and protect your account, provide the educational and financial organization service, calculate indicators and reports, manage access and payments, provide support and comply with legal obligations.',
        'Secondary: improve the platform through aggregated metrics and send you informational communications about the service. You can object to secondary purposes without affecting the main service.',
      ]],
      ['Transfers and processors', [
        'We share data only with providers that help us operate the platform (hosting, database, image and document storage, email delivery and payment processing), who act on our behalf and under confidentiality obligations.',
        'We do not sell your personal data. We will only disclose it to authorities when required by law or by an order from a competent authority.',
      ]],
      ['ARCO rights and withdrawal of consent', [
        `You can access, rectify, cancel or object to the processing of your data, as well as withdraw your consent, by sending your request ${contactTextEn}. Include your name, your account email, the right you wish to exercise and a clear description of your request.`,
        'We will respond within the time limits set by applicable law.',
      ]],
      ['Security', [
        'We apply reasonable administrative, technical and physical measures: encryption of secrets, hashed passwords, mandatory two-step verification and role-based access control.',
      ]],
      ['Cookies and local storage', [
        'We use browser storage only to keep your session and remember your browsing preferences, such as language. We do not use third-party advertising cookies.',
      ]],
      ['Changes to this notice', [
        'Any change will be published on this page with its update date. If the change is relevant, we will inform you within the platform.',
      ]],
    ],
  },
  terminos: {
    label: 'Terms and conditions',
    title: 'Terms and conditions',
    intro: 'These terms govern the use of QLC Financial Education. By creating an account you agree to comply with them. If you do not agree, do not use the platform.',
    sections: [
      ['Nature of the service', [
        'QLC Financial Education is an educational and financial organization platform. Its content, tools, simulations, estimates and reports are for informational purposes only.',
        'Nothing on the platform constitutes personalized financial, tax or legal advice, an investment recommendation, an offer of securities or a guarantee of results.',
      ]],
      ['Risks', [
        'Every investment involves risk, including the possible loss of capital. Digital assets, trading and leverage can cause significant losses. Past results do not guarantee future results.',
        'Simulations and estimates of taxes, interest or inflation are approximations based on the assumptions you enter.',
      ]],
      ['Account and security', [
        'You must provide truthful information and keep your password and your two-step verification device confidential.',
        'Two-step verification is mandatory and is the means to reset your password. If you lose access to it, an administrator can reset it after verifying your identity.',
        'You are responsible for the financial information you record and the decisions you make based on it.',
      ]],
      ['Access, prices and payments', [
        'Full annual access includes the academy and tools for 365 days from activation. The Tools only option is a monthly subscription: each payment grants 30 days of access to the chosen module’s tool, without the academy, and can be renewed.',
        'Prices are shown in Mexican pesos within the platform and may change; changes do not affect access already paid for.',
        'Requests for clarification or refunds are handled in accordance with applicable consumer protection law.',
      ]],
      ['Permitted use', [
        'It is not permitted to access other people’s accounts, attempt to breach security, automate abusive requests, copy or redistribute content or use the platform for unlawful purposes.',
      ]],
      ['Intellectual property', [
        'The educational content, texts, designs, tools and trademarks of the platform belong to QLC Financial Education or its licensors. A personal, limited and non-transferable license is granted for use within the platform.',
      ]],
      ['Suspension and termination', [
        'We may suspend or cancel accounts that breach these terms. You can stop using the service at any time and request the cancellation of your account.',
      ]],
      ['Liability', [
        'To the extent permitted by law, QLC Financial Education will not be liable for losses arising from investment or financial decisions made based on the platform’s information.',
      ]],
      ['Changes and governing law', [
        'We may update these terms; the current version will always be published on this page. These terms are governed by the laws of the United Mexican States.',
      ]],
    ],
  },
};

export const LEGAL_CONTENT = {
  es: { updatedLabel: 'Última actualización', updated: '18 de octubre de 2026', navLabel: 'Documentos legales', docs: ES },
  en: { updatedLabel: 'Last updated', updated: 'October 18, 2026', navLabel: 'Legal documents', docs: EN },
};
