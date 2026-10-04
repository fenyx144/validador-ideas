/**
 * Limitador de solicitudes por IP, muy simple ("ventana fija" en memoria).
 *
 * Nota: en Vercel cada instancia serverless tiene su propia memoria, así que el
 * límite es aproximado. Para algo serio usarías Redis (p. ej. Upstash).
 */
const VENTANA_MS = 60_000; // 1 minuto
const MAXIMO_POR_VENTANA = Number(process.env.RATE_LIMIT_POR_MINUTO ?? 5);

const registros = new Map<string, { inicio: number; cuenta: number }>();

export function verificarLimite(ip: string, ahora = Date.now()) {
  const r = registros.get(ip);
  if (!r || ahora - r.inicio > VENTANA_MS) {
    registros.set(ip, { inicio: ahora, cuenta: 1 });
    return { permitido: true, reintentarEnSeg: 0 };
  }
  r.cuenta++;
  if (r.cuenta > MAXIMO_POR_VENTANA) {
    return { permitido: false, reintentarEnSeg: Math.ceil((r.inicio + VENTANA_MS - ahora) / 1000) };
  }
  return { permitido: true, reintentarEnSeg: 0 };
}

/** Obtiene la IP del cliente desde las cabeceras que agrega Vercel / proxies. */
export function obtenerIp(req: Request): string {
  const reenviada = req.headers.get("x-forwarded-for");
  return reenviada?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

/** Solo para tests. */
export function reiniciarLimites() {
  registros.clear();
}
