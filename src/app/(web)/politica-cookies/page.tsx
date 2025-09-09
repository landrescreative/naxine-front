import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export default function PoliticaCookiesPage() {
  return (
    <div className="min-h-screen relative">
      {/* Imagen de fondo con opacidad reducida */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "url('/assets/1d4a61ccf5b36a094b40bc55b9036d8f91e5c8cc.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      ></div>
      <div className="relative z-10">
        <SeparatorSection
          subtitle="Política de Cookies"
          title="Política de Cookies"
          className=""
          transparent={true}
        />

        {/* Contenido */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* ¿Qué son las cookies? */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Qué son las cookies?
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  Una cookie es un pequeño archivo de texto que un sitio web
                  coloca en tu dispositivo (ordenador, móvil o tablet) cuando lo
                  visitas. Las cookies permiten que el sitio web recuerde tus
                  acciones y preferencias (como inicio de sesión, idioma, tamaño
                  de fuente y otras preferencias de visualización) durante un
                  período de tiempo, para que no tengas que volver a
                  configurarlas cada vez que regreses al sitio o navegues entre
                  páginas.
                </p>
              </div>
            </div>

            {/* ¿Qué tipo de cookies utilizamos? */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Qué tipo de cookies utilizamos?
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-6">
                  Nuestro sitio web utiliza las siguientes categorías de
                  cookies:
                </p>

                {/* Cookies necesarias */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    1. Cookies necesarias
                  </h3>
                  <p className="mb-3">
                    Estas cookies son esenciales para el funcionamiento del
                    sitio web y no pueden desactivarse en nuestros sistemas. Se
                    suelen configurar en respuesta a acciones realizadas por ti,
                    como configurar tus preferencias de privacidad, iniciar
                    sesión o completar formularios.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>Ejemplo:</strong> Cookies de sesión, autenticación,
                    preferencias de idioma.
                  </p>
                </div>

                {/* Cookies de rendimiento */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    2. Cookies de rendimiento
                  </h3>
                  <p className="mb-3">
                    Estas cookies nos permiten contar visitas y fuentes de
                    tráfico para poder medir y mejorar el rendimiento de nuestro
                    sitio. Nos ayudan a saber qué páginas son las más o menos
                    populares y cómo se mueven los visitantes por el sitio.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>Ejemplo:</strong> Google Analytics, Matomo.
                  </p>
                </div>

                {/* Cookies de funcionalidad */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    3. Cookies de funcionalidad
                  </h3>
                  <p className="mb-3">
                    Estas cookies permiten que el sitio web ofrezca una mejor
                    funcionalidad y personalización. Pueden ser establecidas por
                    nosotros o por proveedores externos cuyos servicios hemos
                    agregado a nuestras páginas.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>Ejemplo:</strong> Reproductores de video
                    incrustados, chats en vivo.
                  </p>
                </div>

                {/* Cookies de publicidad */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    4. Cookies de publicidad o marketing
                  </h3>
                  <p className="mb-3">
                    Estas cookies pueden ser establecidas a través de nuestro
                    sitio por nuestros socios publicitarios. Se utilizan para
                    crear un perfil de tus intereses y mostrarte anuncios
                    relevantes en otros sitios.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>Ejemplo:</strong> Facebook Pixel, Google Ads.
                  </p>
                </div>
              </div>
            </div>

            {/* ¿Cómo puedes controlar las cookies? */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Cómo puedes controlar las cookies?
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  Puedes configurar tu navegador para bloquear o alertarte sobre
                  estas cookies, pero algunas partes del sitio podrían no
                  funcionar correctamente. Aquí te dejamos enlaces para
                  gestionar cookies en los principales navegadores:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Google Chrome</li>
                  <li>Mozilla Firefox</li>
                  <li>Safari</li>
                  <li>Microsoft Edge</li>
                </ul>
                <p>
                  También puedes modificar tus preferencias desde nuestro Centro
                  de preferencias de cookies si está disponible en el sitio.
                </p>
              </div>
            </div>

            {/* Cambios en esta política */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cambios en esta política
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  Podemos actualizar esta Política de Cookies ocasionalmente
                  para reflejar cambios en nuestras prácticas o por otras
                  razones operativas, legales o reglamentarias. Te recomendamos
                  revisar esta página periódicamente.
                </p>
              </div>
            </div>

            {/* Contacto */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contacto</h3>
              <p className="text-gray-700 mb-4">
                Si tienes dudas sobre nuestra política de cookies, puedes
                contactarnos a través de:
              </p>
              <div className="text-gray-700 space-y-2">
                <p>
                  <strong>Correo electrónico:</strong> privacidad@naxine.com
                </p>
                <p>
                  <strong>Dirección:</strong> NAXINE, Calle de la Princesa 31,
                  planta 2, puerta 2, Madrid, 28008, España
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
