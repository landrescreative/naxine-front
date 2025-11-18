import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro Profesional",
  description:
    "Únete a NAXINE como profesional. Regístrate para ofrecer tus servicios profesionales verificados en nuestra plataforma.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Registro Profesional | NAXINE",
    description: "Únete a NAXINE como profesional y ofrece tus servicios verificados.",
    type: "website",
  },
};

export default function RegisterProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

