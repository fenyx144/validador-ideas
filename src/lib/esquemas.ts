/**
 * Esquemas de datos con zod.
 *
 * zod nos permite describir la "forma" que deben tener los datos y validarlos
 * en tiempo de ejecución. TypeScript solo revisa tipos al compilar; zod revisa
 * los datos reales que llegan (del formulario o del LLM), que podrían venir mal.
 * Con `z.infer` obtenemos el tipo de TypeScript gratis a partir del esquema.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Entrada del usuario (lo que envía el formulario)
// ---------------------------------------------------------------------------

/** Convierte "" / null en undefined para que los campos numéricos sean opcionales. */
const numeroOpcional = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().min(0, "Debe ser un número positivo").max(1e12).optional(),
);

const textoOpcional = z.string().trim().max(200).optional().default("");

export const MONEDAS = ["PEN", "USD", "MXN", "COP", "CLP", "ARS", "EUR"] as const;

export const esquemaEntrada = z.object({
  descripcion: z
    .string()
    .trim()
    .min(20, "Describe tu idea con al menos 20 caracteres")
    .max(2000, "Máximo 2000 caracteres"),
  pais: textoOpcional,
  ciudad: textoOpcional,
  clienteObjetivo: z.string().trim().max(500).optional().default(""),
  moneda: z.enum(MONEDAS).default("USD"),
  precio: numeroOpcional,
  costosFijosMensuales: numeroOpcional,
  costoVariableUnitario: numeroOpcional,
});

export type EntradaIdea = z.infer<typeof esquemaEntrada>;

// ---------------------------------------------------------------------------
// Salida del LLM (el análisis estructurado)
// ---------------------------------------------------------------------------

/** Puntaje 0-100. `coerce` acepta "75" además de 75; luego lo acotamos. */
const puntaje = z.coerce
  .number()
  .transform((n) => Math.round(Math.min(100, Math.max(0, n))));

const nivel = z.enum(["bajo", "medio", "alto"]);

export const esquemaAnalisis = z.object({
  resumen: z.string(),
  problema: z.object({
    descripcion: z.string(),
    intensidadDolor: nivel,
    explicacion: z.string(),
  }),
  mercado: z.object({
    quienPaga: z.string(),
    tamanoEstimado: z.string(),
    senalesDeGasto: z.array(z.string()).max(8),
  }),
  competidores: z.object({
    lista: z
      .array(
        z.object({
          nombre: z.string(),
          tipo: z.enum(["directo", "indirecto"]),
          nota: z.string(),
        }),
      )
      .max(8),
    nivelDominio: nivel,
    comentario: z.string(),
  }),
  diferenciadores: z.array(z.string()).max(8),
  // Estimaciones que propone el LLM. Solo se usan si el usuario no dio sus números.
  estimacionesFinancieras: z.object({
    precio: z.coerce.number().min(0),
    costosFijosMensuales: z.coerce.number().min(0),
    costoVariableUnitario: z.coerce.number().min(0),
    unidad: z.string(), // p. ej. "taza de café", "suscripción mensual"
    justificacion: z.string(),
  }),
  riesgos: z
    .array(
      z.object({
        riesgo: z.string(),
        severidad: nivel,
        mitigacion: z.string(),
      }),
    )
    .max(8),
  puntajes: z.object({
    problema: puntaje,
    mercado: puntaje,
    competencia: puntaje,
    diferenciacion: puntaje,
    viabilidadFinanciera: puntaje,
  }),
  proximosPasos: z
    .array(
      z.object({
        paso: z.string(),
        costoAproximado: z.string(),
        tiempo: z.string(),
      }),
    )
    .max(8),
});

export type Analisis = z.infer<typeof esquemaAnalisis>;
export type Dimension = keyof Analisis["puntajes"];

/** Respuesta que devuelve nuestra ruta /api/validar al navegador. */
export type RespuestaValidar =
  | { ok: true; entrada: EntradaIdea; analisis: Analisis; modelo: string }
  | { ok: false; codigo: CodigoError; error: string };

export type CodigoError =
  | "SIN_CLAVE"
  | "LIMITE"
  | "ENTRADA_INVALIDA"
  | "ERROR_IA"
  | "RESPUESTA_INVALIDA";
