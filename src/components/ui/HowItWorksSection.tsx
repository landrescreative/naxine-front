"use client";

import React from "react";
import {
  Search,
  BadgeCheck,
  Lock,
  MessageSquareText,
  Star,
} from "lucide-react";

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

export default function HowItWorksSection() {
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
          <Search className="h-6 w-6" />
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
          <BadgeCheck className="h-6 w-6" />
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
          <Lock className="h-6 w-6" />
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
          <MessageSquareText className="h-6 w-6" />
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
    <section className="w-full py-8 md:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Grid en zig-zag para replicar la composición del mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* 1 */}
          <article className="group order-1 lg:order-1 mx-auto w-full max-w-[460px] lg:max-w-[440px] rounded-2xl bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(16,24,40,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
            {steps[0].icon}
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {steps[0].title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {steps[0].description}
            </p>
          </article>

          {/* 2 */}
          <article className="group order-2 lg:order-2 mx-auto w-full max-w-[460px] lg:max-w-[440px] rounded-2xl bg-white p-6 text-center shadow-[0_15px_40px_rgba(16,24,40,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,24,40,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
            {steps[1].icon}
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {steps[1].title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {steps[1].description}
            </p>
          </article>

          {/* 3 */}
          <article className="group order-3 lg:order-3 mx-auto w-full max-w-[460px] lg:max-w-[440px] rounded-2xl bg-white p-6 text-center shadow-[0_15px_40px_rgba(16,24,40,0.08)] xl:translate-x-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,24,40,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
            {steps[2].icon}
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {steps[2].title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {steps[2].description}
            </p>
          </article>

          {/* 4 */}
          <article className="group order-4 lg:order-4 mx-auto w-full max-w-[460px] lg:max-w-[440px] rounded-2xl bg-white p-6 text-center xl:-translate-x-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(16,24,40,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
            {steps[3].icon}
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {steps[3].title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {steps[3].description}
            </p>
          </article>

          {/* 5 (centrado a lo ancho) */}
          <article className="group order-5 lg:col-span-2 mx-auto w-full max-w-[460px] lg:max-w-[440px] rounded-2xl bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(16,24,40,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
            {steps[4].icon}
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {steps[4].title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {steps[4].description}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
