import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmación de Pago",
  description:
    "Confirmación de pago exitoso en NAXINE. Tu cita ha sido reservada correctamente.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Confirmación de Pago | NAXINE",
    description: "Tu pago ha sido procesado exitosamente.",
    type: "website",
  },
};

export default function PaymentConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

