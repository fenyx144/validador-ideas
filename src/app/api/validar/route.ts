/**
 * RUTA DE SERVIDOR (Route Handler): POST /api/validar
 *
 * Este código se ejecuta SOLO en el servidor (en Vercel, como función serverless).
 * El navegador nunca ve este código ni la clave GROQ_API_KEY: solo envía el
 * formulario y recibe el JSON con el reporte.
 */
import { esquemaEntrada, type RespuestaValidar } from "@/lib/esquemas";
import { analizarIdea, ErrorGroq, modeloActual } from "@/lib/groq";
import { obtenerIp, verificarLimite } from "@/lib/limiteSolicitudes";

// Damos margen de tiempo a la función serverless (el LLM puede tardar unos segundos).
export const maxDuration = 60;

function responder(cuerpo: RespuestaValidar, status = 200, headers?: HeadersInit) {
  return Response.json(cuerpo, { status, headers });
}

export async function POST(req: Request) {
  // 1) Límite de solicitudes por IP
  const limite = verificarLimite(obtenerIp(req));
  if (!limite.permitido) {
    return responder(
      {
        ok: false,
        codigo: "LIMITE",
        error: `Demasiadas solicitudes. Intenta de nuevo en ${limite.reintentarEnSeg} s.`,
      },
      429,
      { "Retry-After": String(limite.reintentarEnSeg) },
    );
  }

  // 2) Validar lo que envió el formulario (nunca confíes en datos del cliente)
  const cuerpo = await req.json().catch(() => null);
  const entrada = esquemaEntrada.safeParse(cuerpo);
  if (!entrada.success) {
    const primerError = entrada.error.issues[0]?.message ?? "Datos inválidos";
    return responder({ ok: false, codigo: "ENTRADA_INVALIDA", error: primerError }, 400);
  }

  // 3) ¿Hay clave configurada? Si no, error amigable y sugerimos el modo demo
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return responder(
      {
        ok: false,
        codigo: "SIN_CLAVE",
        error:
          "Este sitio no tiene configurada la clave GROQ_API_KEY. Prueba el modo demo con los ejemplos, o configura una clave gratuita de console.groq.com.",
      },
      503,
    );
  }

  // 4) Llamar al LLM y devolver el análisis validado
  try {
    const analisis = await analizarIdea(entrada.data, apiKey);
    return responder({ ok: true, entrada: entrada.data, analisis, modelo: modeloActual() });
  } catch (e) {
    if (e instanceof ErrorGroq) {
      return responder({ ok: false, codigo: e.codigo, error: e.message }, 502);
    }
    console.error(e);
    return responder(
      { ok: false, codigo: "ERROR_IA", error: "No pudimos contactar a la IA. Intenta de nuevo." },
      502,
    );
  }
}
