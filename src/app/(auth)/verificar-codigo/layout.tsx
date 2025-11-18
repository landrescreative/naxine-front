import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificar Código",
  description:
    "Verifica tu código de verificación de NAXINE para completar tu registro o recuperación de contraseña.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Verificar Código | NAXINE",
    description: "Verifica tu código de verificación para completar tu proceso.",
    type: "website",
  },
};

export default function VerifyCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

