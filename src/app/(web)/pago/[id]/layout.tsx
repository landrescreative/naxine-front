import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Completar Pago",
  description:
    "Completa el pago de tu cita en NAXINE. Pago seguro procesado por Stripe.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Completar Pago | NAXINE",
    description: "Completa el pago de tu cita de forma segura.",
    type: "website",
  },
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

