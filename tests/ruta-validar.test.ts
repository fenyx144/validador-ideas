/**
 * Test de la ruta POST /api/validar con una respuesta de Groq SIMULADA (mock):
 * reemplazamos `fetch` global para no gastar llamadas reales ni necesitar clave.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/validar/route";
import { EJEMPLOS_DEMO } from "@/lib/demos";
import { reiniciarLimites } from "@/lib/limiteSolicitudes";
import { reiniciarModeloResuelto } from "@/lib/groq";

const analisisEjemplo = EJEMPLOS_DEMO[0].analisis;

function peticion(cuerpo: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/validar", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(cuerpo),
  });
}

function respuestaGroq(contenido: string, status = 200) {
  return new Response(JSON.stringify({ choices: [{ message: { content: contenido } }] }), { status });
}

const entradaValida = {
  descripcion: "Una app para conectar paseadores de perros con dueños ocupados en Lima",
  pais: "Perú",
  moneda: "PEN",
  precio: "25",
  costosFijosMensuales: "",
};

beforeEach(() => {
  reiniciarLimites();
  reiniciarModeloResuelto();
  vi.stubEnv("GROQ_API_KEY", "gsk_test");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/validar", () => {
  it("devuelve el análisis validado cuando Groq responde bien", async () => {
    // Groq a veces devuelve puntajes como texto: el esquema los convierte.
    const conPuntajeTexto = { ...analisisEjemplo, puntajes: { ...analisisEjemplo.puntajes, problema: "150" } };
    const fetchMock = vi.fn().mockResolvedValue(respuestaGroq(JSON.stringify(conPuntajeTexto)));
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(peticion(entradaValida));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.analisis.puntajes.problema).toBe(100); // acotado a 0-100
    expect(json.entrada.precio).toBe(25);
    expect(json.entrada.costosFijosMensuales).toBeUndefined();

    // Verificamos que la llamada a Groq sea correcta y lleve la clave solo en el servidor
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(opciones.headers.Authorization).toBe("Bearer gsk_test");
    const cuerpo = JSON.parse(opciones.body);
    expect(cuerpo.response_format).toEqual({ type: "json_object" });
    expect(cuerpo.model).toBe("openai/gpt-oss-120b");
    expect(JSON.stringify(json)).not.toContain("gsk_test");
  });

  it("reintenta una vez si el JSON no cumple el esquema", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuestaGroq('{"resumen": "incompleto"}'))
      .mockResolvedValueOnce(respuestaGroq(JSON.stringify(analisisEjemplo)));
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(peticion(entradaValida));
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("devuelve RESPUESTA_INVALIDA si el LLM falla dos veces", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => respuestaGroq("esto no es json")));
    const res = await POST(peticion(entradaValida));
    expect(res.status).toBe(502);
    expect((await res.json()).codigo).toBe("RESPUESTA_INVALIDA");
  });

  it("traduce un 401 de Groq a un mensaje amigable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unauthorized", { status: 401 })));
    const json = await (await POST(peticion(entradaValida))).json();
    expect(json).toMatchObject({ ok: false, codigo: "ERROR_IA" });
    expect(json.error).toContain("no es válida");
  });

  it("error amigable SIN_CLAVE si falta GROQ_API_KEY (sin llamar a Groq)", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await POST(peticion(entradaValida));
    expect(res.status).toBe(503);
    expect((await res.json()).codigo).toBe("SIN_CLAVE");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rechaza entradas inválidas", async () => {
    const res = await POST(peticion({ descripcion: "corta" }));
    expect(res.status).toBe(400);
    expect((await res.json()).codigo).toBe("ENTRADA_INVALIDA");
  });

  it("limita a 5 solicitudes por minuto por IP", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const estados: number[] = [];
    for (let i = 0; i < 6; i++) estados.push((await POST(peticion(entradaValida, "9.9.9.9"))).status);
    expect(estados.slice(0, 5).every((s) => s === 503)).toBe(true);
    expect(estados[5]).toBe(429);
    // Otra IP no se ve afectada
    expect((await POST(peticion(entradaValida, "8.8.8.8"))).status).toBe(503);
  });
});

describe("modelo inexistente (404)", () => {
  it("lista modelos y reintenta con uno actual", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: "model_not_found" } }), { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              { id: "whisper-large-v3" },
              { id: "meta-llama/llama-guard-4-12b" },
              { id: "openai/gpt-oss-20b" },
              { id: "openai/gpt-oss-120b" },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(respuestaGroq(JSON.stringify(analisisEjemplo)));
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(peticion(entradaValida));
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.modelo).toBe("openai/gpt-oss-120b");
    expect(fetchMock.mock.calls.map((c) => String(c[0]))).toEqual([
      "https://api.groq.com/openai/v1/chat/completions",
      "https://api.groq.com/openai/v1/models",
      "https://api.groq.com/openai/v1/chat/completions",
    ]);
    const body = JSON.parse(String(fetchMock.mock.calls[2][1].body));
    expect(body.model).toBe("openai/gpt-oss-120b");
  });
});
