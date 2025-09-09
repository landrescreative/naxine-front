import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export default function PoliticaCancelacionPage() {
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
          subtitle="Política de Cancelación y Reembolso"
          title="Política de Cancelación"
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
                  Esta Política regula las condiciones para la cancelación,
                  modificación y reembolso de las sesiones contratadas a través
                  de la plataforma NAXINE.
                </p>
              </div>
            </div>

            {/* Sección 2 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Cancelaciones por parte del cliente
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  <strong>2.1.</strong> El cliente podrá cancelar o modificar
                  una sesión contratada con un profesional siempre que lo haga
                  con al menos 24 horas de antelación a la fecha y hora
                  programadas.
                </p>
                <p>
                  <strong>2.2.</strong> Si la cancelación se realiza con la
                  antelación indicada, el cliente podrá solicitar la devolución
                  íntegra del importe abonado, descontando la comisión de
                  intermediación aplicada por NAXINE (ver detalle en la
                  plataforma).
                </p>
                <p>
                  <strong>2.3.</strong> Cancelaciones realizadas con menos de 24
                  horas de antelación no tendrán derecho a reembolso, salvo
                  causas justificadas que serán evaluadas caso por caso.
                </p>
              </div>
            </div>

            {/* Sección 3 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Cancelaciones por parte del profesional
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  <strong>3.1.</strong> En caso de que el profesional cancele la
                  sesión, NAXINE informará al cliente y se ofrecerá la opción de
                  reprogramar o solicitar la devolución íntegra del importe
                  abonado, sin comisión de intermediación.
                </p>
              </div>
            </div>

            {/* Sección 4 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. No asistencia o retrasos
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  <strong>4.1.</strong> En caso de no asistencia del cliente a
                  la sesión sin previo aviso, no procederá ningún reembolso.
                </p>
                <p>
                  <strong>4.2.</strong> Retrasos superiores a 15 minutos por
                  parte del cliente o el profesional podrán dar lugar a la
                  cancelación automática sin reembolso, salvo acuerdo expreso
                  entre ambas partes.
                </p>
              </div>
            </div>

            {/* Sección 5 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Procedimiento para solicitar reembolsos
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  <strong>5.1.</strong> Las solicitudes de reembolso deberán
                  realizarse a través del área de usuario en la plataforma o
                  mediante contacto directo con NAXINE en el plazo establecido
                  para cancelaciones.
                </p>
                <p>
                  <strong>5.2.</strong> NAXINE procesará la solicitud en un
                  plazo máximo de 14 días hábiles. El reembolso se efectuará
                  mediante el mismo método de pago utilizado.
                </p>
              </div>
            </div>

            {/* Sección 6 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Excepciones y causas justificadas
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  NAXINE podrá evaluar y autorizar reembolsos fuera de las
                  condiciones generales en casos excepcionales y justificados,
                  como enfermedad grave o fuerza mayor, previa presentación de
                  documentación acreditativa.
                </p>
              </div>
            </div>

            {/* Sección 7 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Modificaciones de esta política
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  NAXINE se reserva el derecho a modificar esta Política de
                  Cancelación y Reembolso en cualquier momento, informando a los
                  usuarios mediante la plataforma.
                </p>
              </div>
            </div>

            {/* Contacto */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contacto</h3>
              <p className="text-gray-700">
                Si tienes alguna pregunta sobre esta Política de Cancelación,
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
