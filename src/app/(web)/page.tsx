import HeroSection from "@/components/ui/HeroSection";
import SeparatorSection from "@/components/ui/SeparatorSection";
import ServicesSection from "@/components/ui/ServicesSection";
import HowItWorksSection from "@/components/ui/HowItWorksSection";
import OurProcess from "@/components/ui/OurProcess";
import NuestrasGarantias from "@/components/ui/NuestrasGarantias";
import BenefitsSection from "@/components/ui/BenefitsSection";
import AccesibilitySection from "@/components/ui/AccesibilitySection";
import FAQSection from "@/components/ui/FAQSection";

// Import service images
import ansiedad from "@/assets/ansiedad.png";

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <SeparatorSection
        subtitle="NUESTROS PROFESIONALES TE AYUDARÁN"
        title="SERVICIOS DESTACADOS"
        className=""
      />
      <ServicesSection
        items={[
          {
            title: "Pérdida de peso",
            image: "/DIETA PARA ADELGAZAR.png",
            href: "/dietas/perdida-de-peso",
          },
          {
            title: "Nutrición deportiva",
            image: "/DIETA DIABETES.png",
            href: "/dietas/deportiva",
          },
          {
            title: "Vegetarianos y veganos",
            image: "/DIETA COLESTEROL_.png",
            href: "/dietas/vegetarianos-y-veganos",
          },
          {
            title: "Depresión",
            image: "/TERAPIA PARA DEPRESION.png",
            href: "/terapias/depresion",
          },
          { title: "Ansiedad", image: ansiedad, href: "/terapias/ansiedad" },
          {
            title: "Divorcio",
            image: "/DIVORCIO EXPRESS ONLINE.png",
            href: "/consultas-legales/divorcio",
          },
          {
            title: "Herencias",
            image: "/ASESORIA LEGAL HERENCIAS.png",
            href: "/consultas-legales/herencias",
          },
          {
            title: "Trastornos del habla",
            image: "/FISIOTERAPIA A DOMICILIO.png",
            href: "/logopedas/trastornos-del-habla",
          },
          {
            title: "Liderazgo",
            image: "/TERAPIA DE PAREJA (2).png",
            href: "/desarrollo-personal/liderazgo",
          },
          {
            title: "Habilidades sociales",
            image: "/TERAPIA DE PAREJA (2).png",
            href: "/desarrollo-personal/habilidades-sociales",
          },
        ]}
      />
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
