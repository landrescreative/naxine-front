"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronRight } from "lucide-react";

const OurProcess = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "-100px 0px -100px 0px",
  });

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
    <section ref={sectionRef} className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-4">
          {processSteps.map((step, index) => (
            <React.Fragment key={step.number}>
              <motion.div
                className="flex items-start gap-4 max-w-sm"
                initial={{ y: 50, opacity: 0 }}
                animate={
                  isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }
                }
                transition={{
                  duration: 0.7,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: index * 0.2, // Delay escalonado: 0s, 0.2s, 0.4s
                }}
              >
                {/* Number Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.isFilled
                      ? "bg-primary text-white"
                      : "border-2 border-primary text-primary bg-white"
                  }`}
                >
                  <span className="text-lg font-bold">{step.number}</span>
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-secondary mb-3 leading-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-primary/70 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Arrow Separator */}
              {index < processSteps.length - 1 && (
                <motion.div
                  className="hidden lg:flex items-center justify-center text-primary/40"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: index * 0.2 + 0.3, // Aparece después de la tarjeta
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurProcess;
