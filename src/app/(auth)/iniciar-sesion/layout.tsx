import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description:
    "Inicia sesión en tu cuenta de NAXINE para acceder a servicios profesionales de salud, nutrición, asesoría legal y más.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Iniciar Sesión | NAXINE",
    description: "Accede a tu cuenta de NAXINE para gestionar tus citas y servicios profesionales.",
    type: "website",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

