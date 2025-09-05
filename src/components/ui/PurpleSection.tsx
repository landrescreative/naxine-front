"use client";

import { useState } from "react";
import Image from "next/image";
import heroImage from "@/assets/ansiedad.png";

export default function PurpleSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full px-20 py-16 bg-white">
      <div className="relative max-w-8xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-3xl overflow-hidden ">
        <div className="px-10 py-16 lg:px-28 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            {/* Left side - Text and Search */}
            <div className="text-white space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Explora, elige y contrata al profesional colegiado ideal para
                  ti
                </h1>
                <p className="text-xl text-primary-foreground/80">
                  Encuentra al profesional indicado para ti.
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative w-full max-w-full sm:max-w-md md:max-w-lg mx-auto md:mx-0">
                  <select
                    className="peer appearance-none w-full bg-white/95 backdrop-blur text-gray-800 px-4 py-3 pr-10 rounded-xl border border-white/60 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary/70 focus:bg-white focus:shadow-lg hover:border-white text-lg font-medium"
                    defaultValue=""
                    aria-label="Buscar servicios"
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setIsOpen(false)}
                  >
                    <option value="" disabled>
                      Servicios de
                    </option>
                    <option value="abogacia">Abogacía</option>
                    <option value="arquitectura">Arquitectura</option>
                    <option value="ingenieria">Ingeniería</option>
                    <option value="contabilidad">Contabilidad</option>
                    <option value="medicina">Medicina</option>
                  </select>
                  <div
                    className={`pointer-events-none absolute inset-y-0 right-4 flex items-center text-primary/80 transition-transform ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                      aria-hidden="true"
                    >
                      <path d="M12 14.5a1 1 0 0 1-.707-.293l-5-5a1 1 0 1 1 1.414-1.414L12 12.086l4.293-4.293a1 1 0 0 1 1.414 1.414l-5 5A1 1 0 0 1 12 14.5z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full bg-white text-primary font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors duration-200 text-lg"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src={heroImage}
                  alt="Profesionales en consulta"
                  width={600}
                  height={350}
                  className="w-full h-[350px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
