import React from "react";
import HowItWorksSection from "@/components/ui/HowItWorksSection";
import SeparatorSection from "@/components/ui/SeparatorSection";

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
