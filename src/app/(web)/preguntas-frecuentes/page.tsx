import FAQSection from "@/components/ui/FAQSection";
import SeparatorSection from "@/components/ui/SeparatorSection";
import React from "react";

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen relative">
      {/* Imagen de fondo con opacidad reducida */}
      <div
        className="absolute inset-0 opacity-60"
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
          subtitle="Preguntas Frecuentes"
          title="Preguntas Frecuentes (FAQs)"
          className=""
          transparent={true}
        />
        <FAQSection />
      </div>
    </div>
  );
}
