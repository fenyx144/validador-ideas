"use client";
/**
 * Botón que copia texto al portapapeles.
 * CONCEPTO — useState: guarda un valor que, al cambiar, vuelve a dibujar
 * (re-renderizar) el componente. Aquí lo usamos para mostrar "¡Copiado!".
 */
import { useState } from "react";

export default function BotonCopiar({ obtenerTexto }: { obtenerTexto: () => string }) {
  const [estado, setEstado] = useState<"normal" | "copiado" | "error">("normal");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(obtenerTexto());
      setEstado("copiado");
    } catch {
      setEstado("error");
    }
    setTimeout(() => setEstado("normal"), 2000);
  }

  return (
    <button type="button" onClick={copiar} className="boton-secundario">
      {estado === "copiado" ? "Copiado" : estado === "error" ? "No se pudo copiar" : "Copiar reporte (Markdown)"}
    </button>
  );
}
