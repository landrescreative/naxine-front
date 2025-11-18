import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Contraseña",
  description:
    "Recupera tu contraseña de NAXINE. Te enviaremos un código de verificación para restablecer tu contraseña.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Recuperar Contraseña | NAXINE",
    description: "Recupera el acceso a tu cuenta de NAXINE.",
    type: "website",
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

