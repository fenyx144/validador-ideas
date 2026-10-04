import { describe, expect, it } from "vitest";
import { calcularEquilibrio, combinarDatos } from "@/lib/equilibrio";
import { esquemaAnalisis, esquemaEntrada } from "@/lib/esquemas";
import { EJEMPLOS_DEMO } from "@/lib/demos";
import { puntajeGlobal } from "@/lib/puntaje";

describe("calcularEquilibrio", () => {
  it("aplica unidades = fijos / (precio - variable), redondeando hacia arriba", () => {
    const r = calcularEquilibrio({ precio: 9, costosFijosMensuales: 3200, costoVariableUnitario: 3.2 });
    expect(r.viable).toBe(true);
    if (r.viable) {
      expect(r.unidades).toBe(Math.ceil(3200 / 5.8)); // 552
      expect(r.ventas).toBe(552 * 9);
    }
  });

  it("no hay equilibrio si el precio no cubre el costo variable", () => {
    const r = calcularEquilibrio({ precio: 5, costosFijosMensuales: 100, costoVariableUnitario: 5 });
    expect(r.viable).toBe(false);
  });
});

describe("combinarDatos", () => {
  it("usa los números del usuario y rellena con estimaciones de la IA", () => {
    const entrada = esquemaEntrada.parse({ descripcion: "x".repeat(25), precio: "10" });
    const { datos, origen } = combinarDatos(entrada, {
      precio: 99,
      costosFijosMensuales: 500,
      costoVariableUnitario: 4,
      unidad: "u",
      justificacion: "",
    });
    expect(datos).toEqual({ precio: 10, costosFijosMensuales: 500, costoVariableUnitario: 4 });
    expect(origen).toEqual({ precio: "usuario", costosFijosMensuales: "estimado", costoVariableUnitario: "estimado" });
  });
});

describe("ejemplos demo", () => {
  it.each(EJEMPLOS_DEMO)("$id cumple los esquemas", (ej) => {
    expect(esquemaEntrada.safeParse(ej.entrada).success).toBe(true);
    expect(esquemaAnalisis.safeParse(ej.analisis).success).toBe(true);
    expect(puntajeGlobal(ej.analisis.puntajes)).toBeGreaterThan(0);
  });
});
