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
          { title: "Dieta para adelgazar", image: nutricion },
          { title: "Dieta para diabetes", image: nutricion },
          { title: "Dieta para colesterol", image: nutricion },
          { title: "Terapia para depresión", image: nutricion },
          { title: "Divorcio exprés", image: nutricion },
          { title: "Asesoría legal para herencias", image: nutricion },
          { title: "Fisioterapia a domicilio", image: nutricion },
          { title: "Nutrición deportiva", image: nutricion },
          { title: "Arquitectura de interiores", image: nutricion },
          { title: "Contabilidad fiscal", image: nutricion },
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
