"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { citasService, pagosService } from "@/services";
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
    const fetchCitaData = async () => {
      // Obtener datos de la cita desde los query params primero (no depende de autenticación)
      const citaId = searchParams.get("citaId");
      const fecha = searchParams.get("fecha");
      const fechaISO = searchParams.get("fechaISO");
      const hora = searchParams.get("hora");
      const profesionalNombre = searchParams.get("profesional");
      const servicioNombre = searchParams.get("servicio");
      const professionalImage = searchParams.get("professionalImage") || "";
      const professionalCity = searchParams.get("professionalCity") || "";
      const duration = searchParams.get("duration") || "1h";
      const monto = searchParams.get("monto");
      const moneda = searchParams.get("moneda") || "EUR";
      let tipoAtencion = searchParams.get("tipoAtencion") || "presencial";
      const direccionConsultorio = searchParams.get("direccionConsultorio") || "";
      let linkVideollamada = searchParams.get("linkVideollamada") || "";
      const direccionDomicilio = searchParams.get("direccionDomicilio") || "";

      // Función para obtener el link de Google Meet del backend
      const obtenerLinkVideollamada = async (): Promise<string> => {
        if (!isAuthenticated || !user) return linkVideollamada;
        
        try {
          const pagoId = params.id;
          if (!pagoId) return linkVideollamada;

          // Obtener el pago para obtener el id_cita
          const pagoResponse = await pagosService.getPagoPorId(pagoId);

          // Nota: apiClient envuelve la respuesta del backend dentro de `data`
          // pagoResponse.data === { success: true, data: { pago: {...} } }
          const pagoApiResponse: any = pagoResponse.data;
          const pagoObj: any = pagoApiResponse?.data?.pago || pagoApiResponse?.pago || null;
          const idCita = pagoObj?.id_cita ?? null;

          if (pagoResponse.success && idCita) {
            
            // Obtener la cita completa usando el id_cita
            const citaResponse = await citasService.getCitaPorId(idCita);

            const citaApiResponse: any = citaResponse.data;
            const cita: any = citaApiResponse?.data?.cita || citaApiResponse?.cita || null;

            if (citaResponse.success && cita) {
              
              // Actualizar tipoAtencion si viene de la cita
              if (cita.tipo_atencion) {
                tipoAtencion = cita.tipo_atencion;
              }
              
              // Retornar el link si está disponible
              if (cita.link_videollamada) {
                return cita.link_videollamada;
              }
            }
          }
        } catch (error) {
          // Error silencioso - el retry lo manejará
        }
        
        return linkVideollamada;
      };

      // Si la cita es en línea, intentar obtener el link del backend (siempre, incluso si ya hay uno en params)
      if (tipoAtencion === "en_linea") {
        const linkObtenido = await obtenerLinkVideollamada();
        if (linkObtenido) {
          linkVideollamada = linkObtenido;
        }
      }

      if (citaId || (fecha && hora)) {
        // Si tenemos datos básicos, construir el objeto de confirmación
        const datosCita = {
          id_cita: citaId || params.id,
          fecha: fechaISO || fecha,
          fechaISO: fechaISO,
          hora,
          profesional: profesionalNombre || "Profesional",
          servicio: servicioNombre || "Servicio",
          professionalImage,
          professionalCity,
          duration,
          monto: monto ? parseFloat(monto) : 0,
          moneda: moneda.toUpperCase(),
          tipoAtencion,
          direccionConsultorio,
          linkVideollamada,
          direccionDomicilio,
        };
        
        setCitaData(datosCita);
        setLoading(false);
      } else {
        // Si no hay datos en los params, intentar obtenerlos del backend
        setCitaData({
          id_cita: params.id,
          fecha: "Fecha no disponible",
          hora: "Hora no disponible",
          profesional: "Profesional",
          servicio: "Servicio",
          professionalImage: "",
          professionalCity: "",
          duration: "1h",
          monto: 0,
          moneda: "EUR",
          tipoAtencion: "presencial",
          direccionConsultorio: "",
          linkVideollamada: "",
          direccionDomicilio: "",
        });
        setLoading(false);
      }
    };

    fetchCitaData();
  }, [params.id, searchParams, isAuthenticated, user]);

  // Efecto adicional para intentar obtener el link de Google Meet con retry si no está disponible
  useEffect(() => {
    if (!citaData || citaData.tipoAtencion !== "en_linea" || citaData.linkVideollamada || !isAuthenticated || !user) {
      return;
    }

    // Intentar obtener el link con retry (máximo 10 intentos, cada 3 segundos = 30 segundos total)
    let intentos = 0;
    const maxIntentos = 10;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const intentarObtenerLink = async () => {
      if (intentos >= maxIntentos) {
        return;
      }

      try {
        const pagoId = params.id;
        if (!pagoId) {
          return;
        }

        const pagoResponse = await pagosService.getPagoPorId(pagoId);

        const pagoApiResponse: any = pagoResponse.data;
        const pagoObj: any = pagoApiResponse?.data?.pago || pagoApiResponse?.pago || null;
        const idCita = pagoObj?.id_cita ?? null;

        if (pagoResponse.success && idCita) {
          const citaResponse = await citasService.getCitaPorId(idCita);
          
          const citaApiResponse: any = citaResponse.data;
          const cita: any = citaApiResponse?.data?.cita || citaApiResponse?.cita || null;
          
          if (citaResponse.success && cita && cita.link_videollamada) {
            const nuevoLink = cita.link_videollamada;
            // Actualizar el estado con el link obtenido
            setCitaData((prev) => ({
              ...prev,
              linkVideollamada: nuevoLink,
            }));
            return; // Salir del retry si se obtuvo el link
          }
        }

        // Si no se obtuvo el link, intentar de nuevo después de 3 segundos
        intentos++;
        if (intentos < maxIntentos) {
          timeoutId = setTimeout(intentarObtenerLink, 3000);
        }
      } catch (error) {
        intentos++;
        if (intentos < maxIntentos) {
          timeoutId = setTimeout(intentarObtenerLink, 3000);
        }
      }
    };

    // Iniciar el primer intento después de 2 segundos (dar tiempo al webhook)
    timeoutId = setTimeout(intentarObtenerLink, 2000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [citaData?.tipoAtencion, citaData?.linkVideollamada, isAuthenticated, user, params.id]);

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

  // Formatear fecha completa con hora (ej: "Viernes 16 July 2025 a las 5:00pm")
  const formatearFechaCompleta = () => {
    if (!citaData?.fechaISO && !citaData?.fecha) return "Fecha no disponible";
    
    try {
      const fechaStr = citaData.fechaISO || citaData.fecha;
      let fecha: Date;
      
      if (fechaStr.includes('T') || fechaStr.includes('Z') || fechaStr.includes('+')) {
        fecha = new Date(fechaStr);
      } else if (fechaStr.includes(' ') && !fechaStr.includes('T')) {
        fecha = new Date(fechaStr + 'Z');
      } else {
        fecha = new Date(fechaStr);
      }
      
      const fechaFormateada = fecha.toLocaleDateString("es-ES", {
        timeZone: "Europe/Madrid",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      // Formatear hora
      let horaFormateada = "";
      if (citaData?.hora) {
        // Si la hora viene en formato 12h (ej: "5:00pm"), usarla directamente
        if (citaData.hora.includes("pm") || citaData.hora.includes("am")) {
          horaFormateada = citaData.hora;
        } else {
          // Si viene en formato 24h, convertir a 12h
          const [hours, minutes] = citaData.hora.split(":").map(Number);
          const period = hours >= 12 ? "pm" : "am";
          const hours12 = hours % 12 || 12;
          horaFormateada = `${hours12}:${minutes.toString().padStart(2, "0")}${period}`;
        }
      } else if (citaData?.fechaISO) {
        horaFormateada = fecha.toLocaleTimeString("es-ES", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      
      return horaFormateada ? `${fechaFormateada} a las ${horaFormateada}` : fechaFormateada;
    } catch {
      return "Fecha no disponible";
    }
  };

  // Calcular hora de fin
  const calcularHoraFin = () => {
    if (!citaData?.hora || !citaData?.duration) return "";
    
    try {
      let horas24 = 0;
      let minutos = 0;
      const horaStr = citaData.hora;
      
      // Convertir hora a formato 24h si viene en 12h
      if (horaStr.includes("pm") || horaStr.includes("am")) {
        const [timePart, period] = horaStr.replace(/(am|pm)/i, "").split(/(am|pm)/i);
        const [h, m] = timePart.split(":").map(Number);
        horas24 = period.toLowerCase() === "pm" && h !== 12 ? h + 12 : (period.toLowerCase() === "am" && h === 12 ? 0 : h);
        minutos = m;
      } else {
        [horas24, minutos] = horaStr.split(":").map(Number);
      }
      
      const duracionMinutos = parseInt(citaData.duration.replace(/\D/g, "")) || 60;
      const fechaInicio = new Date();
      fechaInicio.setHours(horas24, minutos, 0, 0);
      const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
      const endHours = fechaFin.getHours();
      const endMinutes = fechaFin.getMinutes();
      const period = endHours >= 12 ? "pm" : "am";
      const hours12 = endHours % 12 || 12;
      return `${hours12}:${endMinutes.toString().padStart(2, "0")}${period}`;
    } catch {
      return "";
    }
  };

  const fechaCompleta = formatearFechaCompleta();
  const horaFin = calcularHoraFin();
  const referenciaCita = citaData?.id_cita || params.id || "N/A";

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-primary text-sm font-medium mb-2">¡Bien hecho!</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Cita Confirmada</h1>
        </div>

        {/* Fecha y hora */}
        <div className="mb-4">
          <p className="text-xl font-bold text-gray-900">{fechaCompleta}</p>
        </div>

        {/* Badge de confirmado */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-semibold">Confirmado</span>
          </div>
        </div>

        {/* Información del profesional y sesión */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            {/* Foto de perfil */}
            <div className="flex-shrink-0">
              {citaData?.professionalImage ? (
                <Image
                  src={citaData.professionalImage}
                  alt={citaData?.profesional || "Profesional"}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                  {citaData?.profesional
                    ? citaData.profesional
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "P"}
                </div>
              )}
            </div>

            {/* Información izquierda */}
            <div className="flex-1">
              <p className="font-bold text-gray-900 mb-1">{citaData?.servicio || "Servicio"}</p>
              <p className="text-gray-900 mb-1">{citaData?.profesional || "Profesional"}</p>
              <p className="text-sm text-gray-600">Cita ref. #: {referenciaCita}</p>
            </div>

            {/* Información derecha */}
            <div className="text-right">
              {citaData?.tipoAtencion !== "en_linea" && (
                <p className="font-bold text-gray-900 mb-1">{citaData?.professionalCity || "Ciudad"}</p>
              )}
              {citaData?.tipoAtencion === "en_linea" && (
                <p className="font-bold text-green-600 mb-1">Videollamada en línea</p>
              )}
              {horaFin && (
                <p className="text-sm text-gray-600">
                  {citaData?.duration || "1h"} duración, termina a las {horaFin}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información según tipo de atención */}
        {citaData?.tipoAtencion === "presencial" && citaData?.direccionConsultorio && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <p className="font-semibold text-blue-900 mb-1">Dirección del consultorio</p>
                <p className="text-sm text-blue-800">{citaData.direccionConsultorio}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* NO mostrar dirección del consultorio si es en línea */}

        {citaData?.tipoAtencion === "en_linea" && citaData?.linkVideollamada && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-purple-900 mb-1">Videollamada en línea</p>
                <a
                  href={citaData.linkVideollamada}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-700 hover:text-purple-900 underline break-all"
                >
                  {citaData.linkVideollamada}
                </a>
                <p className="text-xs text-purple-600 mt-1">
                  Haz clic en el enlace para unirte a la videollamada
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Mostrar mensaje si es en línea pero no hay link aún */}
        {citaData?.tipoAtencion === "en_linea" && !citaData?.linkVideollamada && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
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
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 mb-1">Generando link de videollamada</p>
                <p className="text-sm text-yellow-800">
                  El link de Google Meet se está generando. Recibirás un correo electrónico con el enlace cuando esté listo.
                </p>
              </div>
            </div>
          </div>
        )}

        {citaData?.tipoAtencion === "a_domicilio" && citaData?.direccionDomicilio && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <div>
                <p className="font-semibold text-green-900 mb-1">Atención a domicilio</p>
                <p className="text-sm text-green-800">{citaData.direccionDomicilio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje sobre correo */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-700">
                Recibirás un correo electrónico con todos los detalles completos de tu cita, incluyendo la información de contacto y cualquier instrucción adicional.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de pago */}
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="space-y-4">
            {/* Primera fila: Servicio */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-300">
              <div>
                <p className="font-bold text-gray-900">{citaData?.servicio || "Servicio"}</p>
                <p className="text-sm text-gray-600">{citaData?.duration || "1h"}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-900">
                  {citaData?.moneda === "EUR" ? "EUR" : "USD"} {citaData?.monto?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>

            {/* Segunda fila: Impuestos */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Impuestos</p>
              <p className="text-gray-900">0</p>
            </div>

            {/* Tercera fila: Total */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-300">
              <p className="font-bold text-gray-900">Total</p>
              <p className="font-bold text-gray-900">
                {citaData?.moneda === "EUR" ? "EUR" : "USD"} {citaData?.monto?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard/cliente"
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center"
            >
              Ir a mi Dashboard
            </Link>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center"
            >
              Iniciar Sesión
            </Link>
          )}
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

