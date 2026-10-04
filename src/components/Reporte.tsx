"use client";
/**
 * Reporte completo: puntaje + 8 secciones.
 *
 * CONCEPTO — Composición: este componente arma la pantalla combinando
 * componentes más pequeños (MedidorPuntaje, TarjetaSeccion, PuntoEquilibrio...).
 */
import { useState } from "react";
import type { Analisis, EntradaIdea } from "@/lib/esquemas";
import { combinarDatos } from "@/lib/equilibrio";
import { reporteAMarkdown } from "@/lib/markdown";
import { puntajeGlobal } from "@/lib/puntaje";
import BarrasDimensiones from "./BarrasDimensiones";
import BotonCopiar from "./BotonCopiar";
import MedidorPuntaje from "./MedidorPuntaje";
import PuntoEquilibrio from "./PuntoEquilibrio";
import TarjetaSeccion, { colorNivel, Etiqueta } from "./TarjetaSeccion";

export interface ResultadoReporte {
  entrada: EntradaIdea;
  analisis: Analisis;
  modelo: string;
  esDemo: boolean;
}

export default function Reporte({ resultado }: { resultado: ResultadoReporte }) {
  const { entrada, analisis: a, modelo, esDemo } = resultado;

  // Estado inicial "perezoso": la función solo se ejecuta en el primer render.
  const [financiero, setFinanciero] = useState(() => combinarDatos(entrada, a.estimacionesFinancieras));

  const global = puntajeGlobal(a.puntajes);

  return (
    <div className="space-y-12">
      {/* Resumen y puntajes */}
      <section className="border-t border-ink pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-4xl text-ink">Tu reporte</h2>
            {esDemo ? <Etiqueta color="blue">Modo demo · resultado precalculado</Etiqueta> : <Etiqueta>Modelo: {modelo}</Etiqueta>}
          </div>
          <BotonCopiar obtenerTexto={() => reporteAMarkdown(entrada, a, financiero.datos, financiero.origen)} />
        </div>
        <p className="mb-8 max-w-3xl border-l-2 border-line pl-4 font-serif text-lg italic text-muted">“{entrada.descripcion}”</p>
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="text-center">
            <p className="mb-2 font-mono text-xs text-muted">07 · Puntaje global</p>
            <MedidorPuntaje puntaje={global} />
          </div>
          <div className="space-y-4">
            <p className="text-slate-700">{a.resumen}</p>
            <BarrasDimensiones puntajes={a.puntajes} />
          </div>
        </div>
      </section>

      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
        <TarjetaSeccion numero={1} titulo="Problema y dolor" extra={<Etiqueta color={colorNivel(a.problema.intensidadDolor, true)}>Dolor {a.problema.intensidadDolor}</Etiqueta>}>
          <p>{a.problema.descripcion}</p>
          <p className="text-sm text-slate-500">{a.problema.explicacion}</p>
        </TarjetaSeccion>

        <TarjetaSeccion numero={2} titulo="Mercado" esEstimacion>
          <p><strong>Quién paga:</strong> {a.mercado.quienPaga}</p>
          <p><strong>Tamaño:</strong> {a.mercado.tamanoEstimado}</p>
          <p className="font-medium text-slate-900">Señales de que ya gastan dinero:</p>
          <Lista items={a.mercado.senalesDeGasto} />
        </TarjetaSeccion>

        <TarjetaSeccion numero={3} titulo="Competidores" esEstimacion extra={<Etiqueta color={colorNivel(a.competidores.nivelDominio)}>Dominio {a.competidores.nivelDominio}</Etiqueta>}>
          <ul className="space-y-2">
            {a.competidores.lista.map((c) => (
              <li key={c.nombre} className="border-b border-line pb-2">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900">{c.nombre}</strong>
                  <Etiqueta color={c.tipo === "directo" ? "red" : "slate"}>{c.tipo}</Etiqueta>
                </div>
                <p className="text-sm text-slate-600">{c.nota}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500">{a.competidores.comentario}</p>
        </TarjetaSeccion>

        <TarjetaSeccion numero={4} titulo="Diferenciadores">
          <Lista items={a.diferenciadores} />
        </TarjetaSeccion>
      </div>

      <TarjetaSeccion numero={5} titulo="Punto de equilibrio mensual">
        <PuntoEquilibrio
          datos={financiero.datos}
          origen={financiero.origen}
          moneda={entrada.moneda}
          unidad={a.estimacionesFinancieras.unidad}
          justificacion={a.estimacionesFinancieras.justificacion}
          onCambiar={(datos, origen) => setFinanciero({ datos, origen })}
        />
      </TarjetaSeccion>

      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
        <TarjetaSeccion numero={6} titulo="Riesgos">
          <ul className="space-y-3">
            {a.riesgos.map((r) => (
              <li key={r.riesgo}>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-slate-900">{r.riesgo}</strong>
                  <Etiqueta color={colorNivel(r.severidad)}>{r.severidad}</Etiqueta>
                </div>
                <p className="text-sm text-slate-600">Mitigación: {r.mitigacion}</p>
              </li>
            ))}
          </ul>
        </TarjetaSeccion>

        <TarjetaSeccion numero={8} titulo="Próximos pasos para validar barato">
          <ol className="space-y-3">
            {a.proximosPasos.map((p, i) => (
              <li key={p.paso} className="flex gap-3">
                <span className="w-6 shrink-0 font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-slate-900">{p.paso}</p>
                  <p className="text-sm text-slate-500">{p.costoAproximado} · {p.tiempo}</p>
                </div>
              </li>
            ))}
          </ol>
        </TarjetaSeccion>
      </div>

      <p className="border-t border-line pt-4 text-xs text-muted">
        La información de mercado y competidores es una estimación generada por IA sin acceso a internet. Verifícala antes de tomar decisiones.
      </p>
    </div>
  );
}

function Lista({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}
