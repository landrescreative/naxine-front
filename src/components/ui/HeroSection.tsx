"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const router = useRouter();

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

  const categories = [
    { value: "dietas", label: "Dietas y Nutrición" },
    { value: "terapias", label: "Terapias Psicológicas" },
    { value: "logopedas", label: "Logopedia y Terapia del Habla" },
    { value: "desarrollo-personal", label: "Desarrollo Personal" },
    { value: "consultas-legales", label: "Consultas Legales" },
  ];

  const services = [
    // Dietas
    { value: "dietas/perdida-de-peso", label: "Pérdida de peso" },
    { value: "dietas/deportiva", label: "Nutrición deportiva" },
    { value: "dietas/vegetarianos-y-veganos", label: "Vegetarianos y veganos" },
    {
      value: "dietas/tcas-trastornos-conducta-alimentaria",
      label: "TCAs (trastornos de la conducta alimentaria)",
    },
    { value: "dietas/embarazo-y-lactancia", label: "Embarazo y lactancia" },
    { value: "dietas/nutricion-infantil", label: "Nutrición infantil" },
    { value: "dietas/aumento-de-peso", label: "Aumento de peso" },
    { value: "dietas/menopausia", label: "Menopausia" },
    { value: "dietas/salud-intestinal", label: "Salud intestinal" },
    { value: "dietas/sibo-y-fodmap", label: "SIBO y dieta FODMAP" },
    { value: "dietas/obesidad", label: "Obesidad" },
    { value: "dietas/tiroides", label: "Tiroides" },
    {
      value: "dietas/alergias-e-intolerancias",
      label: "Alergias e intolerancias",
    },
    { value: "dietas/nutricion-clinica", label: "Nutrición clínica" },
    {
      value: "dietas/nutricionista-oncologico",
      label: "Nutricionista oncológico",
    },

    // Terapias
    { value: "terapias/depresion", label: "Depresión" },
    { value: "terapias/ansiedad", label: "Ansiedad" },
    { value: "terapias/fobias", label: "Fobias" },
    { value: "terapias/pareja", label: "Terapia de pareja" },
    {
      value: "terapias/trastornos-conducta-alimentaria",
      label: "Trastornos de conducta alimentaria",
    },
    { value: "terapias/duelo", label: "Duelo: pérdida de un ser querido" },
    { value: "terapias/baja-autoestima", label: "Baja autoestima" },
    { value: "terapias/obsesiones", label: "Obsesiones" },
    { value: "terapias/trauma-y-tept", label: "Trauma y TEPT" },
    { value: "terapias/problemas-sexuales", label: "Problemas sexuales" },
    { value: "terapias/psico-oncologia", label: "Psico-oncología" },

    // Logopedas
    { value: "logopedas/trastornos-del-habla", label: "Trastornos del habla" },
    {
      value: "logopedas/trastornos-del-lenguaje",
      label: "Trastornos del lenguaje",
    },
    { value: "logopedas/trastornos-auditivos", label: "Trastornos auditivos" },
    {
      value: "logopedas/dificultades-neurologicas",
      label: "Dificultades de origen neurológico",
    },
    {
      value: "logopedas/dificultades-de-aprendizaje",
      label: "Dificultades de aprendizaje",
    },
    {
      value: "logopedas/problemas-de-deglucion",
      label: "Problemas de deglución",
    },

    // Desarrollo Personal
    { value: "desarrollo-personal/liderazgo", label: "Liderazgo" },
    {
      value: "desarrollo-personal/habilidades-sociales",
      label: "Habilidades sociales",
    },
    {
      value: "desarrollo-personal/hablar-en-publico",
      label: "Hablar en público",
    },
    {
      value: "desarrollo-personal/comunicacion-no-verbal",
      label: "Comunicación no verbal",
    },
    {
      value: "desarrollo-personal/relaciones-de-pareja",
      label: "Relaciones de pareja",
    },
    {
      value: "desarrollo-personal/relaciones-interpersonales",
      label: "Relaciones interpersonales",
    },

    // Consultas Legales
    { value: "consultas-legales/divorcio", label: "Divorcio" },
    {
      value: "consultas-legales/compraventa-inmuebles",
      label: "Compraventa de inmuebles",
    },
    { value: "consultas-legales/herencias", label: "Herencias" },
    {
      value: "consultas-legales/nie-comunitarios",
      label: "Tramitación de NIE para comunitarios",
    },
    { value: "consultas-legales/custodia", label: "Custodia" },
    {
      value: "consultas-legales/reclamacion-pensiones",
      label: "Reclamación de pensiones",
    },
    {
      value: "consultas-legales/matrimonio-y-filiaciones",
      label: "Matrimonio y filiaciones",
    },
    {
      value: "consultas-legales/contrato-de-alquiler",
      label: "Contrato de alquiler",
    },
    { value: "consultas-legales/desahucios", label: "Desahucios" },
    {
      value: "consultas-legales/estafas-inmobiliarias",
      label: "Estafas inmobiliarias",
    },
    {
      value: "consultas-legales/comunidades-de-propietarios",
      label: "Comunidades de propietarios",
    },
    {
      value: "consultas-legales/testamento-notarial",
      label: "Testamento notarial",
    },
    { value: "consultas-legales/donaciones", label: "Donaciones" },
    {
      value: "consultas-legales/fiscalidad-de-herencias",
      label: "Fiscalidad de herencias",
    },
    {
      value: "consultas-legales/reclamacion-de-herencias",
      label: "Reclamación de herencias",
    },
    {
      value: "consultas-legales/renuncia-de-herencias",
      label: "Renuncia de herencias",
    },
    {
      value: "consultas-legales/nacionalidad-espanola",
      label: "Nacionalidad española",
    },
    {
      value: "consultas-legales/residencia-extranjeros-no-comunitarios",
      label: "Residencia para extranjeros no comunitarios",
    },
  ];

  const handleSearch = () => {
    if (selectedOption) {
      router.push(`/${selectedOption}`);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video de fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={handleVideoLoad}
        onCanPlay={handleVideoLoad}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1200 ease-out ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
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
          className={`flex flex-col sm:flex-row gap-4 w-full max-w-2xl transition-all duration-800 ease-out delay-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Dropdown */}
          <div className="relative flex-1">
            <select
              className="appearance-none w-full bg-white/95 backdrop-blur text-gray-800 px-4 py-3 pr-12 rounded-md border border-white/60 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary/70 focus:bg-white focus:shadow-lg hover:border-white text-base"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              aria-label="Buscar servicios"
              onFocus={() => setIsOpen(true)}
              onBlur={() => setIsOpen(false)}
            >
              <option value="" disabled>
                Servicios de
              </option>

              {/* Categorías */}
              <optgroup label="Categorías">
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </optgroup>

              {/* Servicios por categoría */}
              <optgroup label="Dietas y Nutrición">
                {services
                  .filter((service) => service.value.startsWith("dietas/"))
                  .map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Terapias Psicológicas">
                {services
                  .filter((service) => service.value.startsWith("terapias/"))
                  .map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Logopedia y Terapia del Habla">
                {services
                  .filter((service) => service.value.startsWith("logopedas/"))
                  .map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Desarrollo Personal">
                {services
                  .filter((service) =>
                    service.value.startsWith("desarrollo-personal/")
                  )
                  .map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Consultas Legales">
                {services
                  .filter((service) =>
                    service.value.startsWith("consultas-legales/")
                  )
                  .map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
              </optgroup>
            </select>

            {/* Icono de dropdown */}
            <div
              className={`pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary/80 transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M12 14.5a1 1 0 0 1-.707-.293l-5-5a1 1 0 1 1 1.414-1.414L12 12.086l4.293-4.293a1 1 0 0 1 1.414 1.414l-5 5A1 1 0 0 1 12 14.5z" />
              </svg>
            </div>
          </div>

          {/* Botón de búsqueda */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={!selectedOption}
            className={`font-bold py-3 px-6 rounded-md transition-colors duration-200 text-lg flex items-center gap-2 ${
              selectedOption
                ? "bg-white text-primary hover:bg-gray-100 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M21.71 20.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 5.9-2.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z" />
            </svg>
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
