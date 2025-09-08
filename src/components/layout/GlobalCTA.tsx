"use client";
import React, { useState } from "react";
import thumbnail from "@/assets/screenshot.png";
import office from "@/assets/d000ab4e4d45c2420e8885344d33c191b167b033.png";

export default function GlobalCTA() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
    <>
      <section className="w-full flex flex-col lg:flex-row max-h-[500px]">
        {/* Left Section - Purple Background (50% on desktop, full width on mobile) */}
        <div className="w-full lg:w-[50%] bg-primary flex items-center px-6 sm:px-12 lg:px-56 py-8 lg:py-6">
          <div className="max-w-sm mx-auto lg:mx-0 text-center lg:text-left">
            <h2 className="text-white text-3xl sm:text-4xl lg:text-4xl font-bold leading-tight mb-4">
              Cómo funciona
            </h2>
            <p className="text-white text-base sm:text-lg leading-relaxed">
              Elige el servicio que necesitas, envía tu solicitud o mensaje
              directo y acuerda los detalles fácilmente desde tu panel.
            </p>
          </div>
        </div>

        {/* Right Section - Office Image with Play Button (50% on desktop, full width on mobile) */}
        <div className="w-full lg:w-[50%] relative h-[300px] lg:h-auto">
          <div
            className="w-full h-full relative cursor-pointer group"
            onClick={handlePopupOpen}
          >
            {/* Office Image */}
            <img
              src={office.src}
              alt="Office workspace with man on phone"
              className="w-full h-full object-cover"
            />

            {/* Large Circular Play Button - Responsive sizing */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <div className="w-0 h-0 border-l-[20px] sm:border-l-[24px] border-l-[#8B5CF6] border-t-[12px] sm:border-t-[16px] border-t-transparent border-b-[12px] sm:border-b-[16px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Popup Modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
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
    </>
  );
}
