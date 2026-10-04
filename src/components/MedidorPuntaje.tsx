/**
 * Medidor semicircular (gauge) hecho con SVG puro, sin librerías.
 * Truco: `pathLength={100}` hace que el arco "mida" 100, así el puntaje
 * (0-100) se usa directamente como longitud del trazo.
 */
import { etiquetaPuntaje } from "@/lib/puntaje";

export default function MedidorPuntaje({ puntaje }: { puntaje: number }) {
  const { texto, color } = etiquetaPuntaje(puntaje);
  const arco = "M 20 110 A 90 90 0 0 1 200 110";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 125" className="w-56 sm:w-64" role="img" aria-label={`Puntaje ${puntaje} de 100`}>
        <path d={arco} fill="none" stroke="#e3ddd1" strokeWidth={18} strokeLinecap="butt" />
        <path
          d={arco}
          fill="none"
          stroke={color}
          strokeWidth={18}
          strokeLinecap="butt"
          pathLength={100}
          strokeDasharray={`${puntaje} 100`}
          className="transition-all duration-700"
        />
        <text x="110" y="95" textAnchor="middle" className="fill-ink font-serif text-5xl">
          {puntaje}
        </text>
        <text x="110" y="118" textAnchor="middle" className="fill-slate-400 text-xs">
          de 100
        </text>
      </svg>
      <span className="mt-1 font-mono text-sm" style={{ color }}>
        {texto}
      </span>
    </div>
  );
}
