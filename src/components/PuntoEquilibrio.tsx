"use client";
/**
 * Sección 5: punto de equilibrio editable.
 *
 * CONCEPTO — Estado "levantado": los datos financieros viven en el componente
 * padre (Reporte), porque también los necesita el botón "Copiar Markdown".
 * Aquí solo los recibimos por props y avisamos cambios con `onCambiar`.
 */
import { useState } from "react";
import {
  calcularEquilibrio,
  formatoMoneda,
  type DatosFinancieros,
  type OrigenDatos,
} from "@/lib/equilibrio";
import GraficoEquilibrio from "./GraficoEquilibrio";
import { Etiqueta } from "./TarjetaSeccion";

interface Props {
  datos: DatosFinancieros;
  origen: OrigenDatos;
  moneda: string;
  unidad: string;
  justificacion: string;
  onCambiar: (datos: DatosFinancieros, origen: OrigenDatos) => void;
}

const CAMPOS: { campo: keyof DatosFinancieros; etiqueta: string }[] = [
  { campo: "precio", etiqueta: "Precio por unidad" },
  { campo: "costosFijosMensuales", etiqueta: "Costos fijos al mes" },
  { campo: "costoVariableUnitario", etiqueta: "Costo variable por unidad" },
];

export default function PuntoEquilibrio({ datos, origen, moneda, unidad, justificacion, onCambiar }: Props) {
  // Borrador local de los inputs (texto), para no recalcular mientras escribes.
  const [borrador, setBorrador] = useState(() => ({
    precio: String(datos.precio),
    costosFijosMensuales: String(datos.costosFijosMensuales),
    costoVariableUnitario: String(datos.costoVariableUnitario),
  }));

  // Valor derivado: se calcula en cada render a partir de las props.
  // No hace falta guardarlo en el estado (regla: no dupliques estado).
  const resultado = calcularEquilibrio(datos);
  const hayEstimados = Object.values(origen).includes("estimado");
  const m = (v: number) => formatoMoneda(v, moneda);

  function recalcular(e: React.FormEvent) {
    e.preventDefault();
    const nuevos = { ...datos };
    const nuevoOrigen = { ...origen };
    for (const { campo } of CAMPOS) {
      const n = Number(borrador[campo]);
      if (Number.isFinite(n) && n >= 0 && n !== datos[campo]) {
        nuevos[campo] = n;
        nuevoOrigen[campo] = "usuario"; // si lo editaste, ya es tuyo
      }
    }
    onCambiar(nuevos, nuevoOrigen);
  }

  return (
    <div className="space-y-5">
      {hayEstimados && (
        <p className="border-l-2 border-ochre pl-4 text-sm text-ink/80">
          Faltaban algunos datos, así que la IA propuso <strong>estimaciones</strong> (marcadas abajo). Edítalas con tus
          números reales y pulsa <em>Recalcular</em>. <span className="text-muted">Supuesto de la IA: {justificacion}</span>
        </p>
      )}

      <form onSubmit={recalcular} className="grid gap-3 sm:grid-cols-4 sm:items-end">
        {CAMPOS.map(({ campo, etiqueta }) => (
          <label key={campo} className="block text-sm">
            <span className="mb-1 flex items-center gap-2 text-slate-600">
              {etiqueta}
              {origen[campo] === "estimado" && <Etiqueta color="amber">estimado</Etiqueta>}
            </span>
            <input
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              value={borrador[campo]}
              onChange={(e) => setBorrador({ ...borrador, [campo]: e.target.value })}
              className="campo"
            />
          </label>
        ))}
        <button type="submit" className="boton-secundario h-[42px]">
          Recalcular
        </button>
      </form>

      <div className="border-y border-line py-4 font-mono text-sm text-ink/80">
        <p>margen = precio − costo variable = {m(datos.precio)} − {m(datos.costoVariableUnitario)} = <strong>{m(resultado.margenContribucion)}</strong></p>
        <p>unidades = costos fijos ÷ margen = {m(datos.costosFijosMensuales)} ÷ {m(resultado.margenContribucion)}</p>
      </div>

      {resultado.viable ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Dato titulo={`Unidades al mes (${unidad})`} valor={resultado.unidades.toLocaleString("es-PE")} />
          <Dato titulo="Ventas mensuales para no perder" valor={m(resultado.ventas)} />
          <Dato titulo="Aprox. unidades por día (30 días)" valor={Math.ceil(resultado.unidades / 30).toLocaleString("es-PE")} />
          <Dato titulo="Margen por unidad" valor={m(resultado.margenContribucion)} />
        </div>
      ) : (
        <p className="border-l-2 border-danger pl-4 text-sm text-danger">{resultado.motivo}</p>
      )}

      <GraficoEquilibrio datos={datos} unidadesEquilibrio={resultado.viable ? resultado.unidades : undefined} moneda={moneda} />
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="border-t border-line pt-3">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="font-serif text-3xl text-ink">{valor}</p>
    </div>
  );
}
