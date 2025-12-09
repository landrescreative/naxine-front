"use client";
import React, { useState, useEffect } from "react";
import ServiceSearchDropdown from "./ServiceSearchDropdown";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  // Fallback para asegurar que la animación se active
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setVideoLoaded(true);
    }, 1000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-visible">
      {/* Video de fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={handleVideoLoad}
        onCanPlay={handleVideoLoad}
        aria-hidden="true"
        tabIndex={-1}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1200 ease-out ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        role="presentation"
      >
        <source src="/video-hero-section.mp4" type="video/mp4" />
      </video>

      {/* Overlay oscuro para mejorar legibilidad */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-1200 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Contenido centrado */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
        {/* Título principal */}
        <h1
          className={`text-white text-3xl sm:text-4xl lg:text-5xl xl:text-5xl font-bold mb-4 leading-tight transition-all duration-800 ease-out delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Explora, elige y contrata al profesional colegiado ideal para ti
        </h1>

        {/* Subtítulo */}
        <p
          className={`text-white text-base sm:text-lg lg:text-xl xl:text-2xl mb-8 font-medium transition-all duration-800 ease-out delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Ayuda experta, segura y cercana.
        </p>

        {/* Contenedor del dropdown y botón */}
        <div
          className={`w-full max-w-2xl transition-all duration-800 ease-out delay-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <ServiceSearchDropdown placeholder="Servicios de" />
        </div>
      </div>
    </div>
  );
}
