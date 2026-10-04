"use client";
/**
 * Gráfico de punto de equilibrio con recharts.
 *
 * CONCEPTO — "use client": recharts mide el tamaño de la pantalla y usa APIs del
 * navegador, así que este componente debe ejecutarse en el cliente.
 */
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatoMoneda, puntosGrafico, type DatosFinancieros } from "@/lib/equilibrio";

interface Props {
  datos: DatosFinancieros;
  unidadesEquilibrio?: number;
  moneda: string;
}

export default function GraficoEquilibrio({ datos, unidadesEquilibrio, moneda }: Props) {
  const puntos = puntosGrafico(datos, unidadesEquilibrio);
  const compacto = (v: number) =>
    new Intl.NumberFormat("es-PE", { notation: "compact", maximumFractionDigits: 1 }).format(v);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={puntos} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3ddd1" />
          <XAxis dataKey="unidades" tickFormatter={compacto} fontSize={12} label={{ value: "Unidades al mes", position: "insideBottom", offset: -5, fontSize: 12 }} />
          <YAxis tickFormatter={compacto} fontSize={12} width={56} />
          <Tooltip
            formatter={(valor) => formatoMoneda(Number(valor), moneda)}
            labelFormatter={(u) => `${Number(u).toLocaleString("es-PE")} unidades`}
          />
          <Legend verticalAlign="top" height={28} />
          <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#1f1d1a" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="costos" name="Costos totales" stroke="#9a4a32" strokeWidth={2.5} dot={false} />
          {unidadesEquilibrio !== undefined && (
            <ReferenceLine x={unidadesEquilibrio} stroke="#4f5d3a" strokeDasharray="4 4" label={{ value: "Equilibrio", fill: "#4f5d3a", fontSize: 12, position: "insideTopRight" }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
