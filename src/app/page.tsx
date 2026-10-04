/**
 * Página principal — SERVER COMPONENT (no tiene "use client").
 *
 * Se ejecuta en el servidor: aquí podemos leer variables de entorno de forma
 * segura. Solo pasamos al cliente un booleano (¿hay IA disponible?), nunca la clave.
 */
import { connection } from "next/server";
import PiePagina from "@/components/PiePagina";
import Validador from "@/components/Validador";

export default async function Pagina() {
  // Esperamos a una petición real para leer el entorno en tiempo de ejecución
  // (y no "congelarlo" durante el build).
  await connection();
  const iaDisponible = Boolean(process.env.GROQ_API_KEY?.trim());

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-10 sm:pt-16">
      <header className="mb-12 border-b border-line pb-10">
        <p className="font-mono text-xs text-muted">Herramienta · análisis con Llama en Groq</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] text-ink sm:text-6xl">
          Validador de ideas de negocio
        </h1>
        <p className="mt-5 max-w-2xl text-muted">
          Describe tu idea y recibe un reporte con el problema, mercado, competidores, punto de equilibrio, riesgos y los
          próximos pasos para validarla gastando poco.
        </p>
      </header>

      <main>
        {/* Pasamos datos del servidor al cliente mediante props */}
        <Validador iaDisponible={iaDisponible} />
      </main>

      <PiePagina />
    </div>
  );
}
