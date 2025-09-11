"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { User, FileCheck, Calendar, Video, Star } from "lucide-react";

type Step = {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
};

const IconWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_25px_rgba(74,33,237,0.25)] transition-all duration-200 group-hover:scale-110 group-hover:shadow-[0_14px_34px_rgba(74,33,237,0.35)]">
    {children}
  </div>
);

// Componente individual para cada tarjeta con su propia animación
const AnimatedCard = ({
  step,
  className,
  delay = 0,
}: {
  step: Step;
  className: string;
  delay?: number;
}) => {
  const cardRef = useRef<HTMLElement>(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "-50px 0px -50px 0px",
  });

  return (
    <motion.article
      ref={cardRef}
      className={className}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: delay,
      }}
    >
      {step.icon}
      <h3
        className="mt-4 text-2xl text-secondary"
        style={{ fontWeight: "900 !important" }}
      >
        {step.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-primary-foreground">
        {step.description}
      </p>
    </motion.article>
  );
};

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const steps: Step[] = [
    {
      title: "1. Explora los servicios",
      description: (
        <>
          Encuentra el profesional que necesitas en psicología, nutrición,
          legal, logopedia o desarrollo personal. Filtra por modalidad (online,
          presencial o a domicilio), especialidad, ubicación y disponibilidad.
        </>
      ),
      icon: (
        <IconWrap>
          <User className="h-6 w-6" />
        </IconWrap>
      ),
    },
    {
      title: "2. Consulta los profesionales verificados",
      description: (
        <>
          Accede a la ficha de cada profesional con su experiencia,
          credenciales, opiniones y número de colegiado.
        </>
      ),
      icon: (
        <IconWrap>
          <FileCheck className="h-6 w-6" />
        </IconWrap>
      ),
    },
    {
      title: "3. Reserva tu sesión",
      description: (
        <>
          Elige la fecha, la hora y la modalidad que prefieras. Paga de forma
          segura desde la plataforma.
        </>
      ),
      icon: (
        <IconWrap>
          <Calendar className="h-6 w-6" />
        </IconWrap>
      ),
    },
    {
      title: "4. Recibe tu sesión",
      description: (
        <>
          <span className="font-semibold">Online:</span> Recibirás un enlace
          para conectarte por videollamada segura.
          <br />
          <span className="font-semibold">Presencial:</span> Acude al centro o
          consulta indicada.
          <br />
          <span className="font-semibold">A domicilio:</span> El profesional se
          desplazará a la dirección acordada.
        </>
      ),
      icon: (
        <IconWrap>
          <Video className="h-6 w-6" />
        </IconWrap>
      ),
    },
    {
      title: "5. Valora tu experiencia",
      description: (
        <>
          Después de cada sesión puedes dejar una reseña para ayudar a otros
          usuarios y mejorar la comunidad.
        </>
      ),
      icon: (
        <IconWrap>
          <Star className="h-6 w-6" />
        </IconWrap>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="w-full py-8 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Grid en zig-zag para replicar la composición del mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* 1 */}
          <AnimatedCard
            step={steps[0]}
            className="group order-1 lg:order-1 mx-auto w-full max-w-[460px] lg:max-w-[440px] h-[320px] rounded-2xl bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 flex flex-col items-center justify-center"
          />

          {/* 2 */}
          <AnimatedCard
            step={steps[1]}
            className="group order-2 lg:order-2 mx-auto w-full max-w-[460px] lg:max-w-[440px] h-[320px] rounded-2xl bg-white p-6 text-center shadow-[0_15px_40px_rgba(16,24,40,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,24,40,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 flex flex-col items-center justify-center"
          />

          {/* 3 */}
          <AnimatedCard
            step={steps[2]}
            className="group order-3 lg:order-3 mx-auto w-full max-w-[460px] lg:max-w-[440px] h-[320px] rounded-2xl bg-white p-6 text-center shadow-[0_15px_40px_rgba(16,24,40,0.08)] xl:translate-x-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,24,40,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 flex flex-col items-center justify-center"
          />

          {/* 4 */}
          <AnimatedCard
            step={steps[3]}
            className="group order-4 lg:order-4 mx-auto w-full max-w-[460px] lg:max-w-[440px] h-[320px] rounded-2xl bg-white p-6 text-center xl:-translate-x-8 transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 flex flex-col items-center justify-center"
          />

          {/* 5 (centrado a lo ancho) */}
          <AnimatedCard
            step={steps[4]}
            className="group order-5 lg:col-span-2 mx-auto w-full max-w-[460px] lg:max-w-[440px] h-[320px] rounded-2xl bg-white p-6 text-center shadow-[0_15px_40px_rgba(16,24,40,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,24,40,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 flex flex-col items-center justify-center"
          />
        </div>
      </div>
    </section>
  );
}
