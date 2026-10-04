/** Barras horizontales con el puntaje de cada dimensión. */
import type { Analisis, Dimension } from "@/lib/esquemas";
import { etiquetaPuntaje, NOMBRES_DIMENSION, PESOS } from "@/lib/puntaje";

export default function BarrasDimensiones({ puntajes }: { puntajes: Analisis["puntajes"] }) {
  // Object.keys pierde el tipo; lo recuperamos con "as".
  const dimensiones = Object.keys(PESOS) as Dimension[];

  return (
    <ul className="w-full space-y-3">
      {/* CONCEPTO — Listas: al renderizar un array con .map, cada elemento
          necesita una `key` única para que React sepa cuál cambió. */}
      {dimensiones.map((d) => {
        const valor = puntajes[d];
        return (
          <li key={d}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-700">
                {NOMBRES_DIMENSION[d]} <span className="text-slate-400">· peso {PESOS[d] * 100}%</span>
              </span>
              <span className="font-semibold text-slate-900">{valor}</span>
            </div>
            <div className="h-1 overflow-hidden bg-line">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${valor}%`, backgroundColor: etiquetaPuntaje(valor).color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
