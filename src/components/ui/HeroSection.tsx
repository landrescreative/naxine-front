"use client";
import React, { useState } from "react";

import background from "@/assets/ca48d68e7670363c5191583082e186b99cc6ab67.jpg";
import Image from "next/image";
import heroImage from "@/assets/1821c887-f531-4da4-8c1d-e81b8c21c771.png";

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative w-full min-h-screen px-4 py-16 sm:px-6 md:px-10 lg:px-[80px] lg:py-[125px]">
      <Image
        src={background}
        alt="Background"
        fill
        priority
        placeholder="blur"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#B29FFFAD] opacity-90 pointer-events-none"></div>
      <div className="relative z-10 flex items-center justify-around h-full bg-primary px-4 py-10 sm:px-6 md:px-10 lg:px-[47px] lg:py-[80px] flex-col md:flex-row gap-8">
        <div className="flex flex-col gap-4 w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">
            Explora, elige y contrata al profesional colegiado ideal para ti
          </h1>
          <p className="text-white text-base sm:text-lg lg:text-xl">
            Ayuda experta, segura y cercana.
          </p>
          <div className="relative w-full max-w-full sm:max-w-md md:max-w-lg mx-auto md:mx-0">
            <select
              className="peer appearance-none w-full bg-white/95 backdrop-blur text-gray-800 px-4 py-3 pr-12 rounded-md border border-white/60 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary/70 focus:bg-white focus:shadow-lg hover:border-white"
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
        </div>
        <div className="flex items-center justify-center w-full md:w-1/2 h-auto md:h-full mt-8 md:mt-0 ">
          <Image
            src={heroImage}
            alt="Hero Image"
            width={500}
            height={500}
            className="w-full h-full rounded-4xl"
            priority
            quality={100}
          />
        </div>
      </div>
    </div>
  );
}
