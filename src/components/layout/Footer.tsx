"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Github, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-purple-100 border-t border-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-4 lg:grid-rows-1 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Identity Section - Top Left */}
          <div className="flex flex-col gap-6 sm:col-start-1 sm:row-start-1 lg:col-auto lg:row-auto">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/PNG-01.png"
                alt="Naxine Logo"
                className="w-36 object-contain  h-full"
              />
            </div>

            {/* Tagline */}
            <p className="text-black text-sm">
              Explora, elige y contrata al profesional colegiado ideal para ti
            </p>
          </div>

          {/* Sitio Web Links - Top Right */}
          <div className="space-y-4 sm:col-start-2 sm:row-start-1 lg:col-auto lg:row-auto">
            <h3 className="text-black font-bold text-base">Sitio Web</h3>
            <nav className="space-y-2">
              <Link
                href="/"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Inicio
              </Link>
              <Link
                href="/servicios"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Servicios
              </Link>
              <Link
                href="/como-funciona"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Como funciona
              </Link>
              <Link
                href="/registro"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Registrate
              </Link>
              <Link
                href="/acerca-de"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Acerca de
              </Link>
              <Link
                href="/contacto"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Contacto
              </Link>
            </nav>
          </div>

          {/* Empresa Links - Bottom Left */}
          <div className="space-y-4 sm:col-start-1 sm:row-start-2 lg:col-auto lg:row-auto">
            <h3 className="text-black font-bold text-base">Empresa</h3>
            <nav className="space-y-2">
              <Link
                href="/politica-privacidad"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Política de privacidad
              </Link>
              <Link
                href="/terminos-condiciones"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Términos y condiciones
              </Link>
              <Link
                href="/preguntas-frecuentes"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                FAQs
              </Link>
              <Link
                href="/politica-cookies"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Política de cookies
              </Link>
              <Link
                href="/politica-cancelacion"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Política de cancelación
              </Link>
            </nav>
          </div>

          {/* Social Media Section - Bottom Right */}
          <div className="space-y-4 sm:col-start-2 sm:row-start-2 lg:col-auto lg:row-auto">
            <h3 className="text-black font-bold text-base">Síguenos</h3>
            <div className="flex space-x-6">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 transition-colors p-1"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 transition-colors p-1"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </Link>
              <Link
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 transition-colors p-1"
                aria-label="Telegram"
              >
                <Send className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
