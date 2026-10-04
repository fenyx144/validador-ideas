/**
 * Tarjeta genérica para cada sección del reporte.
 *
 * CONCEPTO — Componentes y props: un componente es una función que recibe
 * "props" (sus parámetros) y devuelve JSX. `children` es una prop especial:
 * es lo que pones ENTRE las etiquetas <TarjetaSeccion>...</TarjetaSeccion>.
 *
 * Este archivo no usa estado ni eventos, así que no necesita "use client":
 * funciona igual dentro de componentes de servidor o de cliente.
 */
import type { ReactNode } from "react";

interface Props {
  numero: number;
  titulo: string;
  esEstimacion?: boolean; // muestra la etiqueta "Estimación IA"
  extra?: ReactNode; // contenido opcional a la derecha del título
  children: ReactNode;
}

export default function TarjetaSeccion({ numero, titulo, esEstimacion, extra, children }: Props) {
  return (
    <section className="border-t border-ink pt-5">
      <header className="mb-4 flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-xs text-muted">{String(numero).padStart(2, "0")}</span>
        <h3 className="font-serif text-2xl text-ink">{titulo}</h3>
        {esEstimacion && <Etiqueta color="amber">Estimación IA · no verificado</Etiqueta>}
        {extra && <div className="ml-auto">{extra}</div>}
      </header>
      <div className="space-y-3 text-ink/85">{children}</div>
    </section>
  );
}

const COLORES = {
  amber: "text-ochre",
  green: "text-accent",
  red: "text-danger",
  blue: "text-accent",
  slate: "text-muted",
} as const;

export type ColorEtiqueta = keyof typeof COLORES;

/** Etiqueta discreta (texto mono, sin pastilla). Otro componente reutilizable. */
export function Etiqueta({ color = "slate", children }: { color?: ColorEtiqueta; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center font-mono text-xs ${COLORES[color]}`}>
      {children}
    </span>
  );
}

/** Traduce bajo/medio/alto a un color. `invertir` = cuando "alto" es bueno. */
export function colorNivel(nivel: "bajo" | "medio" | "alto", invertir = false): ColorEtiqueta {
  const mapa: Record<string, ColorEtiqueta> = { bajo: "green", medio: "amber", alto: "red" };
  const invertido: Record<string, ColorEtiqueta> = { bajo: "red", medio: "amber", alto: "green" };
  return (invertir ? invertido : mapa)[nivel];
}
