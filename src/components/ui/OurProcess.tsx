import React from "react";
import { ArrowRight } from "lucide-react";

const OurProcess = () => {
  const processSteps = [
    {
      number: 1,
      title: "Garantía de profesionales colegiados",
      description:
        "Todos nuestros profesionales están colegiados y verificados, garantizando servicios cualificados, éticos y avalados por instituciones oficiales.",
      isFilled: true,
    },
    {
      number: 2,
      title: "Comprometidos con la satisfacción de nuestros clientes",
      description:
        "Tu satisfacción es nuestra prioridad. Si no estas conforme, ofrecemos garantía de reembolso según nuestras condiciones.",
      isFilled: false,
    },
    {
      number: 3,
      title: "Pago seguro y protección de tus datos",
      description:
        "Tus pagos se procesan de forma segura con Stripe y tus datos estan protegidos según el RGPD, la normativa europea de privacidad y protección personal.",
      isFilled: false,
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
          {processSteps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center text-center max-w-sm">
                {/* Number Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    step.isFilled
                      ? "bg-primary text-white"
                      : "border-2 border-primary text-primary bg-white"
                  }`}
                >
                  <span className="text-lg font-bold">{step.number}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-primary mb-3 leading-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-primary/70 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow Separator */}
              {index < processSteps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-primary/40">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurProcess;
