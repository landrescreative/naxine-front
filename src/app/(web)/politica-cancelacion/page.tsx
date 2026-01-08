import type { Metadata } from "next";
import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export const metadata: Metadata = {
  title: "Política de Cancelación",
  description:
    "Política de cancelación y reembolso de NAXINE. Conoce las condiciones para cancelar citas, plazos de cancelación y políticas de reembolso.",
  keywords: [
    "política de cancelación",
    "cancelar cita",
    "reembolso",
    "política de reembolso",
    "cancelación de servicios",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Política de Cancelación | NAXINE",
    description:
      "Conoce las condiciones para cancelar citas y políticas de reembolso en NAXINE.",
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

export default async function PoliticaCancelacionPage() {
  let content = "";
  try {
    const data = await fetchPolicies();
    const item = data?.data || {};
    content = String(item.politicas_de_cancelacion || "");
  } catch (e) {
    content =
      "No se pudo cargar la Política de Cancelación en este momento. Inténtalo nuevamente más tarde.";
  }

  return (
    <main className="min-h-screen relative" aria-labelledby="cancellation-title">
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
        aria-hidden="true"
      ></div>
      <div className="relative z-10">
        <SeparatorSection
          subtitle="Política de Cancelación y Reembolso"
          title="Política de Cancelación"
          className=""
          transparent={true}
        />

        {/* Contenido dinámico */}
        <article className="max-w-4xl mx-auto px-4 py-8">
          <h1 id="cancellation-title" className="sr-only">Política de Cancelación de NAXINE</h1>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {content}
          </div>
        </article>
      </div>
    </main>
  );
}
