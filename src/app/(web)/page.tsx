import HeroSection from "@/components/ui/HeroSection";
import SeparatorSection from "@/components/ui/SeparatorSection";
import ServicesSection from "@/components/ui/ServicesSection";
import HowItWorksSection from "@/components/ui/HowItWorksSection";
import nutricion from "@/assets/ca48d68e7670363c5191583082e186b99cc6ab67.jpg";

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
    </div>
  );
}
