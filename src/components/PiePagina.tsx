/** Pie de página. Componente de servidor (sin "use client"): no tiene interactividad. */
export default function PiePagina() {
  return (
    <footer className="mt-16 border-t border-line py-8 font-mono text-xs text-muted">
      <p>
        Hecho por <strong className="font-normal text-ink">Diego Rivas</strong> · Next.js, React, Tailwind y Llama en Groq
      </p>
    </footer>
  );
}
