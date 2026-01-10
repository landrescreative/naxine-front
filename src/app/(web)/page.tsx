import type { Metadata } from "next";
import { ProductionGuard } from "@/lib/production-guard";
import HeroSection from "@/components/ui/HeroSection";
import SeparatorSection from "@/components/ui/SeparatorSection";
import ServicesSection from "@/components/ui/ServicesSection";
import HowItWorksSection from "@/components/ui/HowItWorksSection";
import OurProcess from "@/components/ui/OurProcess";
import BenefitsSection from "@/components/ui/BenefitsSection";
import AccesibilitySection from "@/components/ui/AccesibilitySection";
import FAQSection from "@/components/ui/FAQSection";

// Forzar rendering dinámico para que el middleware se ejecute
export const dynamic = "force-dynamic";

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

// Lista estática de servicios con URLs que coinciden con los servicios de la plataforma
const SERVICIOS_DESTACADOS = [
  // Nutrición
  { title: "Pérdida de peso", href: "/nutricion/perdida-de-peso" },
  { title: "Nutrición deportiva", href: "/nutricion/deportiva" },
  {
    title: "TCAs (Trastornos de la conducta alimentaria)",
    href: "/nutricion/tcas-trastornos-de-la-conducta-alimentaria",
  },
  { title: "Embarazo y lactancia", href: "/nutricion/embarazo-y-lactancia" },
  { title: "SIBO y dieta FODMAP", href: "/nutricion/sibo-y-dieta-fodmap" },
  { title: "Nutrición clínica", href: "/nutricion/nutricion-clinica" },
  {
    title: "Alergias e intolerancias",
    href: "/nutricion/alergias-intolerancias",
  },
  { title: "Obesidad", href: "/nutricion/obesidad" },
  // Psicología
  { title: "Depresión", href: "/psicologia/depresion" },
  { title: "Ansiedad", href: "/psicologia/ansiedad" },
  { title: "Baja autoestima", href: "/psicologia/baja-autoestima" },
  { title: "Terapia de pareja", href: "/psicologia/terapia-de-pareja" },
  {
    title: "Duelo: pérdida de un ser querido",
    href: "/psicologia/duelo-perdida-de-un-ser-querido",
  },
  {
    title: "Trauma y TEPT",
    href: "/psicologia/trauma-y-tept-trastorno-de-estres-post-traumatico",
  },
  // Legal
  { title: "Divorcio", href: "/legal/divorcio" },
  { title: "Herencias", href: "/legal/herencias" },
  { title: "Estafas inmobiliarias", href: "/legal/estafas-inmobiliarias" },
  { title: "Nacionalidad española", href: "/legal/nacionalidad-espanola" },
  // Fisioterapia
  {
    title: "Fisioterapia deportiva",
    href: "/fisioterapia/fisioterapia-deportiva",
  },
  {
    title: "Fisioterapia suelo pélvico",
    href: "/fisioterapia/fisioterapia-suelo-pelvico",
  },
  {
    title: "Fisioterapia neurológica",
    href: "/fisioterapia/fisioterapia-neurologica",
  },
  {
    title: "Fisioterapia cervical",
    href: "/fisioterapia/fisioterapia-cervical",
  },
  {
    title: "Rehabilitación general",
    href: "/fisioterapia/rehabilitacion-general",
  },
  // Logopedia
  { title: "Trastornos del habla", href: "/logopedia/trastornos-del-habla" },
  { title: "Trastornos auditivos", href: "/logopedia/trastornos-auditivos" },
  {
    title: "Trastornos del lenguaje",
    href: "/logopedia/trastornos-del-lenguaje",
  },
  // Desarrollo personal
  { title: "Liderazgo", href: "/desarrollo-personal/liderazgo" },
  {
    title: "Habilidades sociales",
    href: "/desarrollo-personal/habilidades-sociales",
  },
  {
    title: "Hablar en público",
    href: "/desarrollo-personal/hablar-en-publico",
  },
];

export default function Home() {
  // Proteger esta ruta en producción (redirige a /proximamente)
  ProductionGuard("/");

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <SeparatorSection
        subtitle="NUESTROS PROFESIONALES TE AYUDARÁN"
        title="SERVICIOS DESTACADOS"
        className=""
      />
      <ServicesSection items={SERVICIOS_DESTACADOS} />
      <SeparatorSection
        subtitle="PROCESO"
        title="¿CÓMO FUNCIONA?"
        className=""
      />
      <HowItWorksSection />
      <OurProcess />
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
