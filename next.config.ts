import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nota: output: "standalone" se usa solo para Docker
  // Vercel maneja el build automáticamente, no necesita esta configuración
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      // Permitir imágenes de S3 (todas las regiones)
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      // Permitir dominio específico del bucket si aplica (ejemplo eu-central-1)
      {
        protocol: "https",
        hostname: "naxine-bucket.s3.*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
