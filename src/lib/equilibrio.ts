/**
 * Punto de equilibrio (break-even), calculado en código con una fórmula simple
 * y transparente. Es una función "pura": mismos datos de entrada => mismo
 * resultado, sin efectos secundarios. Por eso se puede usar tanto en el
 * servidor como en el navegador, y es fácil de testear.
 *
 *   Margen de contribución = Precio − Costo variable por unidad
 *   Unidades de equilibrio = Costos fijos mensuales ÷ Margen de contribución
 *   Ventas de equilibrio   = Unidades de equilibrio × Precio
 */
import type { Analisis, EntradaIdea } from "./esquemas";

export interface DatosFinancieros {
  precio: number;
  costosFijosMensuales: number;
  costoVariableUnitario: number;
}

/** De dónde vino cada número: del usuario o una estimación de la IA. */
export type Origen = "usuario" | "estimado";
export type OrigenDatos = Record<keyof DatosFinancieros, Origen>;

export type ResultadoEquilibrio =
  | {
      viable: true;
      margenContribucion: number;
      unidades: number; // redondeado hacia arriba: no se vende media unidad
      ventas: number;
    }
  | { viable: false; margenContribucion: number; motivo: string };

export function calcularEquilibrio(d: DatosFinancieros): ResultadoEquilibrio {
  const margen = d.precio - d.costoVariableUnitario;
  if (margen <= 0) {
    return {
      viable: false,
      margenContribucion: margen,
      motivo:
        "El precio no cubre el costo variable: cada venta pierde dinero, así que nunca se alcanza el equilibrio.",
    };
  }
  const unidades = Math.ceil(d.costosFijosMensuales / margen);
  return {
    viable: true,
    margenContribucion: margen,
    unidades,
    ventas: unidades * d.precio,
  };
}

/**
 * Combina los números del usuario con las estimaciones de la IA:
 * si el usuario escribió un valor, manda el usuario.
 */
export function combinarDatos(
  entrada: EntradaIdea,
  estimaciones: Analisis["estimacionesFinancieras"],
): { datos: DatosFinancieros; origen: OrigenDatos } {
  const campos: (keyof DatosFinancieros)[] = [
    "precio",
    "costosFijosMensuales",
    "costoVariableUnitario",
  ];
  const datos = {} as DatosFinancieros;
  const origen = {} as OrigenDatos;
  for (const campo of campos) {
    const delUsuario = entrada[campo];
    if (typeof delUsuario === "number") {
      datos[campo] = delUsuario;
      origen[campo] = "usuario";
    } else {
      datos[campo] = estimaciones[campo];
      origen[campo] = "estimado";
    }
  }
  return { datos, origen };
}

/** Puntos para el gráfico: ingresos vs costos totales según unidades vendidas. */
export function puntosGrafico(d: DatosFinancieros, unidadesEquilibrio?: number) {
  const maximo = Math.max(10, Math.ceil((unidadesEquilibrio ?? 100) * 2));
  const pasos = 20;
  return Array.from({ length: pasos + 1 }, (_, i) => {
    const unidades = Math.round((maximo / pasos) * i);
    return {
      unidades,
      ingresos: Math.round(unidades * d.precio),
      costos: Math.round(d.costosFijosMensuales + unidades * d.costoVariableUnitario),
    };
  });
}

export function formatoMoneda(valor: number, moneda: string): string {
  try {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: valor < 100 ? 2 : 0,
    }).format(valor);
  } catch {
    return `${moneda} ${valor.toFixed(2)}`;
  }
}
