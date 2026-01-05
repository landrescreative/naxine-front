import type { Metadata } from "next";
import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export const metadata: Metadata = {
  title: "Términos y Condiciones para Profesionales",
  description:
    "Términos y condiciones de uso de NAXINE para profesionales. Lee las condiciones generales para ofrecer tus servicios en nuestra plataforma.",
  keywords: [
    "términos y condiciones profesionales",
    "condiciones de uso profesionales",
    "términos de servicio",
    "condiciones generales",
    "uso de la plataforma",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Términos y Condiciones para Profesionales | NAXINE",
    description:
      "Lee las condiciones generales de uso de la plataforma NAXINE para profesionales.",
    type: "website",
  },
};

async function fetchPolicies() {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
  // Intentamos obtener el contenido dinámico si existe, sino usamos un fallback
  try {
    const res = await fetch(`${base}/paginas-informacion`, { cache: "no-store" });
    if (!res.ok) {
        return null;
    }
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function TerminosCondicionesProfesionalesPage() {
  let content = `
1. INTRODUCCIÓN Y OBJETO
Bienvenido a NAXINE. Estos Términos y Condiciones regulan la relación entre NAXINE y los profesionales que ofrecen sus servicios a través de nuestra plataforma.

2. REGISTRO Y VERACIDAD DE LA INFORMACIÓN
El profesional se compromete a proporcionar información veraz, exacta y actualizada durante el proceso de registro y en su perfil público.

3. OBLIGACIONES DEL PROFESIONAL
- Mantener la confidencialidad de sus credenciales de acceso.
- Prestar los servicios con la diligencia y calidad debidas.
- Cumplir con la normativa legal vigente aplicable a su profesión.

4. TARIFAS Y PAGOS
Las condiciones económicas, comisiones y plazos de pago se detallan en el anexo comercial correspondiente o en el panel de control del profesional.

5. BAJA DEL SERVICIO
El profesional puede solicitar la baja de la plataforma en cualquier momento, siguiendo el procedimiento establecido en su área privada.

(Este es un texto de ejemplo. El contenido final debe ser proporcionado por la administración de la plataforma.)
`;

  try {
    const data = await fetchPolicies();
    if (data?.data?.Terminos_condiciones_profesionales) {
        content = String(data.data.Terminos_condiciones_profesionales);
    }
  } catch (e) {
    // Mantener contenido por defecto
  }

  return (
    <div className="min-h-screen relative">
      {/* Imagen de fondo con opacidad reducida */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "url('/assets/1d4a61ccf5b36a094b40bc55b9036d8f91e5c8cc.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      ></div>
      <div className="relative z-10">
        <SeparatorSection
          subtitle="Términos y Condiciones para Profesionales"
          title="Términos y Condiciones"
          className=""
          transparent={true}
        />

        {/* Contenido dinámico */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
