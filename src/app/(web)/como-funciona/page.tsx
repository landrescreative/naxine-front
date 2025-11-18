import type { Metadata } from "next";
import React from "react";
import HowItWorksSection from "@/components/ui/HowItWorksSection";
import SeparatorSection from "@/components/ui/SeparatorSection";

export const metadata: Metadata = {
  title: "Cómo Funciona",
  description:
    "Descubre cómo funciona NAXINE. Proceso simple y transparente para encontrar y contratar servicios profesionales verificados. Desde la búsqueda hasta la cita, te guiamos en cada paso.",
  keywords: [
    "cómo funciona NAXINE",
    "proceso",
    "pasos",
    "cómo reservar cita",
    "cómo contratar servicio",
    "guía de uso",
  ],
  openGraph: {
    title: "Cómo Funciona | NAXINE",
    description:
      "Descubre cómo funciona NAXINE. Proceso simple para encontrar y contratar servicios profesionales verificados.",
    type: "website",
  },
};

export default function ComoFunciona() {
  return (
    <div>
      <SeparatorSection
        subtitle="PROCESO"
        title="¿CÓMO FUNCIONA?"
        className=""
      />
      <HowItWorksSection />
    </div>
  );
}
