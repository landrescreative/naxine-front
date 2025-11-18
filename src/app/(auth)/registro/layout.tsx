import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro",
  description:
    "Crea tu cuenta en NAXINE y comienza a encontrar profesionales verificados en salud, nutrición, asesoría legal y más.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Registro | NAXINE",
    description: "Crea tu cuenta en NAXINE y accede a servicios profesionales verificados.",
    type: "website",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

