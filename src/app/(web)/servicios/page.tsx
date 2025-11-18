import type { Metadata } from "next";
import PurpleSection from "@/components/ui/PurpleSection";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Explora todos los servicios profesionales disponibles en NAXINE. Encuentra profesionales verificados en salud mental, nutrición, asesoría legal, coaching, logopedia y fisioterapia.",
  keywords: [
    "servicios profesionales",
    "categorías de servicios",
    "buscar profesional",
    "servicios de salud",
    "servicios legales",
    "servicios de bienestar",
  ],
  openGraph: {
    title: "Servicios | NAXINE",
    description:
      "Explora todos los servicios profesionales disponibles en NAXINE. Encuentra el profesional perfecto para ti.",
    type: "website",
  },
};

export default function ServiciosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PurpleSection
        title="Explora, elige y contrata al profesional colegiado ideal para ti"
        subtitle="Encuentra al profesional indicado para ti."
        searchPlaceholder="Selecciona una categoría o servicio específico"
      />
    </div>
  );
}
