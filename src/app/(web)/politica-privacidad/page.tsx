import React from "react";
import SeparatorSection from "@/components/ui/SeparatorSection";

export default function PoliticasPrivacidadPage() {
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
          subtitle="Última actualización: 30 de julio de 2025"
          title="Política de Privacidad"
          className=""
          transparent={true}
        />

        {/* Contenido */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Introducción */}
            <div>
              <p className="text-gray-700 leading-relaxed">
                En NAXINE, nos comprometemos a proteger tu privacidad y
                garantizar la seguridad de tus datos personales. Esta Política
                de Privacidad describe cómo recopilamos, utilizamos, almacenamos
                y protegemos tu información cuando utilizas nuestra plataforma
                de servicios profesionales.
              </p>
            </div>

            {/* Sección 1 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. ¿Quién es el responsable del tratamiento de tus datos?
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  <strong>Responsable:</strong> NAXINE (denominación comercial
                  operada por persona física empresaria)
                </p>
                <p>
                  <strong>Email de contacto:</strong> privacidad@naxine.com
                </p>
                <p>
                  <strong>Dirección postal:</strong> Calle de la Princesa 31,
                  planta 2, puerta 2, Madrid, 28008, España
                </p>
                <p>
                  El tratamiento de datos se realiza conforme al Reglamento (UE)
                  2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de
                  Datos Personales y garantía de los derechos digitales
                  (LOPDGDD).
                </p>
              </div>
            </div>

            {/* Sección 2 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. ¿Qué datos personales recogemos?
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Recopilamos diferentes tipos de datos según el uso que hagas
                  de la plataforma:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Datos de identificación:</strong> nombre, apellidos,
                    email, teléfono
                  </li>
                  <li>
                    <strong>Datos de acceso:</strong> nombre de usuario, IP,
                    idioma, país
                  </li>
                  <li>
                    <strong>Datos profesionales:</strong> titulación, número de
                    colegiación, experiencia (para profesionales)
                  </li>
                  <li>
                    <strong>Datos de reserva:</strong> fecha, modalidad
                    (online/presencial/a domicilio), especialidad
                  </li>
                  <li>
                    <strong>Datos de pago:</strong> procesados de forma segura a
                    través de Stripe. NAXINE no almacena números de tarjeta
                  </li>
                  <li>
                    <strong>Datos de navegación:</strong> cookies, preferencias,
                    historial de uso
                  </li>
                </ul>
              </div>
            </div>

            {/* Sección 3 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. ¿Con qué finalidad tratamos tus datos?
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Gestionar tu registro y acceso a la plataforma</li>
                  <li>
                    Conectar clientes y profesionales, facilitando reservas y
                    pagos
                  </li>
                  <li>
                    Enviar comunicaciones operativas y recordatorios de sesiones
                  </li>
                  <li>Fines administrativos, contables y fiscales</li>
                  <li>
                    Mejorar la experiencia de usuario (cookies analíticas,
                    personalización)
                  </li>
                  <li>
                    Cumplir con obligaciones legales (facturación, seguridad,
                    etc.)
                  </li>
                </ul>
              </div>
            </div>

            {/* Sección 4 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. ¿Cuál es la base legal para el tratamiento?
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Ejecución de contrato:</strong> para reservar
                    sesiones o prestar servicios a través de NAXINE
                  </li>
                  <li>
                    <strong>Consentimiento:</strong> al aceptar cookies o
                    recibir comunicaciones comerciales
                  </li>
                  <li>
                    <strong>Obligación legal:</strong> para cumplir con
                    normativas fiscales, contables y de protección de datos
                  </li>
                  <li>
                    <strong>Interés legítimo:</strong> para garantizar la
                    seguridad de la plataforma y prevenir fraudes
                  </li>
                </ul>
              </div>
            </div>

            {/* Sección 5 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. ¿Quiénes pueden acceder a tus datos?
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Los datos se comparten únicamente cuando es estrictamente
                  necesario:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Con profesionales registrados (si eres cliente) para
                    gestionar tu sesión
                  </li>
                  <li>Con Stripe, para el procesamiento seguro de pagos</li>
                  <li>
                    Con proveedores tecnológicos (Heroku, AWS, Auth0, Google
                    Meet), bajo contratos que garantizan confidencialidad y
                    cumplimiento RGPD
                  </li>
                  <li>
                    Con autoridades legales, en caso de requerimiento legal
                  </li>
                </ul>
              </div>
            </div>

            {/* Sección 6 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. ¿Durante cuánto tiempo conservamos tus datos?
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Datos de cuenta:</strong> mientras mantengas tu
                    registro o hasta que solicites su eliminación
                  </li>
                  <li>
                    <strong>Datos de pago:</strong> según la legislación fiscal
                    (mínimo 5 años)
                  </li>
                  <li>
                    <strong>Cookies y datos de navegación:</strong> según la
                    configuración elegida y los períodos establecidos en la
                    Política de Cookies
                  </li>
                </ul>
              </div>
            </div>

            {/* Sección 7 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. ¿Cuáles son tus derechos?
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Puedes ejercer los siguientes derechos en cualquier momento:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Derecho de acceso</li>
                  <li>Derecho de rectificación</li>
                  <li>Derecho de supresión (derecho al olvido)</li>
                  <li>Derecho a la limitación del tratamiento</li>
                  <li>Derecho a la portabilidad de datos</li>
                  <li>Derecho de oposición</li>
                </ul>
                <p>
                  Para ejercer tus derechos, escribe a:{" "}
                  <strong>privacidad@naxine.com</strong>
                </p>
                <p>
                  Si consideras que tus derechos no han sido atendidos
                  correctamente, puedes presentar una reclamación ante la
                  Agencia Española de Protección de Datos (www.aepd.es).
                </p>
              </div>
            </div>

            {/* Sección 8 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Seguridad de los datos
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  NAXINE adopta medidas técnicas y organizativas para garantizar
                  la seguridad de los datos:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cifrado SSL en toda la navegación</li>
                  <li>Autenticación segura mediante Auth0</li>
                  <li>
                    Infraestructura alojada en Heroku (AWS), con altos
                    estándares de protección
                  </li>
                  <li>Videollamadas seguras mediante Google Meet</li>
                  <li>Política de privacidad desde el diseño y por defecto</li>
                </ul>
              </div>
            </div>

            {/* Sección 9 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Menores de edad
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  NAXINE no está dirigido a menores de 18 años. Si eres menor de
                  edad, no puedes registrarte ni utilizar nuestros servicios.
                </p>
              </div>
            </div>

            {/* Sección 10 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Cambios en la política de privacidad
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>
                  NAXINE se reserva el derecho de modificar esta política para
                  adaptarla a cambios legislativos o técnicos. Los usuarios
                  serán notificados por email o al acceder a la plataforma si
                  hay cambios relevantes.
                </p>
              </div>
            </div>

            {/* Contacto */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contacto</h3>
              <p className="text-gray-700">
                Si tienes alguna pregunta sobre esta Política de Privacidad,
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
