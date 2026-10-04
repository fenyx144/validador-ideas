/**
 * Puntaje global calculado en código (no por el LLM) para que sea transparente:
 * es un promedio ponderado de las 5 dimensiones.
 */
import type { Analisis, Dimension } from "./esquemas";

export const PESOS: Record<Dimension, number> = {
  problema: 0.25,
  mercado: 0.25,
  competencia: 0.15,
  diferenciacion: 0.15,
  viabilidadFinanciera: 0.2,
};

export const NOMBRES_DIMENSION: Record<Dimension, string> = {
  problema: "Dolor del problema",
  mercado: "Mercado",
  competencia: "Espacio frente a competidores",
  diferenciacion: "Diferenciación",
  viabilidadFinanciera: "Viabilidad financiera",
};

export function puntajeGlobal(puntajes: Analisis["puntajes"]): number {
  const total = (Object.keys(PESOS) as Dimension[]).reduce(
    (suma, d) => suma + puntajes[d] * PESOS[d],
    0,
  );
  return Math.round(total);
}

export function etiquetaPuntaje(p: number): { texto: string; color: string } {
  if (p >= 75) return { texto: "Prometedora", color: "#4f5d3a" };
  if (p >= 55) return { texto: "Vale la pena validar", color: "#1f1d1a" };
  if (p >= 35) return { texto: "Necesita ajustes", color: "#a07a2c" };
  return { texto: "Alto riesgo", color: "#9a4a32" };
}
