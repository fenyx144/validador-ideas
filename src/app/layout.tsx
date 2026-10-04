/**
 * Layout raíz: envuelve TODAS las páginas. Es un Server Component.
 * Aquí se definen el <html>, la fuente y los metadatos (título, descripción).
 */
import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Serif editorial para los titulares (en caja normal, sin mayúsculas forzadas).
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Validador de ideas de negocio con IA · Diego Rivas",
  description:
    "Describe tu idea de negocio y obtén un análisis de problema, mercado, competidores, punto de equilibrio, riesgos y próximos pasos.",
};

export const viewport: Viewport = { themeColor: "#f4f1ea" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geist.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
