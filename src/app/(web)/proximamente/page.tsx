import type { Metadata } from "next";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "@/assets/PNG-01.png";

// Forzar rendering dinámico para que el middleware se ejecute
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NAXINE – Marketplace digital de servicios profesionales",
  description:
    "NAXINE es un marketplace digital español con herramienta de accesibilidad, diseñado para contratar servicios profesionales en psicología, nutrición, coaching, fisioterapia y asesoría legal. Con sede en Madrid, promueve la innovación y la inclusión digital.",
  openGraph: {
    title: "NAXINE – Marketplace digital de servicios profesionales",
    description:
      "NAXINE es un marketplace digital español con herramienta de accesibilidad, diseñado para contratar servicios profesionales en psicología, nutrición, coaching, fisioterapia y asesoría legal. Con sede en Madrid, promueve la innovación y la inclusión digital.",
    type: "website",
    locale: "es_ES",
  },
};

export default function ProximamentePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src={Logo}
            alt="naxine"
            width={200}
            height={80}
            className="w-auto h-16 md:h-20"
            priority
          />
        </div>

        {/* Descripción */}
        <div className="space-y-4 max-w-3xl">
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed font-nunito">
            <span className="text-[#FF6B35] font-bold">NAXINE</span> es un{" "}
            <span className="italic">marketplace digital</span> con herramienta
            de accesibilidad, diseñado para contratar{" "}
            <span className="italic">servicios profesionales</span> en
            psicología, nutrición, coaching, fisioterapia y asesoría legal. Con
            sede en Madrid, promueve la innovación y la inclusión digital.
          </p>
        </div>

        {/* Próximamente */}
        <div className="py-6">
          <p className="text-gray-800 text-xl md:text-2xl font-semibold">
            Próximamente disponible.
          </p>
        </div>

        {/* Información de contacto */}
        <div className="space-y-4 pt-4">
          {/* Email y Teléfono */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-gray-700">
            <a
              href="mailto:info@naxine.com"
              className="flex items-center gap-2 hover:text-[#0a51f2] transition-colors"
            >
              <Mail className="w-5 h-5 text-[#0a51f2]" />
              <span className="text-base md:text-lg">info@naxine.com</span>
            </a>
            <span className="hidden md:inline text-gray-400">|</span>
            <a
              href="tel:+34919933510"
              className="flex items-center gap-2 hover:text-[#0a51f2] transition-colors"
            >
              <Phone className="w-5 h-5 text-[#FF6B35]" />
              <span className="text-base md:text-lg">+34 919 933 510</span>
            </a>
          </div>

          {/* Ubicación */}
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6B35]" />
            <a
              href="https://maps.app.goo.gl/DjYCs5jqRUST2t4y9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0a51f2] hover:underline text-base md:text-lg"
            >
              Ver ubicación en Google Maps
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-16">
          <p className="text-gray-500 text-sm">© NAXINE 2025</p>
        </div>
      </div>
    </div>
  );
}
