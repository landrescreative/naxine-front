"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type ServiceItem = {
  title: string;
  href?: string;
};

type ServicesSectionProps = {
  items: ServiceItem[];
  className?: string;
};

// Función para obtener el icono correcto según el servicio
const getIconForService = (serviceName: string): string => {
  const name = serviceName.toLowerCase();

  // Nutrición
  if (
    name.includes("dieta") ||
    name.includes("nutrici") ||
    name.includes("alimenta") ||
    name.includes("fodmap") ||
    name.includes("colesterol") ||
    name.includes("sibo") ||
    name.includes("diabetes") ||
    name.includes("adelgaz") ||
    name.includes("embarazo") ||
    name.includes("lactancia") ||
    name.includes("tca") ||
    name.includes("alergia") ||
    name.includes("intolerancia") ||
    name.includes("peso") ||
    name.includes("obesidad") ||
    name.includes("deportiva") ||
    name.includes("vegano") ||
    name.includes("vegetariano")
  ) {
    return "/assets/iconos/NUTRICION.webp";
  }

  // Legal
  if (
    name.includes("abogad") ||
    name.includes("legal") ||
    name.includes("divorcio") ||
    name.includes("herencia") ||
    name.includes("estafa") ||
    name.includes("inmobiliaria") ||
    name.includes("inmueble") ||
    name.includes("nacionalidad") ||
    name.includes("trámite") ||
    name.includes("defensa") ||
    name.includes("contrato") ||
    name.includes("alquiler") ||
    name.includes("arrendamiento") ||
    name.includes("compraventa") ||
    name.includes("comunidad") ||
    name.includes("propietario") ||
    name.includes("hipoteca") ||
    name.includes("testamento") ||
    name.includes("sucesión") ||
    name.includes("laboral") ||
    name.includes("despido") ||
    name.includes("indemnización")
  ) {
    return "/assets/iconos/LEGAL.webp";
  }

  // Logopedia
  if (
    name.includes("logoped") ||
    name.includes("habla") ||
    name.includes("auditivo") ||
    name.includes("lenguaje") ||
    name.includes("comunicación") ||
    name.includes("tartamud") ||
    name.includes("dislexia") ||
    name.includes("afasia") ||
    name.includes("fonación") ||
    name.includes("voz") ||
    name.includes("deglución")
  ) {
    return "/assets/iconos/LOGOPEDA.webp";
  }

  // Fisioterapia
  if (
    name.includes("fisio") ||
    name.includes("pélvico") ||
    name.includes("cervical") ||
    name.includes("rehabilita") ||
    name.includes("muscular") ||
    name.includes("articular") ||
    name.includes("lumbar") ||
    name.includes("espalda") ||
    name.includes("masaje") ||
    name.includes("osteopatía") ||
    name.includes("traumatolog")
  ) {
    return "/assets/iconos/FISIOTERAPEUTA.webp";
  }

  // Coaching / Desarrollo Personal
  if (
    name.includes("coaching") ||
    name.includes("liderazgo") ||
    name.includes("habilidades sociales") ||
    name.includes("hablar en público") ||
    name.includes("desarrollo personal") ||
    name.includes("motivación") ||
    name.includes("productividad") ||
    name.includes("objetivos") ||
    name.includes("mentoría")
  ) {
    return "/assets/iconos/COACHING_DESARROLLO PERSONAL.webp";
  }

  // Psicología (fallback)
  if (
    name.includes("terapi") ||
    name.includes("psicol") ||
    name.includes("depresi") ||
    name.includes("ansiedad") ||
    name.includes("estrés") ||
    name.includes("crisis") ||
    name.includes("pareja") ||
    name.includes("duelo") ||
    name.includes("autoestima") ||
    name.includes("emocional") ||
    name.includes("fobia") ||
    name.includes("trauma") ||
    name.includes("adicción") ||
    name.includes("obsesivo") ||
    name.includes("bipolar") ||
    name.includes("trastorno")
  ) {
    return "/assets/iconos/PSICOLOGIA.webp";
  }

  // Default fallback
  return "/assets/iconos/PSICOLOGIA.webp";
};

// Componente de tarjeta con icono - Diseño unificado violeta
function ServiceIconCard({
  title,
  href = "#",
  className = "",
}: {
  title: string;
  href?: string;
  className?: string;
}) {
  const icon = getIconForService(title);

  return (
    <article
      className={`group relative flex flex-col items-center justify-between p-5 sm:p-6 rounded-2xl bg-white border border-violet-100 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 overflow-hidden ${className}`}
      aria-label={title}
    >
      {/* Subtle violet gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/0 to-violet-100/0 group-hover:from-violet-50/50 group-hover:to-violet-100/30 transition-all duration-300 rounded-2xl pointer-events-none" />

      {/* Icon container with violet accent */}
      <div className="relative z-10 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/80 border border-violet-100 group-hover:border-violet-200 group-hover:scale-105 transition-all duration-300 pointer-events-none">
        <Image
          src={icon}
          alt=""
          width={48}
          height={48}
          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
        />
      </div>

      {/* Title */}
      <h3 className="relative z-10 text-center text-sm sm:text-base font-semibold text-gray-800 leading-tight mb-4 line-clamp-2 min-h-[2.5rem] group-hover:text-violet-900 transition-colors duration-200 pointer-events-none">
        {title}
      </h3>

      {/* CTA Button - Brand violet */}
      <Link
        href={href}
        className="relative z-20 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
        onClick={(e) => e.stopPropagation()}
      >
        Ver más
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </article>
  );
}

export default function ServicesSection({
  items,
  className = "",
}: ServicesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [numPages, setNumPages] = useState(1);

  const isInView = useInView(sectionRef, {
    once: true,
    margin: "-100px 0px -100px 0px",
  });

  // Calculate number of pages based on content
  useEffect(() => {
    const calculatePages = () => {
      if (!scrollRef.current) return;
      const scrollWidth = scrollRef.current.scrollWidth;
      const clientWidth = scrollRef.current.clientWidth;
      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll <= 0) {
        setNumPages(1);
      } else {
        // Calculate pages based on how many "screens" of content we have
        const pages = Math.ceil(scrollWidth / clientWidth);
        setNumPages(pages);
      }
    };

    calculatePages();
    window.addEventListener("resize", calculatePages);
    return () => window.removeEventListener("resize", calculatePages);
  }, [items.length]);

  // Handle scroll and update progress
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollWidth = scrollRef.current.scrollWidth;
    const clientWidth = scrollRef.current.clientWidth;
    const scrollLeft = scrollRef.current.scrollLeft;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
      setScrollProgress(0);
    } else {
      const progress = scrollLeft / maxScroll;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    }
  }, []);

  // Get active page index based on scroll progress
  const activeIndex = Math.min(
    numPages - 1,
    Math.round(scrollProgress * (numPages - 1))
  );

  // Scroll to specific page
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const scrollWidth = scrollRef.current.scrollWidth;
    const clientWidth = scrollRef.current.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    const targetScroll = (index / (numPages - 1)) * maxScroll;
    scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  // Handle wheel scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      el.scrollTo({
        left: el.scrollLeft + event.deltaY,
        behavior: "auto",
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`w-full pl-2 md:pl-10 py-4 sm:py-6 ${className}`}
    >
      <div className="relative">
        <div
          ref={scrollRef}
          className="overflow-x-auto overscroll-x-contain hide-scrollbar snap-x snap-mandatory scroll-smooth"
          onScroll={handleScroll}
        >
          <div
            ref={gridRef}
            className="grid grid-rows-2 grid-flow-col px-4 sm:px-6 lg:px-8 gap-x-4 gap-y-4 sm:gap-x-5 sm:gap-y-5 md:gap-x-6 md:gap-y-6 auto-cols-[160px] sm:auto-cols-[180px] md:auto-cols-[200px] lg:auto-cols-[220px]"
            role="list"
            aria-label="Servicios"
          >
            {items.map((item, index) => {
              const row = Math.floor(index / 2);
              const col = index % 2;
              const delay = (row * 2 + col) * 0.08;

              return (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{
                    scale: 0.85,
                    opacity: 0,
                    y: 15,
                  }}
                  animate={
                    isInView
                      ? {
                          scale: 1,
                          opacity: 1,
                          y: 0,
                        }
                      : {
                          scale: 0.85,
                          opacity: 0,
                          y: 15,
                        }
                  }
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: delay,
                  }}
                  className="w-full snap-start"
                >
                  <ServiceIconCard
                    title={item.title}
                    href={item.href}
                    className="w-full h-full min-h-[200px] sm:min-h-[220px]"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Indicadores de posición mejorados */}
        {numPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: numPages }).map((_, i) => (
              <button
                key={i}
                aria-label={`Ir a página ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-6 bg-primary"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => scrollToIndex(i)}
              />
            ))}
          </div>
        )}

        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  );
}
