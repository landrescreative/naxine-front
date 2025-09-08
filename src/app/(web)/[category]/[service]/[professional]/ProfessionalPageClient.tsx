"use client";
import Image from "next/image";
import { useState } from "react";
import thumbnail from "@/assets/screenshot.png";
import SeparatorSection from "@/components/ui/SeparatorSection";
import PricingCard from "@/components/ui/PricingCard";

interface Professional {
  name: string;
  title: string;
  image: string;
  price: number;
  description: string;
  slug: string;
}

interface ProfessionalPageClientProps {
  professional: Professional;
}

export default function ProfessionalPageClient({
  professional,
}: ProfessionalPageClientProps) {
  // Video popup state
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  // Handle popup open
  const handlePopupOpen = () => {
    setIsPopupOpen(true);
  };

  // Close popup when clicking outside
  const handlePopupClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white">
        <div className="container mx-auto px-6 pt-10 pb-6">
          {/* Page Title */}
          <div className="text-center mb-8">
            <p className="text-[#A78BFA] text-sm mb-2 font-normal">
              Conoce a tu especialista
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-black">
              Perfil Profesional
            </h1>
          </div>

          {/* Professional Card */}
          <div className="bg-[#E3DCFF] rounded-3xl p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Side - Image and Basic Info */}
              <div className="space-y-6">
                {/* Professional Image with Play Button */}
                <div className="relative">
                  <Image
                    src={professional.image}
                    alt={professional.name}
                    width={300}
                    height={300}
                    className="rounded-2xl object-cover w-full h-80"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handlePopupOpen}
                      className="bg-[#3B82F6] hover:bg-[#2563EB] rounded-full p-6 transition-colors shadow-lg"
                    >
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Professional Type and Location */}
                <div className="space-y-3 flex flex-col items-center">
                  <button className="bg-[#1a0082] text-white px-6 py-3 rounded-full font-medium">
                    {professional.title}
                  </button>
                  <button className="bg-[#F37E1F] text-white px-6 py-3 rounded-full font-medium flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>Madrid, España</span>
                  </button>
                </div>
              </div>

              {/* Right Side - About Section */}
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-4">
                    {professional.name.toUpperCase()}
                  </h2>

                  {/* Modality Buttons */}
                  <div className="flex space-x-3 mb-6">
                    <button className="bg-primary-foreground text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span>Presencial</span>
                    </button>
                    <button className="bg-primary-foreground text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-8-2c-1.38 0-2.5-1.12-2.5-2.5S10.62 11 12 11s2.5 1.12 2.5 2.5S13.38 16 12 16z" />
                      </svg>
                      <span>En línea</span>
                    </button>
                  </div>

                  {/* About Section */}
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-4">
                      Sobre mi
                    </h3>
                    <p className="text-secondary leading-relaxed text-sm">
                      ¡Hola! Soy {professional.name.split(" ")[0]},{" "}
                      {professional.title.toLowerCase()}. Mi pasión es
                      acompañarte en una de las etapas más extraordinarias de tu
                      vida, asegurando que recibas el acompañamiento óptimo que
                      necesitas para florecer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SeparatorSection
        subtitle="SERVICIOS"
        title="Servicios Ofrecidos"
        className=""
      />

      {/* Services Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          {/* Service Cards */}
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <PricingCard
              title="Primera sesión"
              subtitle="Terapia para la Ansiedad"
              description="Ideal para comenzar tu proceso con una evaluación emocional y plan personalizado"
              duration="60 min"
              price={`$${professional.price}`}
              onPurchase={() => console.log("Comprar primera sesión")}
            />

            <PricingCard
              title="Seguimiento"
              subtitle="Sesión de seguimiento psicológico"
              description="Para continuar tu terapia, revisar avances y trabajar nuevos objetivos."
              duration="45 min"
              price="$100"
              onPurchase={() => console.log("Comprar seguimiento")}
            />

            <PricingCard
              title="Pack x3"
              subtitle="Pack Ansiedad & Estrés"
              description="Tres sesiones para reducir ansiedad con técnicas prácticas + guía de apoyo entre sesiones."
              duration="3x 50 min"
              price="$135"
              savings="Ahorra 15 €"
              isPopular={true}
              onPurchase={() => console.log("Comprar pack x3")}
            />
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm mb-2">Horarios Disponibles</p>
            <h2 className="text-3xl font-bold text-gray-900">Disponibilidad</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: Calendar and times (2 cols) */}
            <div className="lg:col-span-2">
              {/* Month header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Julio</h3>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Date chips */}
              <div className="flex space-x-2 mb-6 overflow-x-auto">
                {[
                  "Lun 16",
                  "Mar 17",
                  "Mier 18",
                  "Juev 19",
                  "Vier 20",
                  "Sab 21",
                  "Dom 22",
                  "Lun 23",
                  "Mar 24",
                ].map((date, i) => (
                  <button
                    key={i}
                    className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${
                      i === 0
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>

              {/* Times list blocks to mimic list rows */}
              {[
                { label: "9:00pm", selected: false },
                { label: "4:45pm", selected: false },
                { label: "5:00pm", selected: true },
                { label: "5:15pm", selected: false },
                { label: "5:30pm", selected: false },
                { label: "5:45pm", selected: false },
                { label: "6:00pm", selected: false },
                { label: "8:00pm", selected: false },
              ].map((slot, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-4 py-4 mb-3 rounded-xl border flex items-center justify-between ${
                    slot.selected
                      ? "bg-purple-100 border-purple-300 text-purple-800"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm">{slot.label}</span>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Right: Summary */}
            <aside className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                    <Image
                      src={professional.image}
                      alt={professional.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Primera sesión</p>
                    <p className="text-xs text-gray-500">
                      Dra.{" "}
                      {professional.name.split(" ")[1] || professional.name}
                      <br />
                      Madrid, España
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 py-2">
                  <span>Primera sesión</span>
                  <span>100$</span>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>USD 100</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Video Popup Modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handlePopupClose}
        >
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => {
                setIsPopupOpen(false);
              }}
              className="absolute top-4 right-4 z-30 w-10 h-10 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all duration-200"
              aria-label="Cerrar video"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video container */}
            <div className="relative aspect-video bg-gray-100">
              <video
                className="w-full h-full object-cover rounded-2xl"
                poster={thumbnail.src}
                controls
                preload="metadata"
                playsInline
              >
                <source src="/Naxine_V1_Music.mp4" type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
