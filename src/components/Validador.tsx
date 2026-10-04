"use client";
/**
 * Componente principal de la app (lado CLIENTE).
 *
 * CONCEPTO — Server vs Client:
 *  - page.tsx es un Server Component: se ejecuta en el servidor y envía HTML.
 *  - Este archivo empieza con "use client": se ejecuta en el navegador,
 *    por eso puede usar estado (useState), efectos (useEffect) y eventos (onClick).
 *  - Para hablar con la IA NO llamamos a Groq desde aquí (expondría la clave):
 *    hacemos fetch a nuestra propia ruta de servidor /api/validar.
 */
import { useEffect, useRef, useState } from "react";
import type { EntradaIdea, RespuestaValidar } from "@/lib/esquemas";
import { EJEMPLOS_DEMO, type EjemploDemo } from "@/lib/demos";
import FormularioIdea, { FORMULARIO_VACIO, type ValoresFormulario } from "./FormularioIdea";
import Reporte, { type ResultadoReporte } from "./Reporte";

interface Props {
  iaDisponible: boolean; // lo calcula el servidor (page.tsx) y nos llega como prop
}

export default function Validador({ iaDisponible }: Props) {
  // CONCEPTO — Hooks de estado. Cada useState devuelve [valor, función para cambiarlo].
  const [valores, setValores] = useState<ValoresFormulario>(FORMULARIO_VACIO);
  const [resultado, setResultado] = useState<ResultadoReporte | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idReporte, setIdReporte] = useState(0); // para "reiniciar" el reporte (ver key abajo)

  // CONCEPTO — useRef: referencia a un elemento del DOM que no provoca re-render.
  const refReporte = useRef<HTMLDivElement>(null);

  // CONCEPTO — useEffect: código que se ejecuta DESPUÉS de renderizar,
  // cuando cambia alguna dependencia. Aquí: desplazarnos al nuevo reporte.
  useEffect(() => {
    if (resultado) refReporte.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [resultado]);

  function mostrar(r: ResultadoReporte) {
    setResultado(r);
    setIdReporte((n) => n + 1);
  }

  function cargarEjemplo(ej: EjemploDemo) {
    setError(null);
    setValores(aFormulario(ej.entrada));
    mostrar({ entrada: ej.entrada, analisis: ej.analisis, modelo: "demo", esDemo: true });
  }

  async function validar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });
      const datos = (await res.json()) as RespuestaValidar;
      if (datos.ok) {
        mostrar({ entrada: datos.entrada, analisis: datos.analisis, modelo: datos.modelo, esDemo: false });
      } else {
        setError(datos.error);
      }
    } catch {
      setError("No se pudo conectar con el servidor. Revisa tu conexión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {!iaDisponible && (
            <p className="mb-6 border-l-2 border-accent pl-4 text-sm text-muted">
              <strong className="font-medium text-ink">Modo demo:</strong> este sitio no tiene configurada una clave de IA. Prueba los ejemplos de la derecha
              para ver un reporte completo.
            </p>
          )}
          <FormularioIdea valores={valores} onCambiar={setValores} onEnviar={validar} cargando={cargando} />
          {error && (
            <p role="alert" className="mt-4 border-l-2 border-danger pl-4 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <aside className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h2 className="font-serif text-2xl text-ink">Ejemplos</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Ejemplos con resultados precalculados. Funcionan sin clave de API.</p>
          <div className="divide-y divide-line border-y border-line">
            {EJEMPLOS_DEMO.map((ej) => (
              <button
                key={ej.id}
                type="button"
                onClick={() => cargarEjemplo(ej)}
                className="group flex w-full items-baseline justify-between gap-3 py-3 text-left"
              >
                <span>
                  <span className="block text-ink underline-offset-4 group-hover:underline">{ej.titulo}</span>
                  <span className="block font-mono text-xs text-muted">{[ej.entrada.ciudad, ej.entrada.pais].filter(Boolean).join(", ")}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div ref={refReporte} className="scroll-mt-6">
        {/* CONCEPTO — key: al cambiar la key, React desmonta y vuelve a montar
            el componente, reiniciando su estado interno (los números editados). */}
        {resultado && <Reporte key={idReporte} resultado={resultado} />}
      </div>
    </div>
  );
}

/** Convierte una entrada (números) a valores de formulario (texto). */
function aFormulario(e: EntradaIdea): ValoresFormulario {
  const txt = (n?: number) => (n === undefined ? "" : String(n));
  return {
    descripcion: e.descripcion,
    pais: e.pais,
    ciudad: e.ciudad,
    clienteObjetivo: e.clienteObjetivo,
    moneda: e.moneda,
    precio: txt(e.precio),
    costosFijosMensuales: txt(e.costosFijosMensuales),
    costoVariableUnitario: txt(e.costoVariableUnitario),
  };
}
