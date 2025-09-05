"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Github, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-purple-100 border-t border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Identity Section */}
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                {/* Abstract symbol - two intertwined loops with better positioning */}
                <div className="absolute inset-0">
                  {/* First loop - blue */}
                  <div className="w-7 h-7 border-2 border-blue-500 rounded-full absolute top-0 left-0 transform rotate-12"></div>
                  {/* Second loop - purple, overlapping */}
                  <div className="w-7 h-7 border-2 border-purple-500 rounded-full absolute bottom-0 right-0 transform -rotate-12"></div>
                </div>
              </div>
              <div className="text-2xl font-bold">
                <span className="text-blue-600">nax</span>
                <span className="text-orange-500">ine.</span>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-black text-sm leading-relaxed max-w-xs">
              Explora, elige y contrata al profesional colegiado ideal para ti
            </p>
          </div>

          {/* Sitio Web Links */}
          <div className="space-y-4">
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
                href="/register"
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

          {/* Empresa Links */}
          <div className="space-y-4">
            <h3 className="text-black font-bold text-base">Empresa</h3>
            <nav className="space-y-2">
              <Link
                href="/politica-privacidad"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Politica de privacidad
              </Link>
              <Link
                href="/terminos-condiciones"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Términos y condiciones
              </Link>
              <Link
                href="/faq"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                FAQS
              </Link>
              <Link
                href="/politica-cookies"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Politica de Cookies
              </Link>
              <Link
                href="/politica-cancelacion"
                className="block text-black hover:text-purple-600 transition-colors text-sm"
              >
                Política de cancelación
              </Link>
            </nav>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
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
