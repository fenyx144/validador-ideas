/**
 * Cliente mínimo para la API de Groq (compatible con OpenAI).
 *
 * `import "server-only"` hace que el build FALLE si alguien importa este archivo
 * desde un componente de cliente. Así la clave GROQ_API_KEY nunca llega al navegador.
 */
import "server-only";
import { esquemaAnalisis, type Analisis, type EntradaIdea } from "./esquemas";
import { PROMPT_SISTEMA, construirPromptUsuario } from "./prompt";

export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Modelo Llama actual en Groq. Se puede cambiar con la variable GROQ_MODEL.
export const MODELO_POR_DEFECTO = "llama-3.3-70b-versatile";

export class ErrorGroq extends Error {
  constructor(
    message: string,
    public codigo: "ERROR_IA" | "RESPUESTA_INVALIDA",
  ) {
    super(message);
  }
}

export function modeloActual(): string {
  return process.env.GROQ_MODEL?.trim() || MODELO_POR_DEFECTO;
}

/** Llama a Groq y devuelve un análisis ya validado. Reintenta 1 vez si el JSON no es válido. */
export async function analizarIdea(entrada: EntradaIdea, apiKey: string): Promise<Analisis> {
  let ultimoError = "";
  for (let intento = 1; intento <= 2; intento++) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modeloActual(),
        temperature: 0.4,
        max_tokens: 3000,
        response_format: { type: "json_object" }, // "modo JSON": fuerza JSON válido
        messages: [
          { role: "system", content: PROMPT_SISTEMA },
          { role: "user", content: construirPromptUsuario(entrada) },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      console.error("Groq respondió", res.status, detalle.slice(0, 500));
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
      if (validado.success) return validado.data;
      ultimoError = validado.error.message;
    } catch (e) {
      ultimoError = e instanceof Error ? e.message : "JSON inválido";
    }
    console.warn(`Intento ${intento}: respuesta del LLM no válida`, ultimoError.slice(0, 300));
  }
  throw new ErrorGroq("La IA devolvió un reporte con formato inesperado. Intenta de nuevo.", "RESPUESTA_INVALIDA");
}
