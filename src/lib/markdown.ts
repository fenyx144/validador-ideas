/** Convierte el reporte a Markdown para copiarlo al portapapeles. */
import type { Analisis, EntradaIdea } from "./esquemas";
import {
  calcularEquilibrio,
  formatoMoneda,
  type DatosFinancieros,
  type OrigenDatos,
} from "./equilibrio";
import { NOMBRES_DIMENSION, puntajeGlobal } from "./puntaje";

export function reporteAMarkdown(
  entrada: EntradaIdea,
  a: Analisis,
  datos: DatosFinancieros,
  origen: OrigenDatos,
): string {
  const m = (v: number) => formatoMoneda(v, entrada.moneda);
  const eq = calcularEquilibrio(datos);
  const marca = (campo: keyof OrigenDatos) => (origen[campo] === "estimado" ? " _(estimado)_" : "");
  const lista = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

  return `# Validación de idea de negocio

> ${entrada.descripcion}

**Puntaje global: ${puntajeGlobal(a.puntajes)}/100**

${a.resumen}

${Object.entries(a.puntajes)
  .map(([d, p]) => `- ${NOMBRES_DIMENSION[d as keyof typeof NOMBRES_DIMENSION]}: ${p}/100`)
  .join("\n")}

## 1. Problema (dolor: ${a.problema.intensidadDolor})
${a.problema.descripcion}

${a.problema.explicacion}

## 2. Mercado _(estimaciones de IA, no verificadas)_
**Quién paga:** ${a.mercado.quienPaga}

**Tamaño estimado:** ${a.mercado.tamanoEstimado}

**Señales de que ya gastan dinero:**
${lista(a.mercado.senalesDeGasto)}

## 3. Competidores _(estimaciones de IA, no verificadas)_
Nivel de dominio del mercado: **${a.competidores.nivelDominio}**

${a.competidores.lista.map((c) => `- **${c.nombre}** (${c.tipo}): ${c.nota}`).join("\n")}

${a.competidores.comentario}

## 4. Diferenciadores
${lista(a.diferenciadores)}

## 5. Punto de equilibrio (mensual)
- Precio por ${a.estimacionesFinancieras.unidad}: ${m(datos.precio)}${marca("precio")}
- Costos fijos mensuales: ${m(datos.costosFijosMensuales)}${marca("costosFijosMensuales")}
- Costo variable por unidad: ${m(datos.costoVariableUnitario)}${marca("costoVariableUnitario")}

Fórmula: unidades = costos fijos ÷ (precio − costo variable)

${
  eq.viable
    ? `**Equilibrio: ${eq.unidades.toLocaleString("es-PE")} unidades/mes (${m(eq.ventas)} en ventas).** Margen de contribución: ${m(eq.margenContribucion)} por unidad.`
    : `**Sin equilibrio:** ${eq.motivo}`
}

## 6. Riesgos
${a.riesgos.map((r) => `- **${r.riesgo}** (severidad ${r.severidad}): ${r.mitigacion}`).join("\n")}

## 7. Próximos pasos para validar barato
${a.proximosPasos.map((p, i) => `${i + 1}. ${p.paso} — ${p.costoAproximado}, ${p.tiempo}`).join("\n")}

---
_Generado con el Validador de ideas de negocio con IA — Hecho por Diego Rivas_
`;
}
