import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alta de Profesional | NAXINE",
  description:
    "Únete a NAXINE como profesional. Completa el formulario para solicitar tu alta en nuestra plataforma y comienza a ofrecer tus servicios.",
  keywords: [
    "alta profesional",
    "registro profesional",
    "unirse a NAXINE",
    "profesionales NAXINE",
    "formulario profesional",
  ],
  openGraph: {
    title: "Alta de Profesional | NAXINE",
    description:
      "Únete a NAXINE como profesional. Completa el formulario para solicitar tu alta en nuestra plataforma.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AltaProfesionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

