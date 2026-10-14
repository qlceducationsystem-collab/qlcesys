// Contenido del curso gratuito (fuente: QLC_Educacion_Financiera_GRATUITA.html).
// Los bloques se renderizan con componentes reutilizables en CourseBlocks.jsx.
// Tipos de bloque: cards, lesson, risk, quote, table, timeline, bars.

export const HERO = {
  eyebrow: 'Educación financiera · Curso gratuito',
  title: ['Aprende a invertir antes de aprender a ', 'arriesgar.'],
  lead: 'Una guía paso a paso para entender cómo funciona una inversión, cómo se relacionan riesgo y rendimiento, cómo construir una cartera diversificada y por qué una estrategia de trading de alto riesgo debe ocupar solamente una parte controlada del patrimonio.',
  note: ['La idea que debes conservar durante todo el curso:', ' no existe una inversión perfecta. Existe una estructura de patrimonio donde cada activo cumple una función diferente.'],
};

export const SECTIONS = [
  {
    id: '01',
    title: '¿Qué significa realmente invertir?',
    intro: 'Invertir significa colocar capital en un activo, instrumento, proyecto o estrategia esperando obtener un beneficio futuro. Ese beneficio puede venir de intereses, dividendos, crecimiento del precio, renta, flujo de efectivo o resultado de una actividad empresarial.',
    blocks: [
      {
        type: 'cards', cols: 3, numbered: true,
        items: [
          ['Rendimiento', 'Es el resultado obtenido por el capital durante un periodo. Puede expresarse en dinero o en porcentaje. Un rendimiento positivo no significa necesariamente que la inversión haya sido adecuada: siempre debe compararse con el riesgo asumido.'],
          ['Riesgo', 'Es la posibilidad de que el resultado sea diferente al esperado, incluida la pérdida parcial o total del capital. Cuanto más incierto es el resultado, mayor atención requiere la gestión de la exposición.'],
          ['Horizonte', 'Es el tiempo durante el cual planeas mantener la inversión. Un objetivo de largo plazo puede tolerar fluctuaciones diferentes a una necesidad de liquidez inmediata.'],
        ],
      },
      {
        type: 'lesson',
        title: 'La primera regla: invertir no debe reemplazar inmediatamente tu fuente de ingresos',
        paragraphs: [
          'Para la mayoría de las personas, las inversiones deberían comenzar como una **segunda fuente de ingresos y de crecimiento patrimonial**, no como el dinero del que dependen para pagar sus gastos diarios.',
          'Existe una diferencia enorme entre **construir patrimonio** y buscar “hacerte millonario de la noche a la mañana”. La segunda idea suele empujar a las personas hacia concentraciones excesivas, apalancamiento y decisiones impulsivas. La primera se construye con tiempo, aportaciones, disciplina, reinversión y una adecuada administración del riesgo.',
          '¿Se puede llegar a vivir de las inversiones? Sí. Pero normalmente el objetivo se construye cuando el patrimonio invertido alcanza un tamaño suficiente para generar ingresos que cubran de manera sostenible los gastos de la persona. **No se empieza dejando de trabajar; se empieza construyendo un patrimonio que algún día pueda permitirlo.**',
        ],
        example: ['Ejemplo educativo:', 'imagina que tus gastos mensuales son 2,000 unidades monetarias. Si tus inversiones todavía generan resultados pequeños o variables, abandonar tu fuente principal de ingresos para depender de ellas aumenta innecesariamente la presión sobre tu capital. Una estructura más prudente es mantener tu actividad productiva mientras construyes progresivamente el patrimonio invertido.'],
      },
      {
        type: 'lesson',
        title: 'Antes de invertir: protege primero lo que puede destruir tu patrimonio',
        paragraphs: [
          'Una educación financiera completa no empieza hablando de rentabilidad. Empieza hablando de **protección**. Antes de destinar una parte importante del patrimonio a inversiones, conviene considerar cómo enfrentarías acontecimientos que pueden generar gastos extraordinarios.',
          'Entre esas protecciones están los **seguros de gastos médicos mayores** y los **seguros de vida**, especialmente cuando existen dependientes económicos. En países donde la atención pública puede ser insuficiente, limitada o generar largos tiempos de espera, una cobertura médica adecuada puede tener una función patrimonial fundamental.',
          'La lógica es sencilla: no tendría mucho sentido perseguir un rendimiento adicional mientras una emergencia médica, un accidente o el fallecimiento de la persona que genera los ingresos pudiera obligar a liquidar inversiones o endeudarse.',
        ],
        example: ['Orden conceptual:', 'primero proteger la capacidad de generar ingresos y enfrentar contingencias; después construir liquidez; posteriormente desarrollar inversiones de acuerdo con los objetivos y el riesgo que puedas asumir.'],
      },
      {
        type: 'lesson',
        title: 'Patrimonio por capas',
        paragraphs: ['Una forma sencilla de entenderlo es pensar en tu patrimonio como una estructura de varias capas:'],
        list: [
          '**Protección:** seguros y mecanismos para enfrentar eventos que podrían afectar gravemente a la familia o al patrimonio.',
          '**Liquidez:** dinero disponible para emergencias, necesidades y oportunidades.',
          '**Actividad productiva:** empleo, profesión o negocio que genera el ingreso principal.',
          '**Inversiones:** capital destinado al crecimiento y generación de ingresos complementarios.',
          '**Alto riesgo:** una porción limitada destinada a oportunidades con mayor volatilidad y posibilidad de pérdidas.',
        ],
        after: ['El objetivo no es que todas las capas tengan el mismo tamaño. El objetivo es que una sola inversión de alto riesgo no pueda poner en peligro toda la estructura.'],
      },
      {
        type: 'lesson',
        title: 'Cómo analizar cualquier inversión',
        list: [
          '**¿Qué estoy comprando?** Entiende el activo o estrategia.',
          '**¿De dónde proviene el posible rendimiento?** Intereses, dividendos, apreciación, renta, operación empresarial, etc.',
          '**¿Qué puede hacerme perder dinero?** Identifica los riesgos específicos.',
          '**¿Cuándo puedo necesitar el dinero?** Relaciona la inversión con tu horizonte.',
          '**¿Qué porcentaje de mi patrimonio representa?** Esta pregunta introduce la diversificación.',
        ],
      },
    ],
  },
  {
    id: '02',
    title: 'Riesgo y rendimiento: por qué nadie puede eliminar el riesgo',
    intro: 'Una de las ideas más importantes de las finanzas es que el rendimiento potencial y el riesgo deben analizarse juntos. Buscar un rendimiento mayor normalmente implica aceptar alguna combinación de mayor incertidumbre, volatilidad, plazo o complejidad.',
    blocks: [
      {
        type: 'cards', cols: 2,
        items: [
          ['Riesgo de mercado', 'El precio de un activo puede subir o bajar por cambios en oferta y demanda, tasas, liquidez, expectativas, noticias o condiciones macroeconómicas.'],
          ['Riesgo de liquidez', 'Una inversión puede tener valor, pero no ser fácil de vender al precio deseado. La liquidez importa especialmente cuando el dinero puede necesitarse con rapidez.'],
          ['Riesgo operativo', 'Incluye errores de ejecución, infraestructura, tecnología, procesos, contraparte o fallas en la operación de una estrategia.'],
          ['Riesgo de apalancamiento', 'El apalancamiento permite controlar una exposición mayor utilizando menos margen, pero también puede amplificar las consecuencias de un movimiento adverso.'],
        ],
      },
      {
        type: 'lesson',
        title: 'Volatilidad no significa automáticamente pérdida',
        paragraphs: ['La volatilidad describe cuánto puede cambiar el precio. Un activo muy volátil puede subir rápidamente y también caer rápidamente. Por eso una persona no debería mirar solamente el rendimiento histórico; debe observar cómo se consiguió, qué exposición existía y qué podría ocurrir bajo condiciones diferentes.'],
        example: ['Ejemplo:', 'dos estrategias pueden mostrar el mismo rendimiento en un periodo. Una pudo conseguirlo con fluctuaciones moderadas y otra mediante posiciones muy apalancadas. El número final es igual, pero el perfil de riesgo es completamente distinto.'],
      },
      { type: 'risk', label: 'Regla de oro:', text: 'el desempeño histórico no elimina el riesgo de mercado. En el caso de activos digitales y trading apalancado, las pérdidas pueden ser significativas y ningún resultado pasado garantiza resultados futuros.' },
    ],
  },
  {
    id: '03',
    title: 'Diversificación: no pongas todos los huevos en una sola canasta',
    intro: 'Diversificar significa distribuir el capital entre diferentes activos, estrategias, sectores, fuentes de ingreso y, cuando sea apropiado, horizontes. La finalidad no es evitar cualquier pérdida; es evitar que un único evento determine el resultado de todo el patrimonio.',
    blocks: [
      {
        type: 'cards', cols: 3,
        items: [
          ['Reserva de liquidez', 'Capital disponible para necesidades, contingencias y oportunidades. Su función es dar estabilidad y evitar vender inversiones en un momento desfavorable por una necesidad inesperada.'],
          ['Renta fija', 'Instrumentos que pueden aportar estabilidad relativa y flujos definidos, aunque tienen riesgos propios como tasas, inflación, emisor y liquidez.'],
          ['Renta variable', 'Acciones, fondos y otros instrumentos cuyo valor puede fluctuar. Su función dentro de una cartera puede estar relacionada con crecimiento patrimonial.'],
          ['Activos digitales', 'Una exposición específica a un mercado de elevada volatilidad y con riesgos particulares.'],
          ['Estrategias especializadas', 'Capital asignado a metodologías concretas de inversión o trading, con parámetros de riesgo y operación definidos.'],
          ['Negocios físicos', 'Empresas o actividades productivas que pueden generar flujo de efectivo y ofrecer una fuente de retorno diferente a los mercados financieros.'],
        ],
      },
      {
        type: 'lesson',
        title: 'Diversificar no significa comprar muchas cosas',
        paragraphs: [
          'Comprar diez activos que se comportan prácticamente igual no crea necesariamente una buena diversificación. La pregunta importante es **qué tan relacionados están los riesgos**. Una cartera puede tener muchas posiciones y seguir dependiendo demasiado de un mismo mercado o factor.',
          'La diversificación también puede producirse entre **fuentes de flujo**. Por ejemplo, una persona puede combinar ingresos laborales o empresariales, instrumentos financieros y una asignación pequeña a estrategias de mayor riesgo.',
        ],
      },
      {
        type: 'lesson',
        title: '¿Por qué incluir un negocio físico?',
        paragraphs: [
          'Los mercados financieros no son la única manera de construir patrimonio. Un **negocio físico** puede aportar una fuente de flujo de efectivo vinculada a una actividad productiva: comercio, servicios, alimentos, manufactura, renta de espacios u otras actividades empresariales.',
          'Esto no significa que un negocio sea automáticamente seguro. También tiene riesgos: gastos, competencia, personal, demanda, inventario, impuestos, mantenimiento y capital inmovilizado. Precisamente por eso se considera otra pieza de la diversificación, no un sustituto de todas las demás inversiones.',
          'La idea es construir diferentes motores económicos. Mientras una actividad profesional o empresarial puede producir flujo de efectivo, una cartera financiera puede buscar crecimiento o ingresos a largo plazo, y una pequeña asignación de alto riesgo puede participar en oportunidades de mayor volatilidad.',
        ],
        example: ['Principio:', 'no necesitas que todos tus activos produzcan dinero de la misma manera. La fortaleza puede estar en combinar fuentes que tengan comportamientos y riesgos diferentes.'],
      },
      {
        type: 'lesson',
        title: 'El objetivo final: que el patrimonio llegue a pagar tus gastos',
        paragraphs: [
          'La independencia financiera no consiste simplemente en tener una cuenta grande. Consiste en alcanzar un punto en el que los **ingresos sostenibles producidos por tu patrimonio** sean suficientes para cubrir tus gastos sin depender necesariamente de tu trabajo diario.',
          'Ese punto debe ser el resultado de un proceso. Primero trabajas o construyes una actividad productiva; después ahorras y proteges una parte del capital; luego inviertes; posteriormente reinviertes y haces crecer el patrimonio. Con el tiempo, si el patrimonio alcanza un tamaño suficiente y los ingresos que produce son sostenibles, la dependencia del trabajo puede reducirse.',
          'Por eso abandonar el trabajo demasiado pronto puede ser un error. El trabajo, la profesión o el negocio pueden ser precisamente el motor que financia la construcción del patrimonio que algún día permitirá trabajar por elección y no por necesidad.',
        ],
      },
      { type: 'quote', text: '“QLC no busca administrar todo tu patrimonio. Busca convertirse en una asignación estratégica dentro de él.”', source: 'Principio central del documento conceptual de Educación Financiera de QLC.' },
    ],
  },
  {
    id: '04',
    title: 'Renta fija, renta variable y negocios: tres piezas con funciones distintas',
    intro: 'Una cartera equilibrada no necesita que todos sus componentes hagan lo mismo. Precisamente su valor está en que cada componente pueda cumplir una función diferente.',
    blocks: [
      {
        type: 'table',
        head: ['Tipo', 'Función posible', 'Ventajas potenciales', 'Riesgos / desventajas'],
        rows: [
          ['Renta fija', 'Estabilidad relativa y generación de flujos', 'Mayor previsibilidad en determinados instrumentos', 'Inflación, tasas, crédito, liquidez y rendimiento limitado'],
          ['Renta variable', 'Crecimiento patrimonial', 'Participación en empresas y potencial de apreciación', 'Volatilidad, caídas de mercado y pérdida de capital'],
          ['Negocios físicos', 'Flujo de efectivo y actividad productiva', 'Ingresos operativos y diversificación fuera de mercados', 'Operación, gastos, demanda, personal, competencia y capital inmovilizado'],
          ['Activos digitales', 'Exposición a un mercado alternativo', 'Acceso a una clase de activos dinámica', 'Alta volatilidad, liquidez variable y riesgos específicos del ecosistema'],
        ],
      },
      {
        type: 'lesson',
        title: 'La cartera debe responder a tus objetivos',
        paragraphs: [
          'Una persona que necesita liquidez puede priorizar instrumentos diferentes a alguien que tiene un horizonte de muchos años. Del mismo modo, alguien con ingresos empresariales variables puede valorar de forma distinta una reserva de liquidez frente a una persona con ingresos más estables.',
          'Por eso no existe un porcentaje universal que sea “la cartera correcta” para todo el mundo. Una asignación debe construirse alrededor del objetivo, horizonte, capacidad para asumir pérdidas y necesidad de liquidez.',
        ],
        example: ['Ejemplo conceptual:', 'piensa en una cartera como una mesa. La liquidez, renta fija, renta variable, negocios y estrategias especializadas son patas diferentes. No todas tienen que ser del mismo tamaño; lo importante es que la estructura completa tenga sentido.'],
      },
    ],
  },
  {
    id: '05',
    title: 'Trading: entender qué es realmente una estrategia de alto riesgo',
    intro: 'El trading busca aprovechar movimientos de precio mediante operaciones de compra, venta o ambas, dependiendo del mercado y de la estrategia. Puede utilizar análisis, datos, gestión de posiciones, automatización y herramientas tecnológicas.',
    blocks: [
      {
        type: 'cards', cols: 3,
        items: [
          ['Análisis', 'El operador estudia precio, liquidez, volatilidad, volumen, derivados, posiciones y otros datos para construir una hipótesis de mercado.'],
          ['Ejecución', 'La entrada y salida importan. En mercados rápidos, la diferencia entre el precio esperado y el ejecutado puede cambiar el resultado.'],
          ['Gestión de riesgo', 'El tamaño de la posición, el margen, la exposición total y las reglas operativas determinan cuánto capital queda comprometido.'],
        ],
      },
      {
        type: 'lesson',
        title: 'Por qué las redes sociales pueden crear una imagen distorsionada',
        paragraphs: [
          'En internet es frecuente mostrar únicamente operaciones ganadoras, capturas de resultados o promesas de rentabilidad. Eso no permite conocer la distribución completa de resultados, el capital expuesto, los periodos negativos ni el riesgo utilizado para conseguirlos.',
          'El trading profesional, en cambio, debe analizarse como un **sistema**: metodología + datos + infraestructura + ejecución + control de exposición + disciplina + evaluación.',
        ],
      },
      {
        type: 'lesson',
        title: 'Retail frente a infraestructura profesional',
        paragraphs: [
          'Muchos operadores minoristas comienzan con herramientas limitadas, toman decisiones emocionales, utilizan un tamaño de posición excesivo o no tienen un proceso consistente. Eso puede colocarlos en desventaja frente a participantes con mejores datos, tecnología, experiencia e infraestructura.',
          'Esto no significa que todo operador retail esté destinado a perder ni que toda operación profesional sea ganadora. Significa que el **proceso y la infraestructura importan**, especialmente cuando se opera un mercado rápido y apalancado.',
        ],
      },
      { type: 'risk', label: 'Conclusión:', text: 'el trading no debe presentarse como una forma sencilla de enriquecimiento. Es una actividad de alto riesgo que requiere entender perfectamente qué capital se está exponiendo y bajo qué reglas.' },
    ],
  },
  {
    id: '06',
    title: '¿Qué lugar puede ocupar QLC dentro de una cartera?',
    intro: 'El concepto de QLC parte de una idea sencilla: una estrategia especializada de trading puede existir dentro de una cartera, pero no necesita representar la totalidad del patrimonio.',
    blocks: [
      {
        type: 'cards', cols: 2,
        items: [
          ['Una asignación, no el patrimonio', 'QLC plantea una exposición específica con parámetros definidos. El objetivo conceptual es evitar que el inversor concentre todo su patrimonio en una sola estrategia de alto riesgo.'],
          ['Infraestructura y tecnología', 'El modelo se plantea alrededor de software, automatización, infraestructura operativa y algoritmos para ejecutar una metodología definida.'],
          ['Control de exposición', 'La política inicial de QLC establece límites de capital por cuenta principal como parte de su metodología de distribución y control de exposición.'],
          ['Seguimiento antes de crecer', 'El incremento de una asignación no se plantea como automático. Puede depender de la relación, condiciones operativas, evaluación y capacidad de infraestructura.'],
        ],
      },
      {
        type: 'lesson',
        title: '¿Por qué un límite inicial de 400 USDT?',
        paragraphs: [
          'De acuerdo con el documento conceptual de QLC, la asignación inicial contempla un mínimo de **20 USDT** y un máximo de **400 USDT** por cuenta principal. La finalidad indicada es mantener el capital administrado dentro de parámetros operativos definidos y evitar una concentración excesiva de capital en una sola cuenta operativa.',
          'La lógica educativa detrás del límite es importante: cuando una inversión es de alto riesgo, aumentar el capital no necesariamente mejora la estructura de una cartera. Primero debe existir una razón para aumentar la exposición.',
        ],
        example: ['Idea clave:', 'si una persona tiene un patrimonio diversificado, una asignación limitada a una estrategia especializada puede permitir participar en ella sin convertirla automáticamente en el centro de todo su patrimonio.'],
      },
      { type: 'quote', text: '“La gestión profesional también consiste en saber cuándo no aumentar la exposición.”', source: 'Principio incluido en el documento conceptual de QLC.' },
    ],
  },
  {
    id: '07',
    title: 'Cómo construir una cartera paso a paso',
    intro: 'Ahora reunimos todo lo aprendido. El objetivo no es darte una fórmula universal, sino enseñarte un proceso mental para tomar mejores decisiones.',
    blocks: [
      {
        type: 'timeline',
        steps: [
          ['Calcula tu realidad financiera', 'Identifica patrimonio, deudas, ingresos, gastos, liquidez y capital que realmente puedes invertir. No empieces por elegir un activo; empieza por entender tu situación.'],
          ['Define tus objetivos', 'Determina si buscas preservar capital, generar flujo, crecer a largo plazo o asumir una exposición específica a oportunidades de mayor riesgo.'],
          ['Construye una reserva', 'La liquidez evita que una necesidad inmediata te obligue a vender una inversión en un momento desfavorable.'],
          ['Distribuye entre categorías', 'Considera renta fija, renta variable, activos digitales, negocios físicos y estrategias especializadas de acuerdo con tus objetivos y capacidad de riesgo.'],
          ['Define un presupuesto de riesgo', 'Establece de antemano cuánto capital puede estar expuesto a estrategias de alta volatilidad. No improvises este número después de entrar al mercado.'],
          ['Evalúa cada componente', 'Revisa qué función cumple cada inversión, qué riesgo aporta y si sigue teniendo sentido dentro de la cartera completa.'],
          ['Reequilibra con disciplina', 'Una cartera puede desviarse de su estructura original porque algunos activos suben más que otros. Revisarla permite decidir si la exposición sigue siendo adecuada.'],
        ],
      },
      {
        type: 'lesson',
        title: 'Antes de aumentar tus inversiones, revisa tus protecciones',
        paragraphs: [
          'Una cartera de inversión debe construirse sobre una base financiera razonablemente protegida. Antes de pensar en incrementar la exposición a activos de alto riesgo, revisa si cuentas con **seguro de gastos médicos mayores** y, cuando corresponda, **seguro de vida**, especialmente si otras personas dependen de tus ingresos.',
          'En lugares donde la atención sanitaria pública no cubre adecuadamente determinadas necesidades o puede resultar insuficiente ante una emergencia, una cobertura privada puede evitar que un evento médico termine consumiendo el patrimonio que estabas intentando construir.',
          'La educación financiera no consiste únicamente en aprender a obtener rendimiento. También consiste en aprender a **evitar que un solo acontecimiento destruya años de trabajo y ahorro**.',
        ],
      },
      {
        type: 'lesson',
        title: 'La pregunta profesional',
        paragraphs: ['En lugar de preguntar únicamente **“¿cuánto puedo ganar?”**, acostúmbrate a preguntar:'],
        list: [
          '¿Cuánto puedo perder?', '¿Qué porcentaje de mi patrimonio representa?', '¿Qué función cumple esta inversión?',
          '¿Qué ocurre con mi cartera si este activo cae?', '¿Tengo suficiente liquidez fuera de esta posición?',
          '¿Estoy diversificando realmente o solamente acumulando activos parecidos?',
        ],
      },
    ],
  },
  {
    id: '08',
    title: 'La filosofía QLC: limitar la exposición también es gestionar',
    intro: 'La última lección conecta la educación financiera con la política operativa de QLC: una estrategia profesional no debería medir su éxito únicamente por cuánto capital consigue administrar, sino también por cómo controla la exposición.',
    blocks: [
      {
        type: 'cards', cols: 2,
        items: [
          ['20 USDT · mínimo inicial', 'El documento conceptual establece esta cantidad como mínimo inicial dentro de la estructura planteada.'],
          ['400 USDT · máximo inicial', 'QLC establece este límite para nuevos participantes como parte de su metodología de control y distribución de exposición.'],
        ],
      },
      {
        type: 'bars',
        items: [['Asignación inicial', 25], ['Seguimiento', 50], ['Evaluación', 75], ['Posible invitación', 100]],
        note: 'La gráfica es ilustrativa y representa etapas del proceso, no porcentajes de rentabilidad ni probabilidades.',
      },
      {
        type: 'timeline',
        title: 'El proceso de crecimiento',
        steps: [
          ['Asignación inicial', 'El participante comienza con una asignación limitada.'],
          ['Gestión', 'La estrategia opera dentro de los parámetros establecidos por la infraestructura.'],
          ['Seguimiento', 'El participante puede observar el desempeño y comprender la metodología.'],
          ['Evaluación', 'Se evalúan la relación, las condiciones operativas y la capacidad de infraestructura.'],
          ['Invitación', 'Si corresponde, QLC puede invitar al participante a incrementar su asignación mediante comunicación formal.'],
        ],
      },
      { type: 'quote', text: 'Una cartera inteligente no busca eliminar el riesgo. Busca que ningún riesgo individual tenga el poder de destruir toda la estructura patrimonial.' },
      { type: 'risk', label: 'Antes de tomar cualquier decisión:', text: 'QLC es una estrategia relacionada con activos digitales y trading, por lo que existe riesgo de mercado y, dependiendo de la operativa, riesgo asociado al apalancamiento. El límite de capital no convierte la estrategia en segura ni garantiza resultados.' },
    ],
  },
];

// Transición al producto de pago (documento maestro, secciones 2 y 3).
export const PLATFORM_FEATURES = [
  ['Academia progresiva', 'Cada mes se desbloquea una nueva unidad con educación, herramienta, ejercicio, registro y seguimiento.'],
  ['Mi cartera', 'Registra cada producto por categoría y obtén resultado y ROI por producto, categoría y cartera global.'],
  ['Patrimonio y conciliación', 'Separa aportaciones, deducciones y rentabilidad, y verifica que tu patrimonio esté conciliado.'],
  ['Cortes mensuales', 'Cierra cada mes, conserva tu historial y descarga cada corte en PDF.'],
  ['Informe anual', 'Al completar 12 meses obtienes tu Informe Patrimonial Anual con lo que cambió y por qué.'],
  ['Asesoría personalizada', 'Solicita sesiones educativas con cita para resolver dudas sobre tu organización financiera.'],
];
