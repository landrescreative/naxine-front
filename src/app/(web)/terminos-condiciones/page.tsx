import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export default function TerminosCondicionesPage() {
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
          subtitle="Términos y Condiciones de Uso"
          title="Términos y Condiciones"
          className=""
          transparent={true}
        />

        {/* Contenido */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Sección 1 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Objeto
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  NAXINE es una plataforma digital que facilita la conexión
                  entre clientes y profesionales prestadores de servicios en
                  áreas como nutrición, psicología, fisioterapia, coaching y
                  asesoría legal. NAXINE actúa únicamente como intermediaria
                  para facilitar la contratación de los servicios.
                </p>
              </div>
            </div>

            {/* Sección 2 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Relación contractual
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  El contrato de prestación de servicios se establece
                  directamente entre el cliente y el profesional elegido. NAXINE
                  no es parte ni responsable de dicho contrato ni de la calidad,
                  resultados o cumplimiento del servicio contratado.
                </p>
              </div>
            </div>

            {/* Sección 3 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Uso de la plataforma
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  Para utilizar NAXINE, el usuario debe registrarse y aceptar
                  estos Términos y Condiciones. El acceso y uso de la plataforma
                  es personal, no transferible y debe respetar la normativa
                  vigente.
                </p>
              </div>
            </div>

            {/* Sección 4 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Pagos y comisiones
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  <strong>4.1.</strong> Los precios publicados en la plataforma
                  incluyen todos los costes asociados a la reserva del servicio.
                </p>
                <p>
                  <strong>4.2.</strong> NAXINE gestiona el procesamiento del
                  pago de forma segura a través de Stripe. El importe se
                  transfiere al profesional una vez realizada la sesión,
                  conforme a los términos establecidos en la Política de
                  Cancelación y Reembolso.
                </p>
                <p>
                  <strong>4.3.</strong> NAXINE actúa como intermediaria
                  tecnológica para facilitar la conexión entre clientes y
                  profesionales, sin ser parte del contrato de prestación de
                  servicios entre ambos.
                </p>
              </div>
            </div>

            {/* Sección 5 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Cancelaciones y reembolsos
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  Las condiciones específicas de cancelación, modificaciones y
                  reembolsos se regulan en un documento aparte de Política de
                  Cancelación y Reembolso, que forma parte integrante del
                  servicio.
                </p>
              </div>
            </div>

            {/* Sección 6 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Responsabilidades
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  <strong>6.1.</strong> NAXINE no garantiza ni responde por la
                  idoneidad, profesionalidad, resultados o cumplimiento de los
                  servicios prestados por los profesionales.
                </p>
                <p>
                  <strong>6.2.</strong> El cliente reconoce que la contratación
                  y relación con el profesional es directa y exclusiva entre
                  ambos.
                </p>
                <p>
                  <strong>6.3.</strong> NAXINE no será responsable de daños o
                  perjuicios derivados de la utilización de la plataforma o de
                  los servicios contratados.
                </p>
              </div>
            </div>

            {/* Sección 7 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Protección de datos
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  Los datos personales facilitados serán tratados conforme a la
                  Política de Privacidad disponible en la plataforma, en
                  cumplimiento del Reglamento General de Protección de Datos
                  (RGPD) y normativa española vigente.
                </p>
              </div>
            </div>

            {/* Sección 8 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Ley aplicable y jurisdicción
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  Estos Términos y Condiciones se rigen por la legislación
                  española. Cualquier controversia será sometida a los juzgados
                  y tribunales de Madrid.
                </p>
              </div>
            </div>

            {/* Sección 9 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Modificaciones
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  NAXINE se reserva el derecho a modificar estos Términos y
                  Condiciones en cualquier momento, informando a los usuarios a
                  través de la plataforma.
                </p>
              </div>
            </div>

            {/* Contacto */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contacto</h3>
              <p className="text-gray-700">
                Si tienes alguna pregunta sobre estos Términos y Condiciones,
                puedes contactarnos en:
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Email:</strong> privacidad@naxine.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
