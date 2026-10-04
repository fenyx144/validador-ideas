/**
 * Modo demo: ideas de ejemplo con resultados precalculados.
 * Permiten probar la app sin clave de Groq (por ejemplo, en un portafolio).
 * Los datos de mercado y competidores son ilustrativos, no verificados.
 */
import type { Analisis, EntradaIdea } from "./esquemas";

export interface EjemploDemo {
  id: string;
  titulo: string;
  emoji: string;
  entrada: EntradaIdea;
  analisis: Analisis;
}

export const EJEMPLOS_DEMO: EjemploDemo[] = [
  {
    id: "cafe-movil",
    titulo: "Café de especialidad en bicicleta",
    emoji: "☕",
    entrada: {
      descripcion:
        "Un carrito-bicicleta de café de especialidad que se ubica en las mañanas cerca de oficinas y universidades, con granos peruanos de pequeños productores y pedidos anticipados por WhatsApp.",
      pais: "Perú",
      ciudad: "Lima (Miraflores y San Isidro)",
      clienteObjetivo: "Oficinistas y universitarios de 20 a 40 años que compran café al paso",
      moneda: "PEN",
      precio: 9,
      costosFijosMensuales: 3200,
      costoVariableUnitario: 3.2,
    },
    analisis: {
      resumen:
        "Idea con demanda real y ticket bajo: el café al paso ya es un hábito diario. El reto es la ubicación (permisos municipales) y alcanzar volumen suficiente con un solo carrito. Vale la pena validar con un piloto de 2 semanas.",
      problema: {
        descripcion:
          "Los oficinistas quieren buen café rápido, pero las cafeterías de especialidad tienen colas o están lejos y las de cadena son caras.",
        intensidadDolor: "medio",
        explicacion:
          "No es un dolor crítico, pero es un gasto frecuente y emocional: la gente ya paga diariamente por conveniencia y calidad.",
      },
      mercado: {
        quienPaga: "El propio consumidor, con gasto diario de S/ 8 a S/ 15 por bebida.",
        tamanoEstimado:
          "Estimado: miles de oficinistas en un radio de 500 m de cada punto de venta; basta captar 60-80 clientes diarios para ser rentable.",
        senalesDeGasto: [
          "Colas en cafeterías de cadena en horario de 8 a 10 a. m.",
          "Crecimiento visible de cafeterías de especialidad en distritos empresariales",
          "Venta ambulante de café y emoliente ya aceptada culturalmente",
          "Apps de delivery con café entre los productos más pedidos en la mañana",
        ],
      },
      competidores: {
        lista: [
          { nombre: "Starbucks / cadenas grandes", tipo: "directo", nota: "Marca fuerte, precio alto, colas en hora punta." },
          { nombre: "Cafeterías de especialidad locales", tipo: "directo", nota: "Buena calidad, pero ubicación fija y atención más lenta." },
          { nombre: "Tiendas de conveniencia (Tambo, OXXO)", tipo: "indirecto", nota: "Café barato y rápido, baja calidad." },
          { nombre: "Café en la oficina", tipo: "indirecto", nota: "Gratis para el empleado, pero de baja calidad." },
        ],
        nivelDominio: "medio",
        comentario:
          "Mercado fragmentado: hay grandes cadenas, pero el formato móvil de especialidad tiene poca competencia directa (estimación, no verificado).",
      },
      diferenciadores: [
        "Pedido anticipado por WhatsApp: el café está listo al llegar, cero colas",
        "Historia de origen: granos de productores específicos de Cajamarca o Cusco",
        "Tarjeta de fidelidad digital (el 10.º café gratis)",
        "Ubicación rotativa comunicada en Instagram",
      ],
      estimacionesFinancieras: {
        precio: 9,
        costosFijosMensuales: 3200,
        costoVariableUnitario: 3.2,
        unidad: "bebida de café",
        justificacion:
          "Costos fijos: sueldo de 1 barista, permiso municipal, mantenimiento y cuota del equipo. Variable: café, leche, vaso y tapa.",
      },
      riesgos: [
        { riesgo: "Permisos municipales para venta en vía pública", severidad: "alto", mitigacion: "Consultar a la municipalidad antes de invertir o aliarse con edificios que cedan espacio en su vereda privada." },
        { riesgo: "Clima y estacionalidad (menos café en verano)", severidad: "medio", mitigacion: "Agregar cold brew y bebidas frías en el menú de verano." },
        { riesgo: "Dependencia de una sola persona (barista)", severidad: "medio", mitigacion: "Documentar recetas y entrenar a un reemplazo." },
      ],
      puntajes: { problema: 62, mercado: 74, competencia: 58, diferenciacion: 66, viabilidadFinanciera: 70 },
      proximosPasos: [
        { paso: "Contar el flujo de personas en 3 esquinas candidatas entre 7 y 10 a. m.", costoAproximado: "S/ 0", tiempo: "3 mañanas" },
        { paso: "Crear un grupo de WhatsApp de preventa y conseguir 50 interesados en una oficina", costoAproximado: "S/ 0 - 50", tiempo: "1 semana" },
        { paso: "Piloto con termos y mesa plegable en un evento o cowork", costoAproximado: "S/ 300", tiempo: "2 fines de semana" },
        { paso: "Consultar requisitos de licencia de venta ambulante en la municipalidad", costoAproximado: "S/ 0", tiempo: "1 día" },
      ],
    },
  },
  {
    id: "agenda-peluquerias",
    titulo: "Agenda online para peluquerías",
    emoji: "💇",
    entrada: {
      descripcion:
        "Software de reservas por WhatsApp y web para peluquerías y barberías pequeñas, con recordatorios automáticos para reducir las citas a las que el cliente no asiste.",
      pais: "Colombia",
      ciudad: "Bogotá",
      clienteObjetivo: "Dueños de peluquerías y barberías con 1 a 5 sillas",
      moneda: "COP",
      precio: 60000,
      costosFijosMensuales: undefined,
      costoVariableUnitario: undefined,
    },
    analisis: {
      resumen:
        "Problema real (las citas perdidas cuestan dinero) y clientes que ya pagan por herramientas similares. El mercado tiene competidores fuertes, así que la clave es la simplicidad vía WhatsApp y el precio local. Buena idea para validar con 10 barberías.",
      problema: {
        descripcion:
          "Las peluquerías pequeñas gestionan citas por mensajes y cuaderno; pierden clientes que no llegan y tiempo contestando WhatsApp.",
        intensidadDolor: "alto",
        explicacion:
          "Cada cita perdida es ingreso que no se recupera. Los dueños sienten el dolor cada semana y pueden cuantificarlo.",
      },
      mercado: {
        quienPaga: "El dueño del local, con suscripción mensual.",
        tamanoEstimado:
          "Estimado: decenas de miles de peluquerías y barberías en Colombia; un nicho de algunas miles en Bogotá con 1-5 sillas.",
        senalesDeGasto: [
          "Barberías que ya pagan planes de apps de reservas internacionales",
          "Uso de WhatsApp Business con catálogos y mensajes automáticos",
          "Pago por publicidad en Instagram para conseguir clientes",
        ],
      },
      competidores: {
        lista: [
          { nombre: "Booksy / Fresha", tipo: "directo", nota: "Producto completo, pero pensado para otros mercados y a veces caro o complejo." },
          { nombre: "AgendaPro", tipo: "directo", nota: "Fuerte en Latinoamérica, enfocado en negocios más grandes." },
          { nombre: "WhatsApp + cuaderno", tipo: "indirecto", nota: "Gratis y conocido; el verdadero 'competidor' a vencer." },
        ],
        nivelDominio: "alto",
        comentario:
          "Hay jugadores establecidos (estimación, no verificado). Se puede entrar por un nicho: barberías pequeñas que quieren algo ultra simple.",
      },
      diferenciadores: [
        "Todo sucede dentro de WhatsApp, sin que el cliente descargue una app",
        "Precio en pesos y cobro por Nequi / Daviplata",
        "Configuración en 10 minutos con ayuda por videollamada",
        "Cobro de anticipo para reducir citas perdidas",
      ],
      estimacionesFinancieras: {
        precio: 60000,
        costosFijosMensuales: 4500000,
        costoVariableUnitario: 8000,
        unidad: "suscripción mensual de una peluquería",
        justificacion:
          "Estimado de la IA: fijos = hosting, API de WhatsApp base, medio tiempo de soporte y marketing. Variable = costo de mensajes de WhatsApp y pasarela de pago por cliente.",
      },
      riesgos: [
        { riesgo: "Alta cancelación (churn) de negocios pequeños", severidad: "alto", mitigacion: "Plan anual con descuento y demostrar ahorro mensual en citas recuperadas." },
        { riesgo: "Costos de la API de WhatsApp Business", severidad: "medio", mitigacion: "Limitar mensajes por plan y usar plantillas eficientes." },
        { riesgo: "Competidores bajan precios", severidad: "medio", mitigacion: "Competir por servicio local y comunidad, no solo por precio." },
      ],
      puntajes: { problema: 80, mercado: 72, competencia: 40, diferenciacion: 60, viabilidadFinanciera: 64 },
      proximosPasos: [
        { paso: "Entrevistar a 15 dueños de barberías: ¿cuántas citas pierden por semana?", costoAproximado: "COP 0", tiempo: "1 semana" },
        { paso: "Ofrecer el servicio 'manual' (tú envías los recordatorios) a 5 barberías", costoAproximado: "COP 50.000", tiempo: "2 semanas" },
        { paso: "Landing page con precio y botón de preventa", costoAproximado: "COP 100.000", tiempo: "3 días" },
      ],
    },
  },
  {
    id: "snacks-oficinas",
    titulo: "Snacks saludables para oficinas",
    emoji: "🥗",
    entrada: {
      descripcion:
        "Suscripción mensual de cajas de snacks saludables (frutos secos, barras, fruta deshidratada) para oficinas pequeñas y medianas, que las empresas ofrecen como beneficio a sus empleados.",
      pais: "México",
      ciudad: "Ciudad de México",
      clienteObjetivo: "Áreas de RR. HH. de startups y pymes de 20 a 150 empleados",
      moneda: "MXN",
      precio: undefined,
      costosFijosMensuales: undefined,
      costoVariableUnitario: undefined,
    },
    analisis: {
      resumen:
        "El dolor es moderado (es un 'nice to have'), pero quien paga es la empresa y el ticket por caja es alto. El éxito depende de ventas B2B y de la retención. Validar con 3 empresas piloto antes de comprar inventario.",
      problema: {
        descripcion:
          "Las empresas buscan beneficios baratos que mejoren el ambiente laboral; los empleados comen snacks poco saludables de máquinas expendedoras.",
        intensidadDolor: "bajo",
        explicacion:
          "No es urgente: es un beneficio opcional. Suele recortarse primero cuando hay ajustes de presupuesto.",
      },
      mercado: {
        quienPaga: "La empresa (RR. HH. u Operaciones) como gasto de bienestar.",
        tamanoEstimado:
          "Estimado: miles de pymes con oficina en CDMX; con el trabajo híbrido, el mercado de oficinas ocupadas a diario es menor que antes.",
        senalesDeGasto: [
          "Empresas que ya compran café, agua y fruta para la oficina",
          "Presupuestos de 'bienestar' en startups",
          "Servicios de catering para reuniones",
        ],
      },
      competidores: {
        lista: [
          { nombre: "Compras al por mayor (Costco / supermercado)", tipo: "indirecto", nota: "Más barato; requiere que alguien lo gestione." },
          { nombre: "Servicios de micro-market / máquinas expendedoras", tipo: "directo", nota: "Instalados en oficinas medianas y grandes." },
          { nombre: "Tiendas de snacks saludables en línea", tipo: "directo", nota: "Venden al consumidor, algunas tienen canal empresarial." },
        ],
        nivelDominio: "medio",
        comentario: "Sin un líder claro para pymes (estimación, no verificado); la alternativa principal es comprar en el supermercado.",
      },
      diferenciadores: [
        "Curaduría con marcas mexicanas pequeñas",
        "Encuesta mensual a empleados para personalizar la caja",
        "Reporte para RR. HH. con la satisfacción del beneficio",
      ],
      estimacionesFinancieras: {
        precio: 2500,
        costosFijosMensuales: 38000,
        costoVariableUnitario: 1450,
        unidad: "caja mensual para una oficina",
        justificacion:
          "Estimado de la IA: fijos = bodega pequeña, 1 persona de ventas/operaciones y reparto. Variable = productos, empaque y envío por caja.",
      },
      riesgos: [
        { riesgo: "Oficinas semivacías por trabajo híbrido", severidad: "alto", mitigacion: "Ofrecer cajas enviadas al domicilio de cada empleado." },
        { riesgo: "Productos perecederos y merma", severidad: "medio", mitigacion: "Priorizar snacks de larga vida y pedidos bajo demanda." },
        { riesgo: "Ciclos de venta B2B largos", severidad: "medio", mitigacion: "Prueba gratis de 1 mes a cambio de un testimonio." },
      ],
      puntajes: { problema: 38, mercado: 55, competencia: 60, diferenciacion: 50, viabilidadFinanciera: 48 },
      proximosPasos: [
        { paso: "Enviar mensajes por LinkedIn a 30 responsables de RR. HH. y agendar 10 llamadas", costoAproximado: "MXN 0", tiempo: "1 semana" },
        { paso: "Armar 3 cajas a mano y dejarlas en 3 oficinas como prueba", costoAproximado: "MXN 4.500", tiempo: "2 semanas" },
        { paso: "Medir cuántas empresas aceptan pagar el segundo mes", costoAproximado: "MXN 0", tiempo: "1 mes" },
      ],
    },
  },
];
