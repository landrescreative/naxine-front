"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Github, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-purple-100 border-t border-black" role="contentinfo" aria-label="Pie de página">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-4 lg:grid-rows-1 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Identity Section - Top Left */}
          <div className="flex flex-col gap-6 sm:col-start-1 sm:row-start-1 lg:col-auto lg:row-auto">
            {/* Logo */}
            <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 rounded-md" aria-label="Naxine - Ir al inicio">
              <img
                src="/PNG-01.png"
                alt=""
                className="w-36 object-contain h-full"
                aria-hidden="true"
              />
              <span className="sr-only">Naxine</span>
            </Link>

            {/* Tagline */}
            <p className="text-black text-sm">
              Explora, elige y contrata al profesional colegiado ideal para ti
            </p>
          </div>

          {/* Sitio Web Links - Top Right */}
          <div className="space-y-4 sm:col-start-2 sm:row-start-1 lg:col-auto lg:row-auto">
            <h3 className="text-black font-bold text-base" id="footer-sitio-web">Sitio Web</h3>
            <nav className="space-y-2" aria-labelledby="footer-sitio-web">
              <Link
                href="/"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Inicio"
              >
                Inicio
              </Link>
              <Link
                href="/servicios"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Servicios"
              >
                Servicios
              </Link>
              <Link
                href="/como-funciona"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Cómo funciona"
              >
                Cómo funciona
              </Link>
              <Link
                href="/registro"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Registrate"
              >
                Registrate
              </Link>
              <Link
                href="/acerca-de"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Acerca de"
              >
                Acerca de
              </Link>
              <Link
                href="/contacto"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Contacto"
              >
                Contacto
              </Link>
            </nav>
          </div>

          {/* Empresa Links - Bottom Left */}
          <div className="space-y-4 sm:col-start-1 sm:row-start-2 lg:col-auto lg:row-auto">
            <h3 className="text-black font-bold text-base" id="footer-empresa">Empresa</h3>
            <nav className="space-y-2" aria-labelledby="footer-empresa">
              <Link
                href="/politica-privacidad"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Política de privacidad"
              >
                Política de privacidad
              </Link>
              <Link
                href="/terminos-condiciones"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Términos y condiciones"
              >
                Términos y condiciones
              </Link>
              <Link
                href="/preguntas-frecuentes"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Preguntas frecuentes"
              >
                FAQs
              </Link>
              <Link
                href="/politica-cookies"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Política de cookies"
              >
                Política de cookies
              </Link>
              <Link
                href="/politica-cancelacion"
                className="block text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:underline transition-colors text-sm"
                aria-label="Política de cancelación"
              >
                Política de cancelación
              </Link>
            </nav>
          </div>

          {/* Social Media Section - Bottom Right */}
          <div className="space-y-4 sm:col-start-2 sm:row-start-2 lg:col-auto lg:row-auto">
            <h3 className="text-black font-bold text-base" id="footer-redes">Síguenos</h3>
            <div className="flex space-x-6" role="list" aria-labelledby="footer-redes">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 rounded-md transition-colors p-1"
                aria-label="Instagram (abre en nueva ventana)"
              >
                <Instagram className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 rounded-md transition-colors p-1"
                aria-label="Facebook (abre en nueva ventana)"
              >
                <Facebook className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 rounded-md transition-colors p-1"
                aria-label="GitHub (abre en nueva ventana)"
              >
                <Github className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Link
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 focus:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 rounded-md transition-colors p-1"
                aria-label="Telegram (abre en nueva ventana)"
              >
                <Send className="h-6 w-6" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 sm:mt-12 pt-8 border-t border-black/20">
          <p className="text-black text-sm text-center">
            © {new Date().getFullYear()} Naxine. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
