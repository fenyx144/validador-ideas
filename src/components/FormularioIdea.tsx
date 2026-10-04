"use client";
/**
 * Formulario "controlado": el valor de cada input viene de las props
 * (`valores`) y cada cambio se avisa al padre con `onCambiar`.
 * Así el padre (Validador) puede, por ejemplo, rellenarlo con un ejemplo demo.
 */
import { MONEDAS } from "@/lib/esquemas";

/** En el formulario todo es texto; se convierte a número en el servidor (zod). */
export interface ValoresFormulario {
  descripcion: string;
  pais: string;
  ciudad: string;
  clienteObjetivo: string;
  moneda: (typeof MONEDAS)[number];
  precio: string;
  costosFijosMensuales: string;
  costoVariableUnitario: string;
}

export const FORMULARIO_VACIO: ValoresFormulario = {
  descripcion: "",
  pais: "",
  ciudad: "",
  clienteObjetivo: "",
  moneda: "PEN",
  precio: "",
  costosFijosMensuales: "",
  costoVariableUnitario: "",
};

interface Props {
  valores: ValoresFormulario;
  onCambiar: (valores: ValoresFormulario) => void;
  onEnviar: () => void;
  cargando: boolean;
}

export default function FormularioIdea({ valores, onCambiar, onEnviar, cargando }: Props) {
  // Función auxiliar: devuelve un manejador onChange para el campo indicado.
  const cambiar =
    (campo: keyof ValoresFormulario) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onCambiar({ ...valores, [campo]: e.target.value }); // copiamos: el estado nunca se muta

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // evita que el navegador recargue la página
        onEnviar();
      }}
      className="space-y-5"
    >
      <label className="block">
        <span className="etiqueta">Describe tu idea de negocio *</span>
        <textarea
          required
          minLength={20}
          maxLength={2000}
          rows={4}
          value={valores.descripcion}
          onChange={cambiar("descripcion")}
          placeholder="Ej.: Un servicio de lavandería por suscripción para estudiantes, con recojo y entrega en la residencia..."
          className="campo resize-y"
        />
        <span className="mt-1 block text-right text-xs text-slate-400">{valores.descripcion.length}/2000</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="País" valor={valores.pais} onChange={cambiar("pais")} placeholder="Perú" />
        <Campo etiqueta="Ciudad" valor={valores.ciudad} onChange={cambiar("ciudad")} placeholder="Lima" />
      </div>
      <Campo etiqueta="Cliente objetivo" valor={valores.clienteObjetivo} onChange={cambiar("clienteObjetivo")} placeholder="Ej.: universitarios de 18 a 25 años que viven solos" />

      <fieldset className="border-t border-line pt-4">
        <legend className="pr-2 font-mono text-xs text-muted">Números (opcionales)</legend>
        <p className="mb-3 text-xs text-slate-500">Si los dejas vacíos, la IA propondrá estimaciones que podrás editar.</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block">
            <span className="etiqueta">Moneda</span>
            <select value={valores.moneda} onChange={cambiar("moneda")} className="campo">
              {MONEDAS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <Campo etiqueta="Precio por unidad" tipo="number" valor={valores.precio} onChange={cambiar("precio")} />
          <Campo etiqueta="Costos fijos / mes" tipo="number" valor={valores.costosFijosMensuales} onChange={cambiar("costosFijosMensuales")} />
          <Campo etiqueta="Costo variable / unidad" tipo="number" valor={valores.costoVariableUnitario} onChange={cambiar("costoVariableUnitario")} />
        </div>
      </fieldset>

      <button type="submit" disabled={cargando} className="boton-primario w-full">
        {cargando ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Analizando tu idea...
          </>
        ) : (
          "Validar mi idea"
        )}
      </button>
    </form>
  );
}

interface PropsCampo {
  etiqueta: string;
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  tipo?: "text" | "number";
}

function Campo({ etiqueta, valor, onChange, placeholder, tipo = "text" }: PropsCampo) {
  return (
    <label className="block">
      <span className="etiqueta">{etiqueta}</span>
      <input
        type={tipo}
        min={tipo === "number" ? 0 : undefined}
        step={tipo === "number" ? "any" : undefined}
        inputMode={tipo === "number" ? "decimal" : undefined}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        className="campo"
      />
    </label>
  );
}
