"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { citasService, professionalsService } from "@/services";
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
  tipo_atencion?: "presencial" | "en_linea" | "a_domicilio" | null;
}

interface CalendarAppointment {
  id: string;
  date: number;
  month?: number;
  year?: number;
  dateTime?: string;
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

export default function CitasPage() {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<ApiAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar id_profesional del usuario autenticado
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const loadProfessionalId = async () => {
      try {
        const response = await professionalsService.getMyProfessionalProfile();
        console.log("[CitasPage] Respuesta de perfil profesional:", response);
        
        if (response.success && response.data) {
          // El backend devuelve: { success: true, data: { profesional: {...} } }
          // El apiClient envuelve esto, así que response.data es el objeto completo del backend
          const backendData = response.data as any;
          const profesional = backendData.data?.profesional || backendData.profesional || backendData;
          const idProfesional = String(profesional.id_profesional || profesional.id || "");
          
          console.log("[CitasPage] ID Profesional encontrado:", idProfesional);
          setProfessionalId(idProfesional);
        } else {
          console.error("[CitasPage] Error en respuesta:", response.error);
          setError(response.error || "Error al cargar información del profesional");
          setLoading(false);
        }
      } catch (err) {
        console.error("[CitasPage] Error loading professional ID:", err);
        setError("Error al cargar información del profesional");
        setLoading(false);
      }
    };

    loadProfessionalId();
  }, [isAuthenticated, user]);

  // Cargar citas cuando tengamos el professionalId
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (!professionalId) {
      return;
    }

    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convertir professionalId a número si es necesario
        const professionalIdNum = parseInt(professionalId, 10);
        if (isNaN(professionalIdNum) || professionalIdNum <= 0) {
          throw new Error(`ID de profesional inválido: ${professionalId}`);
        }
        
        const citasResponse = await citasService.getCitasProfesional(professionalIdNum);
        
        console.log("[CitasPage] Respuesta de citas:", citasResponse);
        
        if (citasResponse.success && citasResponse.data) {
          // El backend devuelve: { success: true, data: { citas: [...], id_profesional: ..., paginacion: {...} } }
          // El apiClient envuelve esto, así que response.data es el objeto completo del backend
          const backendData = citasResponse.data as any;
          const citasArray = backendData.data?.citas || backendData.citas || (Array.isArray(backendData) ? backendData : []);
          
          console.log("[CitasPage] Citas extraídas:", citasArray.length);
          
          // Mapear citas al formato ApiAppointment
          const mappedAppointments: ApiAppointment[] = citasArray.map((cita: any) => {
            const monto = cita.pago_monto ? parseFloat(cita.pago_monto) : 0;
            
            // Convertir fecha_inicio de MySQL a formato ISO UTC
            let fechaInicioISO = cita.fecha_inicio;
            if (typeof fechaInicioISO === "string") {
              const fechaStr = fechaInicioISO.toString();
              if (fechaStr.includes(" ") && !fechaStr.includes("T") && !fechaStr.includes("Z")) {
                fechaInicioISO = fechaStr.replace(" ", "T").replace(/(:\d{2})$/, "$1.000Z");
              } else if (fechaStr.includes("T") && !fechaStr.includes("Z") && !fechaStr.includes("+")) {
                fechaInicioISO = fechaStr + (fechaStr.includes(".") ? "Z" : ".000Z");
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
                name: cita.nombre_servicio || "Servicio",
                price: monto,
                description: `Cita de ${cita.duracion || 60} minutos`,
                category: cita.especialidad || "Especialidad",
              },
              professional: {
                id: String(cita.id_profesional),
                name: cita.profesional_nombre || "Profesional",
                email: "",
                phone: "",
                specialty: cita.especialidad || "Especialidad",
              },
              client: {
                id: String(cita.id_cliente),
                name: cita.cliente_nombre || "Cliente",
                email: cita.cliente_email || "",
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
          });
          
          setAppointments(mappedAppointments);
        } else {
          setError(citasResponse.error || "Error al cargar las citas");
        }
      } catch (err: any) {
        console.error("Error loading appointments:", err);
        setError("Error al cargar las citas");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [professionalId, isAuthenticated]);

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

  // Transformar citas a formato de próximas sesiones
  const upcomingSessionsData = useMemo((): UpcomingSession[] => {
    const now = new Date();
    
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
        if (fechaStr.includes("T") || fechaStr.includes("Z") || fechaStr.includes("+")) {
          appointmentDate = new Date(appointment.dateTime);
        } else if (fechaStr.includes(" ") && !fechaStr.includes("T")) {
          appointmentDate = new Date(fechaStr + "Z");
        } else {
          appointmentDate = new Date(appointment.dateTime);
        }

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

        const clientName = (appointment.client as any)?.name || "Cliente";
        const specialty = (appointment.product as any)?.category || "Especialidad";

        // Obtener tipo de atención y crear descripción dinámica
        const tipoAtencion = (appointment as any).tipo_atencion || null;
        let description = "";
        if (tipoAtencion === "presencial") {
          description = `Tienes una cita presencial con ${clientName} ${
            isToday ? "hoy" : isTomorrow ? "mañana" : "próximamente"
          }.`;
        } else if (tipoAtencion === "a_domicilio") {
          description = `Tienes una cita a domicilio con ${clientName} ${
            isToday ? "hoy" : isTomorrow ? "mañana" : "próximamente"
          }.`;
        } else {
          description = `Tienes una videollamada con ${clientName} ${
            isToday ? "hoy" : isTomorrow ? "mañana" : "próximamente"
          }.`;
        }

        return {
          id: appointment.id,
          time: timeDisplay,
          professional: clientName,
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
        if (fechaStr.includes("T") || fechaStr.includes("Z") || fechaStr.includes("+")) {
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

        const clientName = (appointment.client as any)?.name || "Cliente";
        const specialty = (appointment.product as any)?.category || "Especialidad";

        return {
          id: appointment.id,
          date: parseInt(day),
          month: parseInt(month) - 1,
          year: parseInt(year),
          dateTime: appointment.dateTime,
          professional: clientName,
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
      let appointmentDate: Date;
      const fechaStr = appointment.dateTime?.toString() || "";
      if (fechaStr.includes("T") || fechaStr.includes("Z") || fechaStr.includes("+")) {
        appointmentDate = new Date(appointment.dateTime);
      } else if (fechaStr.includes(" ") && !fechaStr.includes("T")) {
        appointmentDate = new Date(fechaStr + "Z");
      } else {
        appointmentDate = new Date(appointment.dateTime);
      }

      const clientName = (appointment.client as any)?.name || "Cliente";
      const specialty = (appointment.product as any)?.category || "Especialidad";

      let status: "pending" | "confirmed" | "cancelled" | "completed" = "pending";
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
          name: clientName,
          avatar: (appointment.client as any)?.profileImage,
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
        modality: appointment.modality === "online" 
          ? "En línea" 
          : appointment.modality === "home-visit"
          ? "A Domicilio"
          : appointment.modality === "in-person"
          ? "Presencial"
          : (appointment.modality as string) || "En línea",
        product: (appointment.product as any)?.name || "Servicio",
      };
    });
  }, [appointments]);


  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
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
          {upcomingSessionsData.length > 0 && (
            <UpcomingSessions
              sessions={upcomingSessionsData}
              basePath="/dashboard/profesional"
              onViewDetails={handleViewDetails}
            />
          )}
          {calendarAppointmentsData.length > 0 && (
            <SessionCalendar
              appointments={calendarAppointmentsData}
              basePath="/dashboard/profesional"
              onAppointmentClick={handleViewDetails}
            />
          )}
          {pendingSessionsData.length > 0 ? (
            <PendingSessionsTable
              sessions={pendingSessionsData}
              basePath="/dashboard/profesional"
              onViewDetails={handleViewDetails}
            />
          ) : !error ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes citas programadas
              </h3>
              <p className="text-gray-600">
                Cuando tengas citas programadas, aparecerán aquí.
              </p>
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
          />
        </Suspense>
      )}
    </div>
  );
}
