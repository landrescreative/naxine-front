import type { Metadata } from "next";
import Script from "next/script";
import { Atkinson_Hyperlegible, Nunito } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const atkinsonHyperlegible = Atkinson_Hyperlegible({
  variable: "--font-atkinson-hyperlegible",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "NAXINE - Plataforma de Servicios Profesionales",
    template: "%s | NAXINE",
  },
  description:
    "NAXINE es una plataforma digital que conecta usuarios con profesionales verificados en salud, nutrición, asesoría legal, coaching, logopedia y fisioterapia. Servicios profesionales éticos, seguros y accesibles.",
  keywords: [
    "servicios profesionales",
    "salud mental",
    "nutrición",
    "asesoría legal",
    "coaching",
    "logopedia",
    "fisioterapia",
    "terapia online",
    "profesionales verificados",
    "bienestar",
  ],
  authors: [{ name: "NAXINE" }],
  creator: "NAXINE",
  publisher: "NAXINE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://naxine.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "NAXINE",
    title: "NAXINE - Plataforma de Servicios Profesionales",
    description:
      "Conecta con profesionales verificados en salud, nutrición, asesoría legal y más. Servicios profesionales éticos, seguros y accesibles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NAXINE - Plataforma de Servicios Profesionales",
    description:
      "Conecta con profesionales verificados en salud, nutrición, asesoría legal y más.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${atkinsonHyperlegible.variable} ${nunito.variable} antialiased`}
      >
        <ConditionalLayout>{children}</ConditionalLayout>
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="AAYHnoKLAL"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
