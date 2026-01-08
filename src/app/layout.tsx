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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://naxine.com"
  ),
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
          id="equalweb-accessibility"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.interdeal = {
                get sitekey() { return "7ef68b1b5855325eb4d9213a374b96ac"; },
                get domains() {
                  return {
                    js: "https://cdn.equalweb.com/",
                    acc: "https://access.equalweb.com/",
                  };
                },
                Position: "left",
                Menulang: "ES",
                draggable: true,
                btnStyle: {
                  vPosition: ["50%", "80%"],
                  margin: ["0", "0"],
                  scale: ["0.8", "0.5"],
                  color: { main: "#0a51f2", second: "#ffffff" },
                  icon: { outline: false, outlineColor: "#ffffff", type: 1, shape: "circle" },
                },
                showTooltip: true,
              };
              (function(doc, head, body) {
                const coreCall = doc.createElement("script");
                coreCall.src = window.interdeal.domains.js + "core/5.2.0/accessibility.js";
                coreCall.defer = true;
                coreCall.integrity = "sha512-fHF4rKIzByr1XeM6stpnVdiHrJUOZsKN2/Pm0jikdTQ9uZddgq15F92kUptMnyYmjIVNKeMIa67HRFnBNTOXsQ==";
                coreCall.crossOrigin = "anonymous";
                coreCall.setAttribute("data-cfasync", "true");
                (body ? body : head).appendChild(coreCall);
              })(document, document.head, document.body);
            `,
          }}
        />
      </body>
    </html>
  );
}
