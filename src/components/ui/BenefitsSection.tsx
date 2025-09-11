"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserCog, Type, Keyboard, BookOpen, Volume2 } from "lucide-react";
import accessibility from "@/assets/accesibility-icon.png";
import Image from "next/image";

export default function BenefitsSection() {
  const headerRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);

  const isHeaderInView = useInView(headerRef, {
    once: true,
    margin: "-100px 0px -100px 0px",
  });

  const isFeaturesInView = useInView(featuresRef, {
    once: true,
    margin: "-100px 0px -100px 0px",
  });

  const accessibilityFeatures = [
    {
      id: 1,
      title: "PERFIL DE ACCESIBILIDAD",
      description:
        "Permite a cada usuario adaptar la experiencia de navegación a sus necesidades específicas (visión reducida, dislexia, discapacidad motora, daltonismo, TDAH, etc.).",
      icon: <UserCog className="w-10 h-10" />,
    },
    {
      id: 2,
      title: "TAMAÑO DE TEXTO AJUSTABLE",
      description:
        "El usuario puede aumentar o reducir el tamaño del texto en toda la plataforma.",
      icon: (
        <div className="flex items-center justify-center">
          <span className="text-3xl font-bold">A</span>
          <span className="text-xl font-normal ml-1">a</span>
        </div>
      ),
    },
    {
      id: 3,
      title: "NAVEGACIÓN POR TECLADO",
      description:
        "La plataforma se puede recorrer por completo usando solo el teclado, sin necesidad de ratón.",
      icon: <Keyboard className="w-10 h-10" />,
    },
    {
      id: 4,
      title: "FUENTE LEGIBLE PARA DISLEXIA",
      description:
        "Activa una tipografía especializada que facilita la lectura a personas con dislexia.",
      icon: <BookOpen className="w-10 h-10" />,
    },
    {
      id: 5,
      title: "LECTURA DE PÁGINA EN VOZ ALTA",
      description:
        "El sistema puede leer en voz alta todo el contenido textual de la página.",
      icon: <Volume2 className="w-8 h-8" />,
    },
  ];

  return (
    <div className="w-full">
      {/* Header Section - Outside the purple background */}
      <section
        ref={headerRef}
        className="relative w-full py-16 px-4 sm:px-6 md:px-10 lg:px-[80px] bg-white"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.p
            className="text-primary text-sm font-medium uppercase tracking-wider mb-2"
            initial={{ y: 30, opacity: 0 }}
            animate={
              isHeaderInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
            }
            transition={{
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.1,
            }}
          >
            ACCESIBILIDAD
          </motion.p>
          <motion.div
            className="flex items-center justify-center gap-4 mb-4"
            initial={{ y: 40, opacity: 0 }}
            animate={
              isHeaderInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }
            }
            transition={{
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.2,
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Herramienta de Accesibilidad
            </h2>
            <motion.div
              className="w-12 h-12 opacity-50 rounded-full flex items-center justify-center"
              initial={{ y: 40, opacity: 0 }}
              animate={
                isHeaderInView ? { y: 0, opacity: 0.5 } : { y: 40, opacity: 0 }
              }
              transition={{
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.3,
              }}
            >
              <Image
                src={accessibility}
                alt="Accessibility"
                width={48}
                height={48}
              />
            </motion.div>
          </motion.div>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={
              isHeaderInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
            }
            transition={{
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.4,
            }}
          >
            Nuestra plataforma incluye herramientas de accesibilidad para
            garantizar una experiencia inclusiva, adaptada a todas las personas,
            sin barreras digitales.
          </motion.p>
        </div>
      </section>

      {/* Features Section - Inside the light purple background */}
      <section
        ref={featuresRef}
        className="relative w-full py-24 px-4 sm:px-6 md:px-10 lg:px-[80px] overflow-hidden"
        style={{ backgroundColor: "#E3DCFF" }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 opacity-10">
          <div className="w-full h-full bg-purple-300 rounded-lg"></div>
        </div>

        <div className="absolute top-20 right-20 w-40 h-40 opacity-10 transform translate-x-12 -translate-y-12">
          <div className="w-full h-full bg-purple-300 rounded-full"></div>
        </div>

        <div className="absolute bottom-20 right-20 w-32 h-20 opacity-10 transform translate-x-16 translate-y-8">
          <div className="w-full h-full bg-purple-300 rounded-lg"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* First two cards - full width on desktop */}
            {accessibilityFeatures.slice(0, 2).map((feature, index) => (
              <motion.div
                key={feature.id}
                className="bg-white rounded-xl px-6 py-10"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={
                  isFeaturesInView
                    ? { scale: 1, opacity: 1 }
                    : { scale: 1.1, opacity: 0 }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: index * 0.2, // Delay escalonado: 0s, 0.2s
                }}
              >
                <div className="text-left">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.id}. {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second row - three cards with equal width */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {accessibilityFeatures.slice(2).map((feature, index) => (
              <motion.div
                key={feature.id}
                className="bg-white rounded-xl px-6 py-10"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={
                  isFeaturesInView
                    ? { scale: 1, opacity: 1 }
                    : { scale: 1.1, opacity: 0 }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: (index + 2) * 0.2, // Delay escalonado: 0.4s, 0.6s, 0.8s
                }}
              >
                <div className="text-left">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.id}. {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
