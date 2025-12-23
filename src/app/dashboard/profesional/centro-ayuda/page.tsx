"use client";

import { BookOpen, FileText, Shield, Users, AlertCircle } from "lucide-react";

export default function CentroAyudaPage() {
  // Contenido estático de términos y condiciones para profesionales
  // NOTA: Actualizar este contenido cuando sea necesario
  const terminosYCondiciones = {
    titulo: "Términos y Condiciones para Profesionales",
    version: "v1",
    ultimaActualizacion: "2025",
    secciones: [
      {
        id: "introduccion",
        titulo: "1. Introducción",
        icono: BookOpen,
        contenido: `Bienvenido a NAXINE, la plataforma que conecta profesionales de la salud mental con pacientes que buscan servicios de calidad. Al registrarte como profesional en nuestra plataforma, aceptas cumplir con los siguientes términos y condiciones.

Estos términos establecen las reglas y directrices que rigen tu participación como profesional en NAXINE. Es importante que los leas detenidamente antes de comenzar a utilizar nuestros servicios.`,
      },
      {
        id: "registro",
        titulo: "2. Registro y Verificación",
        icono: Users,
        contenido: `Para registrarte como profesional en NAXINE, debes:

- Proporcionar información veraz, precisa y completa sobre tu formación profesional, especialidad y experiencia.
- Incluir tu número de colegiado/a válido y verificado.
- Aceptar estos términos y condiciones.
- Completar el proceso de verificación de email mediante el código de 6 dígitos que recibirás.

Una vez registrado, tu perfil quedará en estado "pendiente" hasta que un administrador verifique manualmente tu número de colegiado y apruebe tu cuenta. Solo los profesionales aprobados podrán aparecer en la plataforma pública y recibir citas.`,
      },
      {
        id: "obligaciones",
        titulo: "3. Obligaciones del Profesional",
        icono: Shield,
        contenido: `Como profesional registrado en NAXINE, te comprometes a:

- Mantener la confidencialidad y privacidad de todos los pacientes, cumpliendo con las normativas de protección de datos y secreto profesional.
- Proporcionar servicios profesionales de calidad, éticos y acordes a tu formación y especialidad.
- Mantener actualizada tu información de perfil, incluyendo horarios de disponibilidad, precios y modalidades de atención.
- Responder de manera oportuna a las solicitudes de citas y comunicaciones de los pacientes.
- Cumplir con todas las normativas legales y éticas aplicables a tu profesión.
- No utilizar la plataforma para actividades ilegales o que violen estos términos.
- Mantener la seguridad de tu cuenta y notificar inmediatamente cualquier uso no autorizado.`,
      },
      {
        id: "perfil",
        titulo: "4. Gestión de Perfil",
        icono: FileText,
        contenido: `Tu perfil profesional debe incluir:

- Información personal y de contacto actualizada.
- Especialidad y formación profesional verificable.
- Número de colegiado/a válido.
- Descripción clara de tus servicios y experiencia.
- Horarios de disponibilidad por modalidad (presencial, en línea, a domicilio).
- Precios transparentes y actualizados para tus servicios.
- Foto de perfil profesional (opcional pero recomendada).
- Video de presentación (opcional).

Eres responsable de mantener toda esta información actualizada y precisa. NAXINE se reserva el derecho de verificar y, si es necesario, solicitar documentación que respalde la información proporcionada.`,
      },
      {
        id: "citas",
        titulo: "5. Gestión de Citas",
        icono: AlertCircle,
        contenido: `Como profesional, debes:

- Confirmar o rechazar las solicitudes de citas en un plazo razonable.
- Respetar los horarios acordados con los pacientes.
- Notificar con la mayor antelación posible cualquier cancelación o cambio de cita.
- Proporcionar un servicio profesional de calidad durante todas las sesiones.
- Para citas en línea, asegurar que la plataforma de videollamada funcione correctamente y proporcionar el enlace de acceso.
- Para citas presenciales, mantener un espacio de consulta adecuado y accesible.
- Para citas a domicilio, cumplir con los horarios y zonas acordadas.`,
      },
      {
        id: "pagos",
        titulo: "6. Pagos y Comisiones",
        icono: FileText,
        contenido: `NAXINE utiliza Stripe Connect para procesar los pagos de manera segura:

- Los pacientes realizan el pago a través de la plataforma antes de la cita.
- Los fondos se mantienen en tu cuenta de Stripe Connect hasta que se complete el servicio.
- NAXINE puede aplicar una comisión por el uso de la plataforma, que será transparente y comunicada previamente.
- Debes completar el proceso de onboarding de Stripe Connect para poder recibir pagos.
- Los pagos se procesan de acuerdo con las políticas de Stripe y las normativas aplicables.`,
      },
      {
        id: "privacidad",
        titulo: "7. Privacidad y Protección de Datos",
        icono: Shield,
        contenido: `NAXINE se compromete a proteger la privacidad de todos los usuarios:

- Toda la información personal y profesional se maneja de acuerdo con nuestra Política de Privacidad.
- Debes cumplir con todas las normativas de protección de datos aplicables (RGPD, LOPD, etc.).
- No debes compartir información de pacientes fuera de la plataforma sin su consentimiento explícito.
- NAXINE puede utilizar datos agregados y anonimizados para mejorar la plataforma y generar estadísticas.`,
      },
      {
        id: "suspension",
        titulo: "8. Suspensión y Terminación",
        icono: AlertCircle,
        contenido: `NAXINE se reserva el derecho de:

- Suspender o terminar tu cuenta si violas estos términos y condiciones.
- Suspender tu cuenta si recibes múltiples quejas justificadas de pacientes.
- Suspender tu cuenta si se detecta actividad fraudulenta o ilegal.
- Requerir verificación adicional de tu información profesional en cualquier momento.

En caso de suspensión o terminación, se te notificará por email y tendrás la oportunidad de apelar la decisión según los procedimientos establecidos.`,
      },
      {
        id: "responsabilidad",
        titulo: "9. Limitación de Responsabilidad",
        icono: Shield,
        contenido: `NAXINE actúa como intermediario entre profesionales y pacientes:

- NAXINE no se hace responsable de la calidad de los servicios profesionales prestados.
- NAXINE no garantiza resultados específicos de las sesiones o tratamientos.
- Los profesionales son responsables de sus propios seguros de responsabilidad civil profesional.
- NAXINE no se hace responsable de problemas técnicos que puedan afectar las citas en línea.
- Los profesionales son responsables de mantener sus propias licencias y certificaciones actualizadas.`,
      },
      {
        id: "modificaciones",
        titulo: "10. Modificaciones de los Términos",
        icono: FileText,
        contenido: `NAXINE se reserva el derecho de modificar estos términos y condiciones en cualquier momento:

- Se te notificará por email sobre cambios significativos en los términos.
- El uso continuado de la plataforma después de los cambios implica la aceptación de los nuevos términos.
- Si no estás de acuerdo con los cambios, puedes solicitar la cancelación de tu cuenta.
- La versión actual de los términos siempre estará disponible en esta sección del dashboard.`,
      },
      {
        id: "contacto",
        titulo: "11. Contacto y Soporte",
        icono: Users,
        contenido: `Para cualquier consulta, duda o problema relacionado con estos términos y condiciones o con el uso de la plataforma:

- Utiliza la sección de "Soporte" en tu dashboard para contactar con nuestro equipo.
- Responderemos a tus consultas en un plazo razonable.
- Para asuntos urgentes, puedes contactarnos directamente a través de los canales oficiales de NAXINE.`,
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 md:px-8 py-8 md:py-10">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                Centro de Ayuda
              </h1>
              <p className="text-white/95 text-sm md:text-base lg:text-lg mb-3">
                {terminosYCondiciones.titulo}
              </p>
              <div className="flex items-center gap-4 text-white/80 text-xs md:text-sm">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Versión {terminosYCondiciones.version}
                </span>
                <span className="flex items-center gap-1.5">
                  <span>•</span>
                  Última actualización: {terminosYCondiciones.ultimaActualizacion}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {terminosYCondiciones.secciones.map((seccion, index) => {
          const IconComponent = seccion.icono;
          return (
            <div
              key={seccion.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      {seccion.titulo}
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-line">
                        {seccion.contenido}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Importante
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Estos términos y condiciones forman parte de tu acuerdo con NAXINE.
              Al utilizar la plataforma, confirmas que has leído, entendido y
              aceptado estos términos. Si tienes alguna pregunta, no dudes en
              contactarnos a través de la sección de Soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

