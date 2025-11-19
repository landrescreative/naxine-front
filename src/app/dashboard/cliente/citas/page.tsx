"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { appointmentsService, citasService } from "@/services";
import { ApiAppointment } from "@/services/types/api";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import PendingSessionsTable from "@/components/dashboard/PendingSessionsTable";
import { lazyLoad } from "@/lib/lazy-loading";
import {
  UpcomingSessionsSkeleton,
  SessionCalendarSkeleton,
  PendingSessionsTableSkeleton,
} from "@/components/dashboard/Skeletons";

// Lazy load del modal pesado - solo se carga cuando se necesita
const AppointmentDetailModal = lazyLoad(() => import("@/components/dashboard/AppointmentDetailModal"));

// Interfaces para los componentes
interface UpcomingSession {
  id: string;
  time: string;
  professional: string;
  specialty: string;
  description: string;
  isToday: boolean;
}

interface CalendarAppointment {
  id: string;
  date: number; // Día del mes (1-31)
  month?: number; // Mes (0-11, opcional para compatibilidad)
  year?: number; // Año (opcional para compatibilidad)
  dateTime?: string; // Fecha completa ISO string (preferido)
  professional: string;
  specialty: string;
  time: string;
}

interface PendingSession {
  id: string;
  professional: {
    name: string;
    avatar?: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed";
  date: string;
  time: string;
  category: string;
  modality: string;
  product: string;
}

// Función helper para filtrar citas del cliente y validar fechas
const filterClientAppointments = (
  citasArray: any[],
  expectedClientId: string | null = null
): any[] => {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(now.getFullYear() + 1);

  return citasArray.filter((cita: any) => {
    // Verificar que la cita tenga id_cliente
    if (!cita.id_cliente) {
      console.warn("[CitasPage] Cita sin id_cliente:", cita);
      return false;
    }

    // Si tenemos el id_cliente esperado, verificar que coincida
    if (expectedClientId && String(cita.id_cliente) !== expectedClientId) {
      console.warn(
        "[CitasPage] Cita con id_cliente diferente al esperado:",
        cita.id_cliente,
        "vs",
        expectedClientId
      );
      return false;
    }

    // Verificar que la fecha sea válida y razonable
    const fechaInicio = cita.fecha_inicio || cita.dateTime;
    if (!fechaInicio) {
      console.warn("[CitasPage] Cita sin fecha_inicio:", cita);
      return false;
    }

    const fechaInicioDate = new Date(fechaInicio);
    if (isNaN(fechaInicioDate.getTime())) {
      console.warn("[CitasPage] Cita con fecha_inicio inválida:", fechaInicio);
      return false;
    }

    // Filtrar citas fuera del rango razonable (1 año atrás a 1 año adelante)
    if (fechaInicioDate < oneYearAgo || fechaInicioDate > oneYearFromNow) {
      console.warn(
        "[CitasPage] Cita fuera del rango de fechas razonable:",
        fechaInicio,
        "fecha actual:",
        now.toISOString()
      );
      return false;
    }

    return true;
  });
};

export default function CitasPage() {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<ApiAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar citas del cliente
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar que el token esté disponible antes de hacer peticiones
        const userData = localStorage.getItem("user");
        if (!userData) {
          setError("No se encontró información de sesión. Por favor, inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);
        if (!parsedUser.token) {
          setError("Token de autenticación no disponible. Por favor, inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        // Intentar primero con el endpoint de citas del backend
        console.log(
          "[CitasPage] Intentando cargar citas del cliente:",
          user.id
        );
        const citasResponse = await citasService.getCitasCliente(user.id);

        console.log("[CitasPage] Respuesta de citasService:", citasResponse);

        if (citasResponse.success && citasResponse.data) {
          console.log("[CitasPage] Citas recibidas:", citasResponse.data);

          // El backend devuelve { success: true, data: { citas: [], id_cliente: "...", paginacion: {...} } }
          // El API client envuelve esto de nuevo, así que citasResponse.data es { success: true, data: {...} }
          // Necesitamos acceder a citasResponse.data.data.citas
          const dataObj = citasResponse.data as any;

          // Intentar acceder a data.data.citas primero (si el backend envuelve la respuesta)
          // Si no existe, intentar data.citas directamente
          let citasArray: any[] = [];
          let idClienteDelBackend: string | null = null;

          if (dataObj?.data?.citas && Array.isArray(dataObj.data.citas)) {
            citasArray = dataObj.data.citas;
            idClienteDelBackend = String(dataObj.data.id_cliente || "");
            console.log("[CitasPage] Citas encontradas en data.data.citas");
            console.log(
              "[CitasPage] id_cliente del backend:",
              idClienteDelBackend
            );
          } else if (dataObj?.citas && Array.isArray(dataObj.citas)) {
            citasArray = dataObj.citas;
            idClienteDelBackend = String(dataObj.id_cliente || "");
            console.log("[CitasPage] Citas encontradas en data.citas");
            console.log(
              "[CitasPage] id_cliente del backend:",
              idClienteDelBackend
            );
          } else if (Array.isArray(dataObj)) {
            citasArray = dataObj;
            console.log("[CitasPage] data es directamente un array");
          }

          console.log("[CitasPage] Array de citas extraído:", citasArray);
          console.log(
            "[CitasPage] Longitud del array antes de filtrar:",
            citasArray.length
          );

          // Filtrar citas para asegurar que pertenezcan al cliente correcto
          // y que tengan fechas razonables (no más de 1 año en el pasado o futuro)
          const filteredCitas = filterClientAppointments(
            citasArray,
            idClienteDelBackend
          );

          console.log(
            "[CitasPage] Citas después de filtrar:",
            filteredCitas.length
          );
          console.log(
            "[CitasPage] Citas filtradas (removidas):",
            citasArray.length - filteredCitas.length
          );

          // Mapear citas del backend al formato ApiAppointment
          // El backend devuelve: profesional_nombre, pago_monto, fecha_creacion, fecha_actualizacion, tipo_atencion
          const mappedAppointments: ApiAppointment[] = filteredCitas.map(
            (cita: any) => {
              console.log(`[CitasPage] Mapeando cita ${cita.id_cita}:`, {
                tipo_atencion: cita.tipo_atencion,
                estado: cita.estado,
                link_videollamada: cita.link_videollamada,
                plataforma: cita.plataforma,
                domicilio_consultorio: cita.domicilio_consultorio,
                cita_completa: cita, // Log completo para debug
              });

              // Convertir pago_monto de string a number
              const monto = cita.pago_monto ? parseFloat(cita.pago_monto) : 0;

              // Convertir fecha_inicio de MySQL a formato ISO UTC
              // MySQL devuelve fechas como "2025-11-18 05:00:00" (sin zona horaria)
              // Necesitamos interpretarlas como UTC agregando '.000Z'
              let fechaInicioISO = cita.fecha_inicio;
              if (typeof fechaInicioISO === "string") {
                const fechaStr = fechaInicioISO.toString();
                if (
                  fechaStr.includes(" ") &&
                  !fechaStr.includes("T") &&
                  !fechaStr.includes("Z")
                ) {
                  // Formato MySQL DATETIME: convertir a ISO UTC
                  // '2025-11-14 04:00:00' -> '2025-11-14T04:00:00.000Z'
                  fechaInicioISO = fechaStr
                    .replace(" ", "T")
                    .replace(/(:\d{2})$/, "$1.000Z");
                } else if (
                  fechaStr.includes("T") &&
                  !fechaStr.includes("Z") &&
                  !fechaStr.includes("+")
                ) {
                  // Si ya tiene 'T' pero no tiene 'Z' ni offset, agregar '.000Z'
                  fechaInicioISO =
                    fechaStr + (fechaStr.includes(".") ? "Z" : ".000Z");
                }
              }

              return {
                id: String(cita.id_cita),
                orderNumber: `#${cita.id_cita}`,
                dateTime: fechaInicioISO,
                status:
                  cita.estado === "confirmada"
                    ? "confirmed"
                    : cita.estado === "pendiente"
                    ? "pending"
                    : cita.estado === "cancelada"
                    ? "cancelled"
                    : cita.estado === "completada"
                    ? "completed"
                    : "pending",
                product: {
                  id: String(cita.id_precio || cita.id_cita), // Usar id_cita como fallback si no hay id_precio
                  name: "Servicio", // El backend no devuelve nombre_servicio directamente
                  price: monto,
                  description: `Cita de ${cita.duracion || 60} minutos`,
                  category: "Especialidad", // El backend no devuelve especialidad directamente
                },
                professional: {
                  id: String(cita.id_profesional),
                  name: cita.profesional_nombre || "Profesional",
                  email: "",
                  phone: "",
                  specialty: "Especialidad", // El backend no devuelve especialidad directamente
                },
                client: {
                  id: String(cita.id_cliente),
                  name: user.name || "",
                  email: user.email || "",
                  phone: "",
                },
                payment: {
                  method: "",
                  cardNumber: "",
                  expiryDate: "",
                  cardholderName: "",
                  subtotal: monto,
                  taxes: 0,
                  total: monto,
                },
                // Mapear tipo_atencion a modality
                modality:
                  cita.tipo_atencion === "en_linea"
                    ? "online"
                    : cita.tipo_atencion === "presencial"
                    ? "in-person"
                    : cita.tipo_atencion === "a_domicilio"
                    ? "home-visit"
                    : "online", // Fallback por defecto
                tipo_atencion: cita.tipo_atencion || null, // Guardar tipo_atencion para uso posterior
                link_videollamada: cita.link_videollamada || null, // Link de Google Meet si es en línea
                plataforma: cita.plataforma || null, // Plataforma de videollamada
                direccion_consultorio: cita.domicilio_consultorio || null, // Dirección del consultorio si es presencial
                notes: cita.notas || "",
                createdAt: cita.fecha_creacion || cita.created_at,
                updatedAt: cita.fecha_actualizacion || cita.updated_at,
              };
            }
          );
          console.log(
            "[CitasPage] Citas mapeadas finales:",
            mappedAppointments.length
          );
          setAppointments(mappedAppointments);
        } else {
          console.warn(
            "[CitasPage] Endpoint de citas falló:",
            citasResponse.error
          );

          // Si el error es del backend (500 o error SQL), mostrar mensaje apropiado
          const errorMsg = citasResponse.error || "Error al cargar las citas";

          if (
            errorMsg.includes("Unknown column") ||
            errorMsg.includes("500") ||
            errorMsg.includes("Error interno")
          ) {
            // Error del backend - mostrar mensaje amigable pero no bloquear la UI
            console.warn(
              "[CitasPage] Error del backend detectado, mostrando mensaje pero permitiendo continuar"
            );
            setError(
              "El servidor está experimentando problemas técnicos. Por favor, intenta más tarde o contacta al soporte."
            );
            // No intentar con appointments ya que también fallará
            setAppointments([]); // Lista vacía para que muestre el mensaje de "no hay citas"
          } else {
            // Otro tipo de error, intentar con appointments como fallback
            try {
              const response = await appointmentsService.getClientAppointments(
                user.id,
                {
                  page: 1,
                  limit: 100,
                }
              );

              console.log(
                "[CitasPage] Respuesta de appointmentsService:",
                response
              );

              if (response.success && response.data) {
                const appointmentsData = response.data.data || [];
                // Filtrar las citas del fallback también
                // Para ApiAppointment, verificamos client.id y dateTime
                const now = new Date();
                const oneYearAgo = new Date(now);
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                const oneYearFromNow = new Date(now);
                oneYearFromNow.setFullYear(now.getFullYear() + 1);

                const filteredAppointments = appointmentsData.filter(
                  (apt: ApiAppointment) => {
                    // Verificar que tenga client.id
                    if (!apt.client?.id) {
                      console.warn("[CitasPage] Cita sin client.id:", apt);
                      return false;
                    }

                    // Verificar fecha
                    if (!apt.dateTime) {
                      console.warn("[CitasPage] Cita sin dateTime:", apt);
                      return false;
                    }

                    const fechaInicio = new Date(apt.dateTime);
                    if (isNaN(fechaInicio.getTime())) {
                      console.warn(
                        "[CitasPage] Cita con dateTime inválido:",
                        apt.dateTime
                      );
                      return false;
                    }

                    // Filtrar citas fuera del rango razonable
                    if (
                      fechaInicio < oneYearAgo ||
                      fechaInicio > oneYearFromNow
                    ) {
                      console.warn(
                        "[CitasPage] Cita fuera del rango de fechas razonable:",
                        apt.dateTime
                      );
                      return false;
                    }

                    return true;
                  }
                );
                setAppointments(filteredAppointments);
              } else {
                setError(errorMsg);
              }
            } catch (fallbackErr) {
              console.error("[CitasPage] Error en fallback:", fallbackErr);
              setError(errorMsg);
            }
          }
        }
      } catch (err: any) {
        console.error("[CitasPage] Error loading appointments:", err);

        // Si es un error de red o conexión, intentar con el endpoint alternativo
        if (
          err.message?.includes("fetch") ||
          err.message?.includes("network") ||
          err.message?.includes("Failed to fetch")
        ) {
          try {
            console.log(
              "[CitasPage] Error de red detectado, intentando endpoint alternativo"
            );
            const response = await appointmentsService.getClientAppointments(
              user.id,
              {
                page: 1,
                limit: 100,
              }
            );

            if (response.success && response.data) {
              const appointmentsData = response.data.data || [];
              // Filtrar las citas del fallback también
              // Para ApiAppointment, verificamos client.id y dateTime
              const now = new Date();
              const oneYearAgo = new Date(now);
              oneYearAgo.setFullYear(now.getFullYear() - 1);
              const oneYearFromNow = new Date(now);
              oneYearFromNow.setFullYear(now.getFullYear() + 1);

              const filteredAppointments = appointmentsData.filter(
                (apt: ApiAppointment) => {
                  // Verificar que tenga client.id
                  if (!apt.client?.id) {
                    console.warn("[CitasPage] Cita sin client.id:", apt);
                    return false;
                  }

                  // Verificar fecha
                  if (!apt.dateTime) {
                    console.warn("[CitasPage] Cita sin dateTime:", apt);
                    return false;
                  }

                  const fechaInicio = new Date(apt.dateTime);
                  if (isNaN(fechaInicio.getTime())) {
                    console.warn(
                      "[CitasPage] Cita con dateTime inválido:",
                      apt.dateTime
                    );
                    return false;
                  }

                  // Filtrar citas fuera del rango razonable
                  if (
                    fechaInicio < oneYearAgo ||
                    fechaInicio > oneYearFromNow
                  ) {
                    console.warn(
                      "[CitasPage] Cita fuera del rango de fechas razonable:",
                      apt.dateTime
                    );
                    return false;
                  }

                  return true;
                }
              );
              setAppointments(filteredAppointments);
            } else {
              setError(
                "No se pudieron cargar las citas. Por favor, verifica tu conexión e intenta más tarde."
              );
              setAppointments([]);
            }
          } catch (fallbackErr: any) {
            console.error("[CitasPage] Error en fallback:", fallbackErr);
            setError(
              "Error al conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente."
            );
            setAppointments([]);
          }
        } else {
          // Error del backend, mostrar mensaje apropiado
          setError(
            "El servidor está experimentando problemas técnicos. Por favor, intenta más tarde."
          );
          setAppointments([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [isAuthenticated, user]);

  // Función para abrir el modal con los detalles de una cita
  const handleViewDetails = (appointmentId: string) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setIsModalOpen(true);
    }
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // Función para recargar citas después de reagendar
  const handleReschedule = async () => {
    // Recargar las citas
    if (isAuthenticated && user) {
      try {
        setLoading(true);
        setError(null);
        const citasResponse = await citasService.getCitasCliente(user.id);
        if (citasResponse.success && citasResponse.data) {
          const dataObj = citasResponse.data as any;
          let citasArray: any[] = [];
          let idClienteDelBackend: string | null = null;

          if (dataObj?.data?.citas && Array.isArray(dataObj.data.citas)) {
            citasArray = dataObj.data.citas;
            idClienteDelBackend = String(dataObj.data.id_cliente || "");
          } else if (dataObj?.citas && Array.isArray(dataObj.citas)) {
            citasArray = dataObj.citas;
            idClienteDelBackend = String(dataObj.id_cliente || "");
          } else if (Array.isArray(dataObj)) {
            citasArray = dataObj;
          }

          const filteredCitas = filterClientAppointments(
            citasArray,
            idClienteDelBackend
          );

          const mappedAppointments: ApiAppointment[] = filteredCitas.map(
            (cita: any) => {
              const monto = cita.pago_monto ? parseFloat(cita.pago_monto) : 0;
              let fechaInicioISO = cita.fecha_inicio;
              if (typeof fechaInicioISO === "string") {
                const fechaStr = fechaInicioISO.toString();
                if (
                  fechaStr.includes(" ") &&
                  !fechaStr.includes("T") &&
                  !fechaStr.includes("Z")
                ) {
                  fechaInicioISO = fechaStr
                    .replace(" ", "T")
                    .replace(/(:\d{2})$/, "$1.000Z");
                } else if (
                  fechaStr.includes("T") &&
                  !fechaStr.includes("Z") &&
                  !fechaStr.includes("+")
                ) {
                  fechaInicioISO =
                    fechaStr + (fechaStr.includes(".") ? "Z" : ".000Z");
                }
              }

              return {
                id: String(cita.id_cita),
                orderNumber: `#${cita.id_cita}`,
                dateTime: fechaInicioISO,
                status:
                  cita.estado === "confirmada"
                    ? "confirmed"
                    : cita.estado === "pendiente"
                    ? "pending"
                    : cita.estado === "cancelada"
                    ? "cancelled"
                    : cita.estado === "completada"
                    ? "completed"
                    : "pending",
                product: {
                  id: String(cita.id_precio || cita.id_cita),
                  name: "Servicio",
                  price: monto,
                  description: `Cita de ${cita.duracion || 60} minutos`,
                  category: "Especialidad",
                },
                professional: {
                  id: String(cita.id_profesional),
                  name: cita.profesional_nombre || "Profesional",
                  email: "",
                  phone: "",
                  specialty: "Especialidad",
                },
                client: {
                  id: String(cita.id_cliente),
                  name: user.name || "",
                  email: user.email || "",
                  phone: "",
                },
                payment: {
                  method: "",
                  cardNumber: "",
                  expiryDate: "",
                  cardholderName: "",
                  subtotal: monto,
                  taxes: 0,
                  total: monto,
                },
                modality:
                  cita.tipo_atencion === "en_linea"
                    ? "online"
                    : cita.tipo_atencion === "presencial"
                    ? "in-person"
                    : cita.tipo_atencion === "a_domicilio"
                    ? "home-visit"
                    : "online",
                tipo_atencion: cita.tipo_atencion || null,
                link_videollamada: cita.link_videollamada || null,
                plataforma: cita.plataforma || null,
                direccion_consultorio: cita.domicilio_consultorio || null,
                notes: cita.notas || "",
                createdAt: cita.fecha_creacion || cita.created_at,
                updatedAt: cita.fecha_actualizacion || cita.updated_at,
              };
            }
          );
          setAppointments(mappedAppointments);
        }
      } catch (err: any) {
        console.error("[CitasPage] Error al recargar citas después de reagendar:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Transformar citas a formato de próximas sesiones
  const upcomingSessionsData = useMemo((): UpcomingSession[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.dateTime);
        return (
          (apt.status === "confirmed" || apt.status === "pending") &&
          aptDate >= now
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.dateTime).getTime();
        const dateB = new Date(b.dateTime).getTime();
        return dateA - dateB;
      })
      .slice(0, 5)
      .map((appointment) => {
        // Interpretar fecha como UTC si viene de MySQL sin zona horaria
        let appointmentDate: Date;
        const fechaStr = appointment.dateTime?.toString() || "";
        if (
          fechaStr.includes("T") ||
          fechaStr.includes("Z") ||
          fechaStr.includes("+")
        ) {
          appointmentDate = new Date(appointment.dateTime);
        } else if (fechaStr.includes(" ") && !fechaStr.includes("T")) {
          // Formato MySQL DATETIME: agregar 'Z' para indicar UTC
          appointmentDate = new Date(fechaStr + "Z");
        } else {
          appointmentDate = new Date(appointment.dateTime);
        }

        // Crear fecha solo con día/mes/año en zona horaria de España para comparaciones
        const fechaEspana = appointmentDate.toLocaleDateString("es-ES", {
          timeZone: "Europe/Madrid",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const [day, month, year] = fechaEspana.split("/");
        const appointmentDateOnly = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );

        const isToday = appointmentDateOnly.getTime() === today.getTime();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = appointmentDateOnly.getTime() === tomorrow.getTime();

        let timeDisplay = "";
        if (isToday) {
          timeDisplay = `Hoy ${appointmentDate.toLocaleTimeString("es-ES", {
            timeZone: "Europe/Madrid",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}`;
        } else if (isTomorrow) {
          timeDisplay = `Mañana ${appointmentDate.toLocaleTimeString("es-ES", {
            timeZone: "Europe/Madrid",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}`;
        } else {
          timeDisplay =
            appointmentDate.toLocaleDateString("es-ES", {
              timeZone: "Europe/Madrid",
              day: "numeric",
              month: "long",
            }) +
            ` ${appointmentDate.toLocaleTimeString("es-ES", {
              timeZone: "Europe/Madrid",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}`;
        }

        const professionalName =
          (appointment.professional as any)?.name ||
          (appointment.professional as any)?.fullName ||
          "Profesional";
        const specialty =
          (appointment.professional as any)?.specialty || "Especialidad";

        // Determinar el tipo de cita para el texto de descripción
        const tipoAtencion = (appointment as any).tipo_atencion || null;
        const modality = appointment.modality || "online";

        let tipoCitaTexto = "";
        if (tipoAtencion === "presencial") {
          tipoCitaTexto = "cita presencial";
        } else if (tipoAtencion === "a_domicilio") {
          tipoCitaTexto = "cita a domicilio";
        } else if (tipoAtencion === "en_linea" || modality === "online") {
          tipoCitaTexto = "videollamada";
        } else if (modality === "in-person") {
          tipoCitaTexto = "cita presencial";
        } else if (modality === "home-visit") {
          tipoCitaTexto = "cita a domicilio";
        } else {
          tipoCitaTexto = "cita";
        }

        return {
          id: appointment.id,
          time: timeDisplay,
          professional: professionalName,
          specialty: specialty,
          description: `Tienes una ${tipoCitaTexto} con ${professionalName} ${
            isToday ? "hoy" : isTomorrow ? "mañana" : "próximamente"
          }.`,
          isToday,
          tipo_atencion: tipoAtencion, // Agregar tipo_atencion para el icono
        };
      });
  }, [appointments]);

  // Transformar citas a formato de calendario
  const calendarAppointmentsData = useMemo((): CalendarAppointment[] => {
    return appointments
      .filter(
        (appointment) =>
          appointment.status === "confirmed" || appointment.status === "pending"
      )
      .map((appointment) => {
        // Interpretar fecha como UTC si viene de MySQL sin zona horaria
        let appointmentDate: Date;
        const fechaStr = appointment.dateTime?.toString() || "";
        if (
          fechaStr.includes("T") ||
          fechaStr.includes("Z") ||
          fechaStr.includes("+")
        ) {
          appointmentDate = new Date(appointment.dateTime);
        } else if (fechaStr.includes(" ") && !fechaStr.includes("T")) {
          // Formato MySQL DATETIME: agregar 'Z' para indicar UTC
          appointmentDate = new Date(fechaStr + "Z");
        } else {
          appointmentDate = new Date(appointment.dateTime);
        }

        // Obtener día/mes/año en zona horaria de España
        const fechaEspana = appointmentDate.toLocaleDateString("es-ES", {
          timeZone: "Europe/Madrid",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const [day, month, year] = fechaEspana.split("/");

        const professionalName =
          (appointment.professional as any)?.name ||
          (appointment.professional as any)?.fullName ||
          "Profesional";
        const specialty =
          (appointment.professional as any)?.specialty || "Especialidad";

        return {
          id: appointment.id,
          date: parseInt(day),
          month: parseInt(month) - 1,
          year: parseInt(year),
          dateTime: appointment.dateTime, // Incluir fecha completa para comparación precisa
          professional: professionalName,
          specialty: specialty,
          time: appointmentDate.toLocaleTimeString("es-ES", {
            timeZone: "Europe/Madrid",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        };
      });
  }, [appointments]);

  // Transformar citas a formato de tabla de pendientes
  const pendingSessionsData = useMemo((): PendingSession[] => {
    return appointments.map((appointment) => {
      // Interpretar fecha como UTC si viene de MySQL sin zona horaria
      let appointmentDate: Date;
      const fechaStr = appointment.dateTime?.toString() || "";
      if (
        fechaStr.includes("T") ||
        fechaStr.includes("Z") ||
        fechaStr.includes("+")
      ) {
        appointmentDate = new Date(appointment.dateTime);
      } else if (fechaStr.includes(" ") && !fechaStr.includes("T")) {
        // Formato MySQL DATETIME: agregar 'Z' para indicar UTC
        appointmentDate = new Date(fechaStr + "Z");
      } else {
        appointmentDate = new Date(appointment.dateTime);
      }

      const professionalName =
        (appointment.professional as any)?.name ||
        (appointment.professional as any)?.fullName ||
        "Profesional";
      const specialty =
        (appointment.professional as any)?.specialty || "Especialidad";

      // Mapear estado del backend al formato esperado
      let status: "pending" | "confirmed" | "cancelled" | "completed" =
        "pending";
      if (appointment.status === "confirmed") {
        status = "confirmed";
      } else if (appointment.status === "cancelled") {
        status = "cancelled";
      } else if (appointment.status === "completed") {
        status = "completed";
      }

      return {
        id: appointment.id,
        professional: {
          name: professionalName,
          avatar: (appointment.professional as any)?.profileImage,
        },
        status,
        date: appointmentDate.toLocaleDateString("es-ES", {
          timeZone: "Europe/Madrid",
          day: "numeric",
          month: "long",
        }),
        time: appointmentDate.toLocaleTimeString("es-ES", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        category: specialty,
        modality: (() => {
          // Determinar modalidad basándose en tipo_atencion o modality
          const tipoAtencion = (appointment as any).tipo_atencion || null;
          const modality = appointment.modality;

          // Priorizar tipo_atencion sobre modality
          if (tipoAtencion === "presencial") {
            return "Presencial";
          } else if (tipoAtencion === "a_domicilio") {
            return "A Domicilio";
          } else if (tipoAtencion === "en_linea") {
            return "En Línea";
          } else if (modality === "in-person") {
            return "Presencial";
          } else if (modality === "home-visit") {
            return "A Domicilio";
          } else if (modality === "online") {
            return "En Línea";
          } else {
            // Fallback por defecto
            return "En Línea";
          }
        })(),
        product:
          (appointment.product as any)?.name ||
          (appointment.product as any)?.title ||
          "Servicio",
      };
    });
  }, [appointments]);

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error al cargar las citas
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>

        {/* Mostrar mensaje informativo sobre el problema del backend */}
        {error.includes("problemas técnicos") && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
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
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Información técnica
                </h4>
                <p className="text-sm text-yellow-800">
                  El backend está experimentando un error en la consulta de base
                  de datos. El equipo técnico ha sido notificado. Por favor,
                  intenta más tarde.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Por favor, inicia sesión para ver tus citas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {loading ? (
        <>
          <UpcomingSessionsSkeleton />
          <SessionCalendarSkeleton />
          <PendingSessionsTableSkeleton />
        </>
      ) : (
        <>
          {/* Upcoming Sessions Section */}
          {upcomingSessionsData.length > 0 && (
            <UpcomingSessions
              sessions={upcomingSessionsData}
              onViewDetails={handleViewDetails}
            />
          )}

          {/* Session Calendar Section */}
          {calendarAppointmentsData.length > 0 && (
            <SessionCalendar
              appointments={calendarAppointmentsData}
              basePath="/dashboard/cliente"
              onAppointmentClick={handleViewDetails}
            />
          )}

          {/* Pending Sessions Table Section */}
          {pendingSessionsData.length > 0 ? (
            <PendingSessionsTable
              sessions={pendingSessionsData}
              onViewDetails={handleViewDetails}
            />
          ) : !error ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes citas programadas
              </h3>
              <p className="text-gray-600 mb-4">
                Cuando reserves una cita, aparecerá aquí.
              </p>
              <Link
                href="/servicios"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
              >
                Explorar Servicios
              </Link>
            </div>
          ) : null}
        </>
      )}

      {/* Appointment Detail Modal - Lazy loaded */}
      {selectedAppointment && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando detalles...</p>
              </div>
            </div>
          }
        >
          <AppointmentDetailModal
            appointment={selectedAppointment}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onReschedule={handleReschedule}
          />
        </Suspense>
      )}
    </div>
  );
}
