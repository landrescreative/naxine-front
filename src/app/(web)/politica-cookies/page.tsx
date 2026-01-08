import type { Metadata } from "next";
import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Política de cookies de NAXINE. Información sobre el uso de cookies en nuestra plataforma, tipos de cookies utilizadas y cómo gestionarlas.",
  keywords: [
    "política de cookies",
    "cookies",
    "privacidad",
    "tecnologías de seguimiento",
    "preferencias de cookies",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Política de Cookies | NAXINE",
    description:
      "Información sobre el uso de cookies en NAXINE y cómo gestionarlas.",
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

export default async function PoliticaCookiesPage() {
  let content = "";
  try {
    const data = await fetchPolicies();
    const item = data?.data || {};
    content = String(item.politicas_de_cookies || "");
  } catch (e) {
    content =
      "No se pudo cargar la Política de Cookies en este momento. Inténtalo nuevamente más tarde.";
  }

  return (
    <main className="min-h-screen relative" aria-labelledby="cookies-title">
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
          subtitle="Política de Cookies"
          title="Política de Cookies"
          className=""
          transparent={true}
        />

        {/* Contenido dinámico */}
        <article className="max-w-4xl mx-auto px-4 py-8">
          <h1 id="cookies-title" className="sr-only">Política de Cookies de NAXINE</h1>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {content}
          </div>
        </article>
      </div>
    </main>
  );
}
