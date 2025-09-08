import HeroSection from "@/components/ui/HeroSection";
import SeparatorSection from "@/components/ui/SeparatorSection";
import ServicesSection from "@/components/ui/ServicesSection";
import HowItWorksSection from "@/components/ui/HowItWorksSection";
import nutricion from "@/assets/ca48d68e7670363c5191583082e186b99cc6ab67.jpg";
import OurProcess from "@/components/ui/OurProcess";
import NuestrasGarantias from "@/components/ui/NuestrasGarantias";
import BenefitsSection from "@/components/ui/BenefitsSection";
import AccesibilitySection from "@/components/ui/AccesibilitySection";
import FAQSection from "@/components/ui/FAQSection";

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
            image: nutricion,
            href: "/dietas/perdida-de-peso",
          },
          {
            title: "Nutrición deportiva",
            image: nutricion,
            href: "/dietas/deportiva",
          },
          {
            title: "Vegetarianos y veganos",
            image: nutricion,
            href: "/dietas/vegetarianos-y-veganos",
          },
          { title: "Depresión", image: nutricion, href: "/terapias/depresion" },
          { title: "Ansiedad", image: nutricion, href: "/terapias/ansiedad" },
          {
            title: "Divorcio",
            image: nutricion,
            href: "/consultas-legales/divorcio",
          },
          {
            title: "Herencias",
            image: nutricion,
            href: "/consultas-legales/herencias",
          },
          {
            title: "Trastornos del habla",
            image: nutricion,
            href: "/logopedas/trastornos-del-habla",
          },
          {
            title: "Liderazgo",
            image: nutricion,
            href: "/desarrollo-personal/liderazgo",
          },
          {
            title: "Habilidades sociales",
            image: nutricion,
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
