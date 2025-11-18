"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { citasService, pagosService } from "@/services";
import { ApiAppointment } from "@/services/types/api";
import { Pago } from "@/services/api/pagos";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import LatestPayments from "@/components/dashboard/LatestPayments";
import { lazyLoad } from "@/lib/lazy-loading";

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
  tipo_atencion?: "presencial" | "en_linea" | "a_domicilio" | null;
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

interface LatestPayment {
  id: string;
  professional: {
    name: string;
    email: string;
  };
  product: string;
  orderNumber: string;
  modality: string;
  status: "paid" | "cancelled" | "refunded";
  date: string;
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
      return false;
    }

    // Si tenemos el id_cliente esperado, verificar que coincida
    if (expectedClientId && String(cita.id_cliente) !== expectedClientId) {
      return false;
    }

    // Verificar que la fecha sea válida y razonable
    const fechaInicio = cita.fecha_inicio || cita.dateTime;
    if (!fechaInicio) {
      return false;
    }

    const fechaInicioDate = new Date(fechaInicio);
    if (isNaN(fechaInicioDate.getTime())) {
      return false;
    }

    // Filtrar citas fuera del rango razonable (1 año atrás a 1 año adelante)
    if (fechaInicioDate < oneYearAgo || fechaInicioDate > oneYearFromNow) {
      return false;
    }

    return true;
  });
};

export default function ClienteDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<ApiAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar citas y pagos del cliente
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
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

        // Cargar citas
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

          // Mapear citas del backend al formato ApiAppointment
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
                modality: cita.tipo_atencion === "en_linea" ? "online" : cita.tipo_atencion === "a_domicilio" ? "home-visit" : "in-person",
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

        // Cargar pagos
        const pagosResponse = await pagosService.getMisPagos({
          limit: 5, // Solo los últimos 5 para el dashboard
          offset: 0,
        });

        if (pagosResponse.success && pagosResponse.data) {
          const dataObj = pagosResponse.data as any;
          let pagosArray: Pago[] = [];

          if (dataObj?.data?.pagos && Array.isArray(dataObj.data.pagos)) {
            pagosArray = dataObj.data.pagos;
          } else if (dataObj?.pagos && Array.isArray(dataObj.pagos)) {
            pagosArray = dataObj.pagos;
          } else if (Array.isArray(dataObj)) {
            pagosArray = dataObj;
          }

          // Filtrar pagos válidos
          const validPagos = pagosArray.filter((pago: Pago) => {
            return !!pago.monto;
          });

          setPagos(validPagos);
        }
      } catch (err: any) {
        console.error("[ClienteDashboard] Error loading data:", err);
        setError(
          "Error al cargar los datos. Por favor, intenta más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

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
        let appointmentDate: Date;
        const fechaStr = appointment.dateTime?.toString() || "";
        if (
          fechaStr.includes("T") ||
          fechaStr.includes("Z") ||
          fechaStr.includes("+")
        ) {
          appointmentDate = new Date(appointment.dateTime);
        } else if (fechaStr.includes(" ") && !fechaStr.includes("T")) {
          appointmentDate = new Date(fechaStr + "Z");
        } else {
          appointmentDate = new Date(appointment.dateTime);
        }

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

        // Obtener tipo de atención y crear descripción dinámica
        const tipoAtencion = (appointment as any).tipo_atencion || null;
        let description = "";
        if (tipoAtencion === "presencial") {
          description = `Tienes una cita presencial con ${professionalName} ${
            isToday ? "hoy" : isTomorrow ? "mañana" : "próximamente"
          }.`;
        } else if (tipoAtencion === "a_domicilio") {
          description = `Tienes una cita a domicilio con ${professionalName} ${
            isToday ? "hoy" : isTomorrow ? "mañana" : "próximamente"
          }.`;
        } else {
          description = `Tienes una videollamada con ${professionalName} ${
            isToday ? "hoy" : isTomorrow ? "mañana" : "próximamente"
          }.`;
        }

        return {
          id: appointment.id,
          time: timeDisplay,
          professional: professionalName,
          specialty: specialty,
          description: description,
          isToday,
          tipo_atencion: tipoAtencion,
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
        let appointmentDate: Date;
        const fechaStr = appointment.dateTime?.toString() || "";
        if (
          fechaStr.includes("T") ||
          fechaStr.includes("Z") ||
          fechaStr.includes("+")
        ) {
          appointmentDate = new Date(appointment.dateTime);
        } else if (fechaStr.includes(" ") && !fechaStr.includes("T")) {
          appointmentDate = new Date(fechaStr + "Z");
        } else {
          appointmentDate = new Date(appointment.dateTime);
        }

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
          dateTime: appointment.dateTime,
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

  // Transformar pagos a formato de LatestPayments
  const latestPayments = useMemo((): LatestPayment[] => {
    // Ordenar pagos por fecha (más recientes primero) y tomar los primeros 5
    const pagosOrdenados = [...pagos].sort((a, b) => {
      const fechaA = a.fecha_pago || a.fecha_inicio;
      const fechaB = b.fecha_pago || b.fecha_inicio;
      const tiempoA = fechaA ? new Date(fechaA).getTime() : 0;
      const tiempoB = fechaB ? new Date(fechaB).getTime() : 0;
      return tiempoB - tiempoA;
    });

    return pagosOrdenados.slice(0, 5).map((pago: Pago) => {
      // Formatear fecha
      const fechaParaMostrar = pago.fecha_pago || pago.fecha_inicio;
      let fechaFormateada = "Sin fecha";

      if (fechaParaMostrar) {
        try {
          const fecha = new Date(fechaParaMostrar);
          if (!isNaN(fecha.getTime())) {
            fechaFormateada = fecha.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        } catch (error) {
          // Mantener "Sin fecha" si hay error
        }
      }

      // Obtener nombre del profesional
      const nombreProfesional = pago.profesional_nombre
        ? `${pago.profesional_nombre}${pago.profesional_apellidos ? ` ${pago.profesional_apellidos}` : ""}`
        : "Profesional";

      // Mapear estado del pago al estado de LatestPayments
      let status: "paid" | "cancelled" | "refunded" = "paid";
      if (pago.estado === "reembolsado") {
        status = "refunded";
      } else if (pago.estado === "fallido" || pago.estado === "pendiente") {
        status = "cancelled";
      }

      // Tipo de servicio basado en tipo_atencion
      const tipoServicio = pago.tipo_atencion === "en_linea" 
        ? "Consulta Virtual" 
        : pago.tipo_atencion === "presencial"
        ? "Consulta Presencial"
        : pago.tipo_atencion === "a_domicilio"
        ? "Consulta a Domicilio"
        : "Consulta";

      return {
        id: String(pago.id_pago),
        professional: {
          name: nombreProfesional,
          email: "", // El backend no devuelve email del profesional en pagos
        },
        product: tipoServicio,
        orderNumber: `#${pago.id_pago}`,
        modality: pago.tipo_atencion === "en_linea" ? "En línea" : pago.tipo_atencion === "a_domicilio" ? "A Domicilio" : "Presencial",
        status,
        date: fechaFormateada,
      };
    });
  }, [pagos]);

  // Handler para abrir el modal de detalles
  const handleViewDetails = (appointmentId: string) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setIsModalOpen(true);
    }
  };

  // Handler para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
              Error al cargar los datos
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
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Por favor, inicia sesión para ver tu dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
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
          onAppointmentClick={handleViewDetails}
        />
      )}

      {/* Latest Payments Section */}
      {latestPayments.length > 0 && (
        <LatestPayments payments={latestPayments} />
      )}

      {/* Modal de detalles de la cita - Lazy loaded */}
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
          />
        </Suspense>
      )}
    </div>
  );
}
