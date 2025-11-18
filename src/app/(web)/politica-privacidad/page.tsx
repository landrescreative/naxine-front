import type { Metadata } from "next";
import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de NAXINE. Conoce cómo protegemos y gestionamos tus datos personales. Comprometidos con la seguridad y privacidad de nuestros usuarios.",
  keywords: [
    "política de privacidad",
    "privacidad",
    "protección de datos",
    "RGPD",
    "datos personales",
    "seguridad",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Política de Privacidad | NAXINE",
    description:
      "Conoce cómo protegemos y gestionamos tus datos personales en NAXINE.",
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

export default async function PoliticasPrivacidadPage() {
  let content = "";
  let subtitle = "Política de Privacidad";
  try {
    const data = await fetchPolicies();
    const item = data?.data || {};
    content = String(item.politicas_de_privacidad || "");
    if (item?.fecha_actualizacion) {
      subtitle = `Última actualización: ${item.fecha_actualizacion}`;
    }
  } catch (e) {
    content =
      "No se pudo cargar la Política de Privacidad en este momento. Inténtalo nuevamente más tarde.";
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
          subtitle={subtitle}
          title="Política de Privacidad"
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
