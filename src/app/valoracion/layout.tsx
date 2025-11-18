import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valorar Sesión",
  description:
    "Valora tu sesión con el profesional en NAXINE. Tu opinión es importante para nosotros y para otros usuarios.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Valorar Sesión | NAXINE",
    description: "Comparte tu experiencia y ayuda a otros usuarios.",
    type: "website",
  },
};

export default function ValoracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

