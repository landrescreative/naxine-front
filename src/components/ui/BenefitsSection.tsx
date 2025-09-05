"use client";
import React from "react";
import { Settings, Type, Grid3X3, BookOpen, Volume2 } from "lucide-react";
import accessibility from "@/assets/accesibility-icon.png";
import Image from "next/image";

export default function BenefitsSection() {
  const accessibilityFeatures = [
    {
      id: 1,
      title: "PERFIL DE ACCESIBILIDAD",
      description:
        "Permite a cada usuario adaptar la experiencia de navegación a sus necesidades específicas (visión reducida, dislexia, discapacidad motora, daltonismo, TDAH, etc.).",
      icon: <Settings className="w-8 h-8" />,
    },
    {
      id: 2,
      title: "TAMAÑO DE TEXTO AJUSTABLE",
      description:
        "El usuario puede aumentar o reducir el tamaño del texto en toda la plataforma.",
      icon: <Type className="w-8 h-8" />,
    },
    {
      id: 3,
      title: "NAVEGACIÓN POR TECLADO",
      description:
        "La plataforma se puede recorrer por completo usando solo el teclado, sin necesidad de ratón.",
      icon: <Grid3X3 className="w-8 h-8" />,
    },
    {
      id: 4,
      title: "FUENTE LEGIBLE PARA DISLEXIA",
      description:
        "Activa una tipografía especializada que facilita la lectura a personas con dislexia.",
      icon: <BookOpen className="w-8 h-8" />,
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
      <section className="relative w-full py-16 px-4 sm:px-6 md:px-10 lg:px-[80px] bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-2">
            ACCESIBILIDAD
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Herramienta de Accesibilidad
            </h2>
            <div className="w-12 h-12 opacity-50 rounded-full flex items-center justify-center">
              <Image
                src={accessibility}
                alt="Accessibility"
                width={48}
                height={48}
              />
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nuestra plataforma incluye herramientas de accesibilidad para
            garantizar una experiencia inclusiva, adaptada a todas las personas,
            sin barreras digitales.
          </p>
        </div>
      </section>

      {/* Features Section - Inside the light purple background */}
      <section className="relative w-full py-16 px-4 sm:px-6 md:px-10 lg:px-[80px] bg-purple-50 overflow-hidden">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibilityFeatures.map((feature) => (
              <div
                key={feature.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.id}. {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
