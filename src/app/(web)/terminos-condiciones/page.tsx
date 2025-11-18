import type { Metadata } from "next";
import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de NAXINE. Lee las condiciones generales de uso de nuestra plataforma de servicios profesionales.",
  keywords: [
    "términos y condiciones",
    "condiciones de uso",
    "términos de servicio",
    "condiciones generales",
    "uso de la plataforma",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Términos y Condiciones | NAXINE",
    description:
      "Lee las condiciones generales de uso de la plataforma NAXINE.",
    type: "website",
  },
};

async function fetchPolicies() {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
  const res = await fetch(`${base}/paginas-informacion`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener páginas de información`);
  }
  return res.json();
}

export default async function TerminosCondicionesPage() {
  let content = "";
  try {
    const data = await fetchPolicies();
    const item = data?.data || {};
    content = String(item.Terminos_y_condiciones || "");
  } catch (e) {
    content =
      "No se pudieron cargar los Términos y Condiciones en este momento. Inténtalo nuevamente más tarde.";
  }

  return (
    <div className="min-h-screen relative">
      {/* Imagen de fondo con opacidad reducida */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "url('/assets/1d4a61ccf5b36a094b40bc55b9036d8f91e5c8cc.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      ></div>
      <div className="relative z-10">
        <SeparatorSection
          subtitle="Términos y Condiciones de Uso"
          title="Términos y Condiciones"
          className=""
          transparent={true}
        />

        {/* Contenido dinámico */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
