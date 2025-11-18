import type { Metadata } from "next";
import HeroSection from "@/components/ui/HeroSection";
import SeparatorSection from "@/components/ui/SeparatorSection";
import ServicesSection from "@/components/ui/ServicesSection";
import HowItWorksSection from "@/components/ui/HowItWorksSection";
import OurProcess from "@/components/ui/OurProcess";
import NuestrasGarantias from "@/components/ui/NuestrasGarantias";
import BenefitsSection from "@/components/ui/BenefitsSection";
import AccesibilitySection from "@/components/ui/AccesibilitySection";
import FAQSection from "@/components/ui/FAQSection";

// API
import { getServicios } from "@/services/api/servicios";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "NAXINE conecta usuarios con profesionales verificados en salud mental, nutrición, asesoría legal, coaching, logopedia y fisioterapia. Encuentra el profesional perfecto para tu bienestar.",
  keywords: [
    "servicios profesionales",
    "salud mental online",
    "nutrición",
    "terapia online",
    "asesoría legal",
    "coaching personal",
    "logopedia",
    "fisioterapia",
    "profesionales verificados",
    "bienestar integral",
  ],
  openGraph: {
    title: "NAXINE - Plataforma de Servicios Profesionales",
    description:
      "Conecta con profesionales verificados en salud, nutrición, asesoría legal y más. Servicios profesionales éticos, seguros y accesibles.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NAXINE - Plataforma de Servicios Profesionales",
    description:
      "Conecta con profesionales verificados en salud, nutrición, asesoría legal y más.",
  },
};

export default async function Home() {
  // Cargar servicios dinámicamente desde el backend
  const serviciosRes = await getServicios({ soloActivos: true });
  const servicios = serviciosRes.success ? serviciosRes.data || [] : [];

  // Seleccionar imagen según el nombre del servicio usando assets de /public
  const IMAGE_POOL: string[] = [
    "/DIETA PARA ADELGAZAR.png",
    "/DIETA DIABETES.png",
    "/DIETA COLESTEROL_.png",
    "/TERAPIA PARA DEPRESION.png",
    "/TERAPIA DE PAREJA (2).png",
    "/DIVORCIO EXPRESS ONLINE.png",
    "/ASESORIA LEGAL HERENCIAS.png",
    "/FISIOTERAPIA A DOMICILIO.png",
    "/ansiedad.png",
    "/Servicios Desktop.png",
  ];

  const getImageForService = (name: string, index: number): string => {
    const n = name.toLowerCase();
    if (n.includes("ansiedad")) return "/ansiedad.png";
    if (n.includes("depres")) return "/TERAPIA PARA DEPRESION.png";
    if (n.includes("pareja")) return "/TERAPIA DE PAREJA (2).png";
    if (n.includes("divorcio")) return "/DIVORCIO EXPRESS ONLINE.png";
    if (n.includes("herencia")) return "/ASESORIA LEGAL HERENCIAS.png";
    if (n.includes("fisioter")) return "/FISIOTERAPIA A DOMICILIO.png";
    if (n.includes("diabet")) return "/DIETA DIABETES.png";
    if (n.includes("colesterol")) return "/DIETA COLESTEROL_.png";
    if (n.includes("peso") || n.includes("adelgaz")) return "/DIETA PARA ADELGAZAR.png";
    if (n.includes("deport")) return "/DIETA DIABETES.png";
    // Fallback: asignación cíclica desde el pool para que todos tengan imagen
    return IMAGE_POOL[index % IMAGE_POOL.length];
  };

  // Mapear a las tarjetas esperadas por ServicesSection
  const items =
    servicios.map((s, idx) => ({
      title: s.nombre_servicio,
      image: getImageForService(s.nombre_servicio || "", idx),
      // Enlace genérico por ahora; se puede ajustar a una ruta específica en el futuro
      href: "/servicios",
    })) || [];

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <SeparatorSection
        subtitle="NUESTROS PROFESIONALES TE AYUDARÁN"
        title="SERVICIOS DESTACADOS"
        className=""
      />
      <ServicesSection items={items} />
      <SeparatorSection
        subtitle="PROCESO"
        title="¿CÓMO FUNCIONA?"
        className=""
      />
      <HowItWorksSection />
      <OurProcess />
      <NuestrasGarantias />
      <BenefitsSection />
      <AccesibilitySection />
      <SeparatorSection
        subtitle="Preguntas Frecuentes"
        title="Preguntas Frecuentes (FAQs)"
        className=""
      />
      <FAQSection />
    </div>
  );
}
