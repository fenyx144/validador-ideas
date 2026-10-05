/**
 * Cliente mínimo para la API de Groq (compatible con OpenAI).
 *
 * `import "server-only"` hace que el build FALLE si alguien importa este archivo
 * desde un componente de cliente. Así la clave GROQ_API_KEY nunca llega al navegador.
 *
 * Si el modelo configurado ya no existe (404), preguntamos a /v1/models y
 * elegimos uno de chat actual. La elección se guarda en memoria del proceso.
 */
import "server-only";
import { esquemaAnalisis, type Analisis, type EntradaIdea } from "./esquemas";
import { PROMPT_SISTEMA, construirPromptUsuario } from "./prompt";

export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";
/** Sustituto de llama-3.3-70b-versatile (retirado en agosto 2026). */
export const MODELO_POR_DEFECTO = "openai/gpt-oss-120b";

export class ErrorGroq extends Error {
  constructor(
    message: string,
    public codigo: "ERROR_IA" | "RESPUESTA_INVALIDA",
  ) {
    super(message);
  }
}

/** Preferencias: primero gpt-oss grandes, luego qwen/llama de chat. */
const PREFERENCIAS = [
  /^openai\/gpt-oss-120b$/i,
  /^openai\/gpt-oss-20b$/i,
  /^qwen\/qwen3\.6/i,
  /^qwen\/qwen3/i,
  /^llama-3\.3/i,
  /^meta-llama\/llama-4/i,
  /^llama/i,
  /^openai\//i,
  /^qwen/i,
];

const EXCLUIDOS = /whisper|guard|tts|playai|compound|allam|prompt-guard/i;

let modeloResuelto: string | null = null;

export function reiniciarModeloResuelto() { modeloResuelto = null; }

export function modeloActual(): string {
  return modeloResuelto ?? process.env.GROQ_MODEL?.trim() ?? MODELO_POR_DEFECTO;
}

/** Elige un modelo de chat usable a partir de la lista pública de Groq. */
export function elegirModeloDeLista(ids: string[]): string | null {
  const candidatos = ids.filter((id) => id && !EXCLUIDOS.test(id));
  for (const re of PREFERENCIAS) {
    const hit = candidatos.find((id) => re.test(id));
    if (hit) return hit;
  }
  return candidatos[0] ?? null;
}

async function descubrirModelo(apiKey: string): Promise<string> {
  const res = await fetch(GROQ_MODELS_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new ErrorGroq(`No se pudo listar modelos de Groq (${res.status}).`, "ERROR_IA");
  const datos = (await res.json()) as { data?: { id: string }[] };
  const ids = (datos.data ?? []).map((m) => m.id);
  const elegido = elegirModeloDeLista(ids);
  if (!elegido) throw new ErrorGroq("Groq no tiene modelos de chat disponibles ahora.", "ERROR_IA");
  modeloResuelto = elegido;
  console.info("Groq: se usa el modelo", elegido);
  return elegido;
}

function esModeloInexistente(status: number, cuerpo: string) {
  if (status === 404) return true;
  return /model_not_found|does not exist|decommissioned|no longer supported/i.test(cuerpo);
}

async function llamarGroq(apiKey: string, modelo: string, entrada: EntradaIdea) {
  return fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelo,
      temperature: 0.4,
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PROMPT_SISTEMA },
        { role: "user", content: construirPromptUsuario(entrada) },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });
}

/** Llama a Groq y devuelve un análisis ya validado. Reintenta 1 vez si el JSON no es válido. */
export async function analizarIdea(entrada: EntradaIdea, apiKey: string): Promise<Analisis> {
  let ultimoError = "";
  let modelo = modeloActual();
  let yaProbamosOtroModelo = false;

  for (let intento = 1; intento <= 2; intento++) {
    const res = await llamarGroq(apiKey, modelo, entrada);

    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      console.error("Groq respondió", res.status, detalle.slice(0, 500));

      if (!yaProbamosOtroModelo && esModeloInexistente(res.status, detalle)) {
        yaProbamosOtroModelo = true;
        modelo = await descubrirModelo(apiKey);
        intento--; // no cuenta como intento de JSON inválido
        continue;
      }

      const mensaje =
        res.status === 401
          ? "La clave GROQ_API_KEY no es válida."
          : res.status === 429
            ? "Groq está limitando las solicitudes. Intenta en un minuto."
            : `Groq respondió con error ${res.status}.`;
      throw new ErrorGroq(mensaje, "ERROR_IA");
    }

    const datos = await res.json();
    const contenido: unknown = datos?.choices?.[0]?.message?.content;
    try {
      const json = JSON.parse(String(contenido));
      const validado = esquemaAnalisis.safeParse(json);
      if (validado.success) {
        modeloResuelto = modelo;
        return validado.data;
      }
      ultimoError = validado.error.message;
    } catch (e) {
      ultimoError = e instanceof Error ? e.message : "JSON inválido";
    }
    console.warn(`Intento ${intento}: respuesta del LLM no válida`, ultimoError.slice(0, 300));
  }
  throw new ErrorGroq("La IA devolvió un reporte con formato inesperado. Intenta de nuevo.", "RESPUESTA_INVALIDA");
}
