import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "¿Tienes alguna pregunta o necesitas ayuda? Contacta con el equipo de NAXINE. Estamos aquí para ayudarte y responder todas tus consultas sobre nuestros servicios profesionales.",
  keywords: [
    "contacto NAXINE",
    "soporte",
    "ayuda",
    "consultas",
    "atención al cliente",
    "formulario de contacto",
  ],
  openGraph: {
    title: "Contacto | NAXINE",
    description:
      "¿Tienes alguna pregunta? Contacta con el equipo de NAXINE. Estamos aquí para ayudarte.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

