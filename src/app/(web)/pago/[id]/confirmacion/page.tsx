"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { citasService } from "@/services";
import Image from "next/image";
import Link from "next/link";

export default function ConfirmacionPagoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [citaData, setCitaData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obtener datos de la cita desde los query params primero (no depende de autenticación)
    const citaId = searchParams.get("citaId");
    const fecha = searchParams.get("fecha");
    const fechaISO = searchParams.get("fechaISO"); // Fecha ISO completa
    const hora = searchParams.get("hora");
    const profesionalNombre = searchParams.get("profesional");
    const servicioNombre = searchParams.get("servicio");
    const monto = searchParams.get("monto");
    const moneda = searchParams.get("moneda");

    if (citaId || (fecha && hora)) {
      // Si tenemos datos básicos, construir el objeto de confirmación
      setCitaData({
        id_cita: citaId || params.id,
        fecha: fechaISO || fecha, // Priorizar fechaISO si está disponible
        fechaISO: fechaISO, // Guardar fechaISO para formatear hora
        hora,
        profesional: profesionalNombre || "Profesional",
        servicio: servicioNombre || "Servicio",
        monto: monto ? parseFloat(monto) : 0,
        moneda: moneda || "eur", // Por defecto euros para España
      });
      setLoading(false);
    } else {
      // Si no hay datos en los params, intentar obtenerlos del backend
      // Por ahora, mostrar un mensaje genérico
      setCitaData({
        id_cita: params.id,
        fecha: "Fecha no disponible",
        hora: "Hora no disponible",
        profesional: "Profesional",
        servicio: "Servicio",
        monto: 0,
        moneda: "eur",
      });
      setLoading(false);
    }
  }, [params.id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard/cliente")}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Formatear fecha usando zona horaria de España
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr || fechaStr === "Fecha no disponible") return fechaStr;
    try {
      // Si viene como fecha ISO o con formato MySQL, interpretarla como UTC
      let fecha: Date;
      if (fechaStr.includes('T') || fechaStr.includes('Z') || fechaStr.includes('+')) {
        fecha = new Date(fechaStr);
      } else if (fechaStr.includes(' ') && !fechaStr.includes('T')) {
        // Formato MySQL DATETIME: agregar 'Z' para indicar UTC
        fecha = new Date(fechaStr + 'Z');
      } else {
        // Intentar parsear como fecha local
        fecha = new Date(fechaStr);
      }
      
      return fecha.toLocaleDateString("es-ES", {
        timeZone: "Europe/Madrid",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fechaStr;
    }
  };

  // Formatear hora usando zona horaria de España
  // Si viene fechaISO, usar esa directamente. Si viene solo horaStr, construir fecha completa
  const formatearHora = (horaStr: string, fechaISO?: string) => {
    if (!horaStr || horaStr === "Hora no disponible") {
      // Si no hay horaStr pero tenemos fechaISO, usar fechaISO directamente
      if (fechaISO) {
        try {
          const fecha = new Date(fechaISO);
          return fecha.toLocaleTimeString("es-ES", {
            timeZone: "Europe/Madrid",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } catch {
          return "Hora no disponible";
        }
      }
      return horaStr;
    }
    try {
      let fecha: Date;
      
      // Si tenemos fechaISO, usar esa directamente (ya viene en formato correcto)
      if (fechaISO) {
        fecha = new Date(fechaISO);
      } else {
        // Si solo tenemos la hora, intentar construir una fecha completa
        // Esto es un fallback, idealmente siempre deberíamos tener fechaISO
        const [hours, minutes] = horaStr.split(":");
        const hour = parseInt(hours);
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes || '00'} ${period}`;
      }
      
      return fecha.toLocaleTimeString("es-ES", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error('[formatearHora] Error:', error, { horaStr, fechaISO });
      return horaStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Card de confirmación */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header con checkmark animado */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">¡Pago Confirmado!</h1>
            <p className="text-green-50 text-lg">
              Tu cita ha sido reservada exitosamente
            </p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Información de la cita */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Detalles de tu cita
              </h2>

              <div className="space-y-4">
                {/* Profesional */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Profesional</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {citaData?.profesional}
                    </p>
                  </div>
                </div>

                {/* Servicio */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Servicio</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {citaData?.servicio}
                    </p>
                  </div>
                </div>

                {/* Fecha */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Fecha</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatearFecha(citaData?.fechaISO || citaData?.fecha || "")}
                    </p>
                  </div>
                </div>

                {/* Hora */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Hora</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatearHora(citaData?.hora || "", citaData?.fechaISO)}
                    </p>
                  </div>
                </div>

                {/* Monto */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Monto pagado</p>
                    <p className="text-lg font-semibold text-gray-900">
                      €{citaData?.monto?.toFixed(2) || "0.00"} EUR
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Próximos pasos
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Recibirás un correo de confirmación con todos los detalles</li>
                    <li>• Te enviaremos un recordatorio 24 horas antes de tu cita</li>
                    <li>• Puedes ver y gestionar tu cita desde tu dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard/cliente"
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-bold hover:bg-primary-dark transition-colors text-center"
                >
                  Ir a mi Dashboard
                </Link>
              ) : (
                <Link
                  href="/iniciar-sesion"
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-bold hover:bg-primary-dark transition-colors text-center"
                >
                  Iniciar Sesión
                </Link>
              )}
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Ir al Inicio
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de agradecimiento */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Gracias por confiar en nosotros. ¡Te esperamos!
          </p>
        </div>
      </div>
    </div>
  );
}

