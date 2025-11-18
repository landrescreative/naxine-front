"use client";

import Image from "next/image";
import heroImage from "@/assets/ansiedad.png";
import ServiceSearchDropdown from "./ServiceSearchDropdown";

interface PurpleSectionProps {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  backgroundImage?: string;
}

const stats = [
  { value: "1.200+", label: "Profesionales verificados" },
  { value: "25K", label: "Sesiones completadas" },
  { value: "4.9/5", label: "Valoración promedio" },
];

export default function PurpleSection({
  title,
  subtitle,
  searchPlaceholder,
  backgroundImage,
}: PurpleSectionProps) {
  const videoSrc = "/hero-background.mp4";
  const fallbackPoster = backgroundImage || heroImage.src;

  return (
    <section className="relative w-full overflow-hidden bg-black  px-4 sm:px-6 md:px-10 lg:px-16 py-10">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={fallbackPoster}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#10002b]/90 via-primary/80 to-primary/70" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Content */}
          <div className="space-y-6 text-white">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg text-white/85">{subtitle}</p>
            </div>

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-6 space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                Explorar especialidades
              </p>
              <ServiceSearchDropdown
                placeholder={searchPlaceholder}
                className="rounded-xl text-base sm:text-lg font-medium"
                buttonClassName="w-full rounded-xl text-base sm:text-lg"
              />
            </div>

            {/* <div className="grid grid-cols-3 gap-4 text-white/90">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md p-4 text-center"
                >
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div> */}
          </div>

          {/* Visual Card */}
          <div className="relative">
            <div className="rounded-[32px] overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
              <div className="relative h-72 sm:h-96">
                <Image
                  src={backgroundImage || heroImage}
                  alt="Profesionales en consulta"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 540px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 text-primary shadow-xl">
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary/70">
                    Agenda inteligente
                  </p>
                  <p className="text-lg font-semibold">
                    Conecta con profesionales afines a tus necesidades en
                    segundos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
