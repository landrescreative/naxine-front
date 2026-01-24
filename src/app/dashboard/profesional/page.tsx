"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { citasService, pagosService, professionalsService } from "@/services";
import { parseMySQLDateAsSpainLocal } from "@/services/utils/api-helpers";
import { ApiAppointment } from "@/services/types/api";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import LatestPayments from "@/components/dashboard/LatestPayments";
import { lazyLoad } from "@/lib/lazy-loading";
import {
  UpcomingSessionsSkeleton,
  SessionCalendarSkeleton,
  LatestPaymentsSkeleton,
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

interface Payment {
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
  amount?: number;
}

export default function ProfesionalDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
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
        console.log("[ProfesionalDashboard] Respuesta de perfil profesional:", response);
        
        if (response.success && response.data) {
          // El backend devuelve: { success: true, data: { profesional: {...} } }
          // El apiClient envuelve esto, así que response.data es el objeto completo del backend
          const backendData = response.data as any;
          const profesional = backendData.data?.profesional || backendData.profesional || backendData;
          const idProfesional = String(profesional.id_profesional || profesional.id || "");
          
          console.log("[ProfesionalDashboard] ID Profesional encontrado:", idProfesional);
          setProfessionalId(idProfesional);
        } else {
          console.error("[ProfesionalDashboard] Error en respuesta:", response.error);
          setError(response.error || "Error al cargar información del profesional");
          setLoading(false);
        }
      } catch (err) {
        console.error("[ProfesionalDashboard] Error loading professional ID:", err);
        setError("Error al cargar información del profesional");
        setLoading(false);
      }
    };

    loadProfessionalId();
  }, [isAuthenticated, user]);

  // Cargar citas y pagos cuando tengamos el professionalId
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (!professionalId) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convertir professionalId a número si es necesario (una sola vez)
        const professionalIdNum = parseInt(professionalId, 10);
        if (isNaN(professionalIdNum) || professionalIdNum <= 0) {
          throw new Error(`ID de profesional inválido: ${professionalId}`);
        }

        // Cargar citas del profesional
        const citasResponse = await citasService.getCitasProfesional(professionalIdNum);
        
        console.log("[ProfesionalDashboard] Respuesta de citas:", citasResponse);
        
        if (citasResponse.success && citasResponse.data) {
          // El backend devuelve: { success: true, data: { citas: [...], id_profesional: ..., paginacion: {...} } }
          // El apiClient envuelve esto, así que response.data es el objeto completo del backend
          const backendData = citasResponse.data as any;
          const citasArray = backendData.data?.citas || backendData.citas || (Array.isArray(backendData) ? backendData : []);
          
          console.log("[ProfesionalDashboard] Citas extraídas:", citasArray.length);
          
          // Mapear citas al formato ApiAppointment
          const mappedAppointments: ApiAppointment[] = citasArray.map((cita: any) => {
            console.log("[ProfesionalDashboard] Procesando cita:", cita);
            if (cita.tipo_atencion === "a_domicilio") {
              console.log("[ProfesionalDashboard] Cita a domicilio - notas:", cita.notas);
            }
            
            const monto = cita.pago_monto ? parseFloat(String(cita.pago_monto)) : 0;
            
            // Convertir fecha_inicio de MySQL interpretándola como hora local de España
            const fechaInicioDate = parseMySQLDateAsSpainLocal(cita.fecha_inicio);
            const fechaInicioISO = fechaInicioDate.toISOString();

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
                name: cita.nombre_servicio || cita.nombre_paquete || "Servicio",
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
          
          console.log("[ProfesionalDashboard] Citas mapeadas:", mappedAppointments.length);
          
          setAppointments(mappedAppointments);
        }

        // Cargar pagos del profesional
        const pagosResponse = await pagosService.getPagosProfesional(professionalIdNum, {
          limit: 10,
          offset: 0,
        });

        console.log("[ProfesionalDashboard] Respuesta de pagos:", pagosResponse);

        if (pagosResponse.success && pagosResponse.data) {
          // El backend devuelve: { success: true, data: { pagos: [...], id_profesional: ..., paginacion: {...} } }
          // El apiClient envuelve esto, así que response.data es el objeto completo del backend
          const backendData = pagosResponse.data as any;
          const pagosArray = backendData.data?.pagos || backendData.pagos || (Array.isArray(backendData) ? backendData : []);
          
          console.log("[ProfesionalDashboard] Pagos extraídos:", pagosArray.length);
          setPayments(pagosArray);
        }
      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [professionalId, isAuthenticated]);

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
        // appointment.dateTime ya viene como ISO string correctamente convertido desde MySQL
        const appointmentDate = new Date(appointment.dateTime);

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
        // appointment.dateTime ya viene como ISO string correctamente convertido desde MySQL
        const appointmentDate = new Date(appointment.dateTime);

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
          tipo_atencion: (appointment as any).tipo_atencion || null,
          modality: appointment.modality || null,
        };
      });
  }, [appointments]);

  // Transformar pagos al formato esperado
  const latestPaymentsData = useMemo((): Payment[] => {
    console.log("[ProfesionalDashboard] Transformando pagos:", payments);
    
    return payments.slice(0, 5).map((pago: any) => {
      console.log("[ProfesionalDashboard] Procesando pago:", pago);
      
      // Formatear fecha correctamente
      let fechaPago = "N/A";
      if (pago.fecha_pago) {
        try {
          const fecha = new Date(pago.fecha_pago);
          if (!isNaN(fecha.getTime())) {
            fechaPago = fecha.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        } catch (e) {
          console.error("[ProfesionalDashboard] Error formateando fecha:", e);
        }
      }

      // Determinar estado del pago
      let status: "paid" | "cancelled" | "refunded" = "paid";
      const estado = String(pago.estado || "").toLowerCase();
      if (estado === "reembolsado" || estado === "refunded") {
        status = "refunded";
      } else if (estado === "fallido" || estado === "cancelado" || estado === "cancelled") {
        status = "cancelled";
      } else if (estado === "completado" || estado === "pagado" || estado === "paid") {
        status = "paid";
      }

      // Obtener información del cliente
      const clientName = pago.cliente_nombre || "Cliente";
      const clientEmail = pago.cliente_email || "";

      // Obtener monto del pago
      const monto = pago.monto ? parseFloat(String(pago.monto)) : 0;

      return {
        id: String(pago.id_pago),
        professional: {
          name: clientName,
          email: clientEmail,
        },
        product: pago.nombre_servicio || pago.nombre_paquete || "Servicio",
        orderNumber: `#${pago.id_cita || pago.id_pago}`,
        modality: pago.tipo_atencion === "en_linea" ? "En línea" : pago.tipo_atencion === "a_domicilio" ? "A Domicilio" : "Presencial",
        status,
        date: fechaPago,
        amount: monto, // Agregar monto al objeto Payment
      };
    });
  }, [payments]);

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


  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6" role="alert" aria-live="assertive">
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
          <LatestPaymentsSkeleton />
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
          {latestPaymentsData.length > 0 && (
            <LatestPayments payments={latestPaymentsData} />
          )}
          {!loading && upcomingSessionsData.length === 0 && calendarAppointmentsData.length === 0 && latestPaymentsData.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay datos disponibles
              </h3>
              <p className="text-gray-600">
                Aún no tienes citas o pagos registrados.
              </p>
            </div>
          )}
        </>
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
