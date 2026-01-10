"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { ApiAppointment } from "@/services/types/api";
import { citasService } from "@/services/api/citas";
import { disponibilidadService } from "@/services/api/disponibilidad";

interface AppointmentDetailModalProps {
  appointment: ApiAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule?: () => void; // Callback cuando se reagenda exitosamente
}

export default function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
  onReschedule,
}: AppointmentDetailModalProps) {
  const pathname = usePathname();
  // Ocultar información del profesional si estamos en el dashboard del profesional
  const isProfessionalDashboard = pathname?.includes("/dashboard/profesional");
  const profesionalId =
    (appointment?.professional as any)?.id ||
    appointment?.professional?.id ||
    null;
  const professionalName =
    (appointment?.professional as any)?.name ||
    (appointment?.professional as any)?.fullName ||
    "Profesional";
  const professionalEmail =
    (appointment?.professional as any)?.email || "No disponible";
  const professionalPhone =
    (appointment?.professional as any)?.phone || "No disponible";
  const specialty =
    (appointment?.professional as any)?.specialty || "Especialidad";
  const tipoAtencion = (appointment as any)?.tipo_atencion || null;
  const modalityText =
    tipoAtencion === "en_linea"
      ? "En línea"
      : tipoAtencion === "a_domicilio"
      ? "A Domicilio"
      : tipoAtencion === "presencial"
      ? "Presencial"
      : appointment?.modality === "online"
      ? "En línea"
      : "Presencial";
  const linkVideollamada = (appointment as any)?.link_videollamada || null;
  const plataforma = (appointment as any)?.plataforma || null;
  const direccionConsultorio =
    (appointment as any)?.direccion_consultorio || null;
  
  // Estados para reagendamiento
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [todosLosHorarios, setTodosLosHorarios] = useState<Array<{
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    tipo_atencion?: string | null;
  }>>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const rescheduleSectionRef = useRef<HTMLDivElement>(null);
  
  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
      // Asegurar que no haya márgenes que causen gaps
      document.body.style.margin = "0";
      document.body.style.padding = "0";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
      document.body.style.margin = "";
      document.body.style.padding = "";
    };
  }, [isOpen, onClose]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      default:
        return "Desconocido";
    }
  };

  // Función helper para normalizar nombres de días
  const normalizarDia = (dia: string): string => {
    return dia
      .toLowerCase()
      .trim()
      .replace(/á/g, "a")
      .replace(/é/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u");
  };

  // Mapeo de días en español a índices
  const diasMap: { [key: string]: number } = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 0,
  };

  // Convertir hora a minutos desde medianoche
  const timeToMinutes = (timeStr: string): number => {
    const cleaned = timeStr.trim().toUpperCase();
    if (cleaned.includes("AM") || cleaned.includes("PM")) {
      const [time, period] = cleaned.split(/\s*(AM|PM)/);
      const [hours, minutes] = time.split(":").map(Number);
      let totalMinutes = hours * 60 + (minutes || 0);
      if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
      if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
      return totalMinutes;
    }
    const [hours, minutes] = cleaned.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Convertir minutos a formato "HH:MM AM/PM"
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${period}`;
  };

  // Función helper para crear fecha UTC que representa la hora seleccionada en España
  const crearFechaEspanaUTC = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number
  ): Date => {
    const fechaReferenciaUTC = new Date(Date.UTC(year, month, day, 12, 0, 0));
    const horaReferenciaEspana = fechaReferenciaUTC.toLocaleString("en-US", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const [horaRefEspanaStr] = horaReferenciaEspana.split(":");
    const horaRefEspana = parseInt(horaRefEspanaStr);
    const offsetHoras = horaRefEspana - 12;
    const horaUTC = hour - offsetHoras;
    let horaUTCFinal = horaUTC;
    let diaFinal = day;
    if (horaUTC < 0) {
      horaUTCFinal = 24 + horaUTC;
      diaFinal = day - 1;
    } else if (horaUTC >= 24) {
      horaUTCFinal = horaUTC - 24;
      diaFinal = day + 1;
    }
    return new Date(Date.UTC(year, month, diaFinal, horaUTCFinal, minute, 0));
  };

  // Normalizar fechas a UTC para comparación
  const normalizeDateToUTC = (dateInput: string | Date): Date => {
    if (dateInput instanceof Date) {
      return new Date(
        Date.UTC(
          dateInput.getUTCFullYear(),
          dateInput.getUTCMonth(),
          dateInput.getUTCDate(),
          dateInput.getUTCHours(),
          dateInput.getUTCMinutes(),
          dateInput.getUTCSeconds()
        )
      );
    }
    const dateStr = String(dateInput);
    if (dateStr.includes("Z") || dateStr.includes("+") || dateStr.includes("-", 10)) {
      return new Date(dateStr);
    }
    if (dateStr.includes(" ") && !dateStr.includes("T")) {
      return new Date(dateStr.replace(" ", "T") + "Z");
    }
    if (dateStr.includes("T") && !dateStr.includes("Z") && !dateStr.includes("+")) {
      return new Date(dateStr + "Z");
    }
    return new Date(dateStr);
  };

  // Obtener duración de la cita
  const duracionMinutos = useMemo(() => {
    if (!appointment) return 60;
    const product = appointment.product as any;
    if (product?.duracion) {
      const match = product.duracion.match(/(\d+)/);
      return match ? parseInt(match[1]) : 60;
    }
    // Calcular desde fecha_inicio y fecha_fin si están disponibles
    if (appointment.dateTime) {
      const inicio = new Date(appointment.dateTime);
      // Intentar obtener fecha_fin del appointment
      const fin = (appointment as any).fecha_fin 
        ? new Date((appointment as any).fecha_fin)
        : new Date(inicio.getTime() + 60 * 60000); // Default 60 min
      return Math.round((fin.getTime() - inicio.getTime()) / 60000);
    }
    return 60; // Default
  }, [appointment]);

  // Cargar horarios del profesional cuando entra en modo reagendamiento
  useEffect(() => {
    if (!appointment) return;
    if (isRescheduleMode && profesionalId && tipoAtencion) {
      console.log("[AppointmentDetailModal] Cargando horarios para profesional:", profesionalId, "tipo:", tipoAtencion);
      setLoadingHorarios(true);
      const fetchHorarios = async () => {
        try {
          const response = await disponibilidadService.getDisponibilidadProfesional(
            profesionalId,
            tipoAtencion
          );
          console.log("[AppointmentDetailModal] Respuesta de horarios:", response);
          if (response.success && response.data) {
            // El apiClient devuelve { success: true, data: {...} }
            // El backend devuelve { success: true, data: { disponibilidad_horarios: [...] } }
            // Entonces response.data es el objeto completo del backend
            const backendData = response.data as any;
            const horarios = backendData.data?.disponibilidad_horarios || backendData.disponibilidad_horarios;
            
            if (horarios && Array.isArray(horarios)) {
              console.log("[AppointmentDetailModal] Horarios cargados:", horarios.length, horarios);
              setTodosLosHorarios(horarios);
            } else {
              console.warn("[AppointmentDetailModal] No se encontraron horarios en la respuesta:", backendData);
              setTodosLosHorarios([]);
            }
          } else {
            console.warn("[AppointmentDetailModal] Respuesta no exitosa:", response);
            setTodosLosHorarios([]);
          }
        } catch (error) {
          console.error("[AppointmentDetailModal] Error al cargar horarios:", error);
          setTodosLosHorarios([]);
        } finally {
          setLoadingHorarios(false);
        }
      };
      fetchHorarios();
    } else {
      // Limpiar horarios cuando se sale del modo reagendamiento
      if (!isRescheduleMode) {
        setTodosLosHorarios([]);
      }
    }
  }, [appointment, isRescheduleMode, profesionalId, tipoAtencion]);

  // Scroll hacia la sección de reagendamiento cuando se activa el modo
  useEffect(() => {
    if (isRescheduleMode && contentRef.current && rescheduleSectionRef.current) {
      // Función para hacer scroll dentro del contenedor
      const scrollToSection = () => {
        if (!contentRef.current || !rescheduleSectionRef.current) return;
        
        const container = contentRef.current;
        const section = rescheduleSectionRef.current;
        
        // Calcular la posición de la sección relativa al contenedor
        const containerTop = container.getBoundingClientRect().top;
        const sectionTop = section.getBoundingClientRect().top;
        const currentScrollTop = container.scrollTop;
        
        // Calcular el offset necesario para posicionar la sección al inicio del contenedor visible
        const offset = sectionTop - containerTop + currentScrollTop;
        
        // Hacer scroll con un pequeño margen superior
        container.scrollTo({ 
          top: Math.max(0, offset - 20), 
          behavior: 'smooth' 
        });
      };

      // Intentar hacer scroll con múltiples delays para asegurar que el DOM esté actualizado
      setTimeout(scrollToSection, 50);
      setTimeout(scrollToSection, 150);
      setTimeout(scrollToSection, 300);
    }
  }, [isRescheduleMode]);

  // Cargar citas ocupadas del mes
  useEffect(() => {
    if (!appointment) return;
    if (isRescheduleMode && profesionalId && currentMonth) {
      setLoadingAppointments(true);
      const fetchOccupiedAppointments = async () => {
        try {
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const inicioMes = new Date(year, month, 1);
          const finMes = new Date(year, month + 1, 0, 23, 59, 59);

          const response = await citasService.getCitasOcupadas(
            profesionalId,
            inicioMes.toISOString(),
            finMes.toISOString()
          );

          let citasData = null;
          if (response.success && response.data) {
            const data = response.data as any;
            if (data.data?.citas && Array.isArray(data.data.citas)) {
              citasData = data.data.citas;
            } else if (data.citas && Array.isArray(data.citas)) {
              citasData = data.citas;
            }
          }

          if (citasData && citasData.length > 0) {
            const appointments = citasData
              .filter((cita: any) => String(cita.id_cita) !== String(appointment.id)) // Excluir la cita actual
              .map((cita: any) => {
                const fechaInicioUTC = normalizeDateToUTC(cita.fecha_inicio);
                const fechaFinUTC = normalizeDateToUTC(cita.fecha_fin);
                const duration = Math.round(
                  (fechaFinUTC.getTime() - fechaInicioUTC.getTime()) / 60000
                );
                return {
                  id: String(cita.id_cita),
                  dateTime: fechaInicioUTC.toISOString(),
                  dateTimeUTC: fechaInicioUTC,
                  duration,
                  estado: cita.estado,
                };
              });
            setExistingAppointments(appointments);
          } else {
            setExistingAppointments([]);
          }
        } catch (error) {
          console.error("Error loading occupied appointments:", error);
          setExistingAppointments([]);
        } finally {
          setLoadingAppointments(false);
        }
      };
      fetchOccupiedAppointments();
    }
  }, [appointment, isRescheduleMode, profesionalId, currentMonth, appointment?.id]);

  // Filtrar horarios según el tipo de atención
  const horariosCargados = useMemo(() => {
    if (!tipoAtencion) return [];
    return todosLosHorarios.filter(
      (horario) => horario.tipo_atencion === tipoAtencion
    );
  }, [todosLosHorarios, tipoAtencion]);

  // Extraer horarios disponibles
  const horariosDisponibles = useMemo(() => {
    const horarios: { [key: number]: { desde: string; hasta: string } } = {};
    if (horariosCargados.length > 0) {
      horariosCargados.forEach((horario) => {
        const diaNormalizado = normalizarDia(horario.dia_semana);
        const diaIndex = diasMap[diaNormalizado];
        if (diaIndex !== undefined) {
          const desde = horario.hora_inicio.substring(0, 5);
          const hasta = horario.hora_fin.substring(0, 5);
          if (horarios[diaIndex]) {
            const desdeActual = timeToMinutes(horarios[diaIndex].desde);
            const hastaActual = timeToMinutes(horarios[diaIndex].hasta);
            const desdeNuevo = timeToMinutes(desde);
            const hastaNuevo = timeToMinutes(hasta);
            horarios[diaIndex] = {
              desde: minutesToTime(Math.min(desdeActual, desdeNuevo)),
              hasta: minutesToTime(Math.max(hastaActual, hastaNuevo)),
            };
          } else {
            horarios[diaIndex] = { desde, hasta };
          }
        }
      });
    }
    return horarios;
  }, [horariosCargados]);

  // Generar días disponibles
  const getAvailableDays = useMemo(() => {
    return () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days: Array<{
        date: Date;
        dayName: string;
        dayNumber: number;
        available: boolean;
        isToday: boolean;
        isPast: boolean;
        hasAvailableSlots: boolean;
      }> = [];

      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const isAvailable = horariosDisponibles[dayOfWeek] !== undefined;
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();

        let hasAvailableSlots = false;
        if (isAvailable && !isPast) {
          const horario = horariosDisponibles[dayOfWeek];
          if (horario) {
            const desde = timeToMinutes(horario.desde);
            const hasta = timeToMinutes(horario.hasta);
            let currentTime = desde;
            while (currentTime + duracionMinutos <= hasta) {
              const hour = Math.floor(currentTime / 60);
              const minute = currentTime % 60;
              const slotDateTimeUTC = crearFechaEspanaUTC(year, month, day, hour, minute);
              const slotEndUTC = new Date(slotDateTimeUTC.getTime() + duracionMinutos * 60000);
              const isOccupied = existingAppointments.some((apt) => {
                const aptStart = apt.dateTimeUTC || normalizeDateToUTC(apt.dateTime);
                const aptEnd = new Date(aptStart.getTime() + (apt.duration || duracionMinutos) * 60000);
                return (
                  (slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd) ||
                  (slotEndUTC > aptStart && slotEndUTC <= aptEnd) ||
                  (slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd)
                );
              });
              if (!isOccupied) {
                hasAvailableSlots = true;
                break;
              }
              currentTime += duracionMinutos;
            }
          }
        }

        days.push({
          date,
          dayName: dayNames[dayOfWeek],
          dayNumber: day,
          available: isAvailable && !isPast && hasAvailableSlots,
          isToday,
          isPast,
          hasAvailableSlots,
        });
      }
      return days.filter((d) => d.available);
    };
  }, [currentMonth, horariosDisponibles, duracionMinutos, existingAppointments]);

  const availableDays = useMemo(() => {
    const getDays = getAvailableDays;
    return getDays();
  }, [getAvailableDays]);

  // Generar slots de tiempo para la fecha seleccionada
  const generateTimeSlots = useCallback((
    date: Date
  ): Array<{ time: string; displayTime: string; available: boolean }> => {
    if (!date || !tipoAtencion) return [];

    const dayOfWeek = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(date);
    selectedDateOnly.setHours(0, 0, 0, 0);
    const isToday = selectedDateOnly.getTime() === today.getTime();
    const currentTime = new Date();

    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const diaSemanaNombre = dayNames[dayOfWeek];
    const diaSemanaNormalizado = normalizarDia(diaSemanaNombre);
    const horariosDelDia = horariosCargados.filter((h) => {
      const diaHorarioNormalizado = normalizarDia(h.dia_semana);
      return diaHorarioNormalizado === diaSemanaNormalizado && h.tipo_atencion === tipoAtencion;
    });

    const horario = horariosDisponibles[dayOfWeek];
    if (!horario && horariosDelDia.length === 0) return [];

    const slots: Array<{ time: string; displayTime: string; available: boolean }> = [];

    if (horariosDelDia.length > 0) {
      horariosDelDia.forEach((horarioDelDia) => {
        const desde = timeToMinutes(horarioDelDia.hora_inicio.substring(0, 5));
        const hasta = timeToMinutes(horarioDelDia.hora_fin.substring(0, 5));
        let currentTime = desde;

        while (currentTime + duracionMinutos <= hasta) {
          const slotTime = minutesToTime(currentTime);
          const hour = Math.floor(currentTime / 60);
          const minute = currentTime % 60;
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          const slotDateTimeUTC = crearFechaEspanaUTC(year, month, day, hour, minute);
          const slotEndUTC = new Date(slotDateTimeUTC.getTime() + duracionMinutos * 60000);

          let isPastTime = false;
          if (isToday) {
            const now = new Date();
            const nowInSpain = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
            const nowMinutes = nowInSpain.getHours() * 60 + nowInSpain.getMinutes();
            isPastTime = currentTime < nowMinutes;
          }

          const isOccupied = existingAppointments.some((apt) => {
            const aptStart = apt.dateTimeUTC || normalizeDateToUTC(apt.dateTime);
            const aptEnd = new Date(aptStart.getTime() + (apt.duration || duracionMinutos) * 60000);
            return (
              (slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd) ||
              (slotEndUTC > aptStart && slotEndUTC <= aptEnd) ||
              (slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd)
            );
          });

          const timeStr = `${Math.floor(currentTime / 60).toString().padStart(2, "0")}:${(currentTime % 60).toString().padStart(2, "0")}`;
          if (!slots.some((s) => s.time === timeStr) && !isPastTime) {
            slots.push({
              time: timeStr,
              displayTime: slotTime,
              available: !isOccupied,
            });
          }
          currentTime += duracionMinutos;
        }
      });
    } else if (horario) {
      const desde = timeToMinutes(horario.desde);
      const hasta = timeToMinutes(horario.hasta);
      let currentTime = desde;

      while (currentTime + duracionMinutos <= hasta) {
        const slotTime = minutesToTime(currentTime);
        const hour = Math.floor(currentTime / 60);
        const minute = currentTime % 60;
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const slotDateTimeUTC = crearFechaEspanaUTC(year, month, day, hour, minute);
        const slotEndUTC = new Date(slotDateTimeUTC.getTime() + duracionMinutos * 60000);

        let isPastTime = false;
        if (isToday) {
          const now = new Date();
          const nowInSpain = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
          const nowMinutes = nowInSpain.getHours() * 60 + nowInSpain.getMinutes();
          isPastTime = currentTime < nowMinutes;
        }

        const isOccupied = existingAppointments.some((apt) => {
          const aptStart = apt.dateTimeUTC || normalizeDateToUTC(apt.dateTime);
          const aptEnd = new Date(aptStart.getTime() + (apt.duration || duracionMinutos) * 60000);
          return (
            (slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd) ||
            (slotEndUTC > aptStart && slotEndUTC <= aptEnd) ||
            (slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd)
          );
        });

        if (!isPastTime) {
          slots.push({
            time: `${Math.floor(currentTime / 60).toString().padStart(2, "0")}:${(currentTime % 60).toString().padStart(2, "0")}`,
            displayTime: slotTime,
            available: !isOccupied,
          });
        }
        currentTime += duracionMinutos;
      }
    }

    slots.sort((a, b) => {
      const timeA = timeToMinutes(a.time);
      const timeB = timeToMinutes(b.time);
      return timeA - timeB;
    });

    return slots;
  }, [selectedDate, horariosCargados, horariosDisponibles, tipoAtencion, duracionMinutos, existingAppointments]);

  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : [];
  }, [selectedDate, generateTimeSlots]);

  if (!isOpen || !appointment) {
    return null;
  }

  const appointmentDate = new Date(appointment.dateTime);
  const formattedDate = appointmentDate.toLocaleDateString("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = appointmentDate.toLocaleTimeString("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Función para confirmar reagendamiento
  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTimeSlot || !appointment) return;

    setIsRescheduling(true);
    try {
      const [hours, minutes] = selectedTimeSlot.split(":").map(Number);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      const fechaInicio = crearFechaEspanaUTC(year, month, day, hours, minutes);
      const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);

      const response = await citasService.actualizarCita(appointment.id, {
        id_cliente: parseInt((appointment.client as any)?.id || appointment.client?.id || "0"),
        id_profesional: parseInt(profesionalId || "0"),
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
      });

      if (response.success) {
        alert("Cita reagendada exitosamente");
        setIsRescheduleMode(false);
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        if (onReschedule) {
          onReschedule();
        }
        onClose();
      } else {
        alert(response.error || "Error al reagendar la cita");
      }
    } catch (error: any) {
      console.error("Error al reagendar:", error);
      alert(error.message || "Error al reagendar la cita");
    } finally {
      setIsRescheduling(false);
    }
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Overlay con desenfoque */}
      <div
        className="fixed bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          minHeight: "100vh",
          minWidth: "100vw",
          margin: 0,
          padding: 0,
          position: "fixed",
        }}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden pointer-events-auto transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Header con gradiente */}
          <div className="sticky top-0 bg-gradient-to-r from-primary/10 via-primary/5 to-white border-b border-gray-200/50 px-6 py-5 flex items-center justify-between z-10 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
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
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Detalles de la Cita
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 hover:scale-110"
              aria-label="Cerrar modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div 
            ref={contentRef}
            className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]"
          >
            {/* Estado */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Estado</span>
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(
                  appointment.status
                )}`}
              >
                {getStatusText(appointment.status)}
              </span>
            </div>

            {/* Fecha y Hora - Card mejorado */}
            <div className="bg-gradient-to-br from-primary/5 via-purple-50/50 to-white rounded-xl p-5 border border-primary/10 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-primary"
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
                Fecha y Hora
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
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
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fecha</div>
                    <div className="text-base font-bold text-gray-900 capitalize leading-tight">
                      {formattedDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
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
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Hora</div>
                    <div className="text-base font-bold text-gray-900">
                      {formattedTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profesional - Solo mostrar si NO estamos en el dashboard del profesional */}
            {!isProfessionalDashboard && (
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-primary"
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
                  Profesional
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre</div>
                    <div className="text-lg font-bold text-gray-900">
                      {professionalName}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Especialidad</div>
                    <div className="text-base font-medium text-gray-900">{specialty}</div>
                  </div>
                  {professionalEmail !== "No disponible" && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</div>
                      <div className="text-base text-gray-900 break-all">
                        {professionalEmail}
                      </div>
                    </div>
                  )}
                  {professionalPhone !== "No disponible" && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Teléfono</div>
                      <div className="text-base text-gray-900">
                        {professionalPhone}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detalles del Servicio */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Detalles del Servicio
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Servicio</div>
                  <div className="text-lg font-bold text-gray-900">
                    {(appointment.product as any)?.name ||
                      (appointment.product as any)?.title ||
                      "Servicio"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Categoría</div>
                    <div className="text-base font-medium text-gray-900">
                      {(appointment.product as any)?.category || specialty}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Modalidad</div>
                    <div className="text-base font-medium text-gray-900">{modalityText}</div>
                  </div>
                </div>
                {(appointment.product as any)?.description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</div>
                    <div className="text-base text-gray-900 leading-relaxed">
                      {(appointment.product as any)?.description}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información específica según tipo de atención */}
            {tipoAtencion === "presencial" && (
              <div className="bg-gradient-to-br from-blue-50 via-cyan-50/50 to-white rounded-xl p-5 border border-blue-200/50 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
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
                  Dirección del Consultorio
                </h3>
                <div className="bg-white/60 rounded-lg p-4 border border-blue-100">
                  {direccionConsultorio && direccionConsultorio.trim() !== "" ? (
                    <>
                      <p className="text-base text-gray-900 leading-relaxed font-medium">
                        {direccionConsultorio}
                      </p>
                      <p className="text-sm text-gray-600 mt-3 italic">
                        Te recomendamos llegar 10 minutos antes de la hora programada.
                      </p>
                    </>
                  ) : (
                    <p className="text-base text-gray-600 italic">
                      La dirección del consultorio se enviará por correo electrónico después de confirmar el pago.
                    </p>
                  )}
                </div>
              </div>
            )}

            {tipoAtencion === "en_linea" && (
              <div className="bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white rounded-xl p-5 border border-purple-200/50 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-purple-600"
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
                  {plataforma || "Videollamada"}
                </h3>
                <div className="bg-white/60 rounded-lg p-4 border border-purple-100">
                  {linkVideollamada && linkVideollamada.trim() !== "" ? (
                    <>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Enlace de la videollamada:</p>
                      <a
                        href={linkVideollamada}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-purple-600 hover:text-purple-700 underline break-all font-medium block mb-3"
                      >
                        {linkVideollamada}
                      </a>
                      <p className="text-sm text-gray-600 italic">
                        Haz clic en el enlace para unirte a la videollamada en la fecha y hora programada.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Asegúrate de tener una conexión a internet estable y un dispositivo con cámara y micrófono.
                      </p>
                    </>
                  ) : (
                    <p className="text-base text-gray-600 italic">
                      El enlace de la videollamada se enviará por correo electrónico después de confirmar el pago.
                    </p>
                  )}
                </div>
              </div>
            )}

            {tipoAtencion === "a_domicilio" && (() => {
              // Extraer dirección de las notas
              let direccionCliente = null;
              const notas = appointment.notes ? String(appointment.notes) : null;
              
              console.log("[AppointmentDetailModal] Tipo atención:", tipoAtencion);
              console.log("[AppointmentDetailModal] Notas completas:", notas);
              console.log("[AppointmentDetailModal] Appointment completo:", appointment);
              
              if (notas && notas.trim()) {
                // Normalizar saltos de línea (por si hay \r\n o solo \n)
                const notasNormalizadas = notas.replace(/\r\n/g, '\n');
                
                // Intentar diferentes formatos de extracción
                // Formato esperado: "\n\n📍 Dirección de atención a domicilio:\n[dirección]"
                const patterns = [
                  // Patrones con emoji y saltos de línea (formato más común)
                  /(?:^|\n\n)📍\s*Dirección de atención a domicilio:\s*\n(.+?)(?:\n\n|$)/s,
                  /📍\s*Dirección de atención a domicilio:\s*\n(.+?)(?:\n\n|$)/s,
                  /📍\s*Dirección de atención a domicilio:\s*(.+?)(?:\n\n|$)/s,
                  /📍\s*Dirección de atención a domicilio:\s*(.+)/s,
                  // Patrones sin emoji (por si el emoji no se guardó correctamente)
                  /(?:^|\n\n)Dirección de atención a domicilio:\s*\n(.+?)(?:\n\n|$)/s,
                  /Dirección de atención a domicilio:\s*\n(.+?)(?:\n\n|$)/s,
                  /Dirección de atención a domicilio:\s*(.+?)(?:\n\n|$)/s,
                  /Dirección de atención a domicilio:\s*(.+)/s,
                ];
                
                for (const pattern of patterns) {
                  const match = notasNormalizadas.match(pattern);
                  if (match && match[1] && match[1].trim()) {
                    direccionCliente = match[1].trim();
                    console.log("[AppointmentDetailModal] ✓ Dirección extraída con patrón regex:", direccionCliente);
                    break;
                  }
                }
                
                // Si no se encontró con los patrones regex, intentar split simple
                if (!direccionCliente) {
                  // Intentar con emoji
                  if (notasNormalizadas.includes('📍')) {
                    const parts = notasNormalizadas.split(/📍\s*Dirección de atención a domicilio:/);
                    if (parts.length > 1) {
                      const afterMarker = parts[1].trim();
                      // Tomar la primera línea o párrafo después del marcador
                      direccionCliente = afterMarker
                        .split(/\n\n/)[0]  // Primero intentar por párrafos
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .join(', ')
                        .trim();
                      
                      if (direccionCliente) {
                        console.log("[AppointmentDetailModal] ✓ Dirección extraída con split (emoji):", direccionCliente);
                      }
                    }
                  }
                  
                  // Si aún no se encontró, intentar sin emoji
                  if (!direccionCliente && notasNormalizadas.includes('Dirección de atención a domicilio')) {
                    const parts = notasNormalizadas.split(/Dirección de atención a domicilio:/);
                    if (parts.length > 1) {
                      const afterMarker = parts[1].trim();
                      direccionCliente = afterMarker
                        .split(/\n\n/)[0]
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .join(', ')
                        .trim();
                      
                      if (direccionCliente) {
                        console.log("[AppointmentDetailModal] ✓ Dirección extraída con split (sin emoji):", direccionCliente);
                      }
                    }
                  }
                  
                  // Último intento: si las notas solo contienen la dirección (sin marcador)
                  // Esto puede pasar si la dirección se guardó directamente sin el formato estándar
                  if (!direccionCliente && notasNormalizadas.trim()) {
                    // Si no contiene el marcador pero tiene contenido, usar todo como dirección
                    const trimmed = notasNormalizadas.trim();
                    // Solo usar si no parece ser otro tipo de nota (muy corto o muy largo podría ser otra cosa)
                    if (trimmed.length > 5 && trimmed.length < 500) {
                      direccionCliente = trimmed;
                      console.log("[AppointmentDetailModal] ✓ Usando notas completas como dirección:", direccionCliente);
                    }
                  }
                }
                
                if (!direccionCliente) {
                  console.warn("[AppointmentDetailModal] ⚠️ No se pudo extraer la dirección de las notas");
                  console.warn("[AppointmentDetailModal] Notas recibidas:", notas);
                }
              } else {
                console.warn("[AppointmentDetailModal] ⚠️ No hay notas en el appointment para a_domicilio");
                console.warn("[AppointmentDetailModal] Appointment.notes:", appointment.notes);
              }
              
              return (
                <div className="bg-gradient-to-br from-yellow-50 via-amber-50/50 to-white rounded-xl p-5 border border-yellow-200/50 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-yellow-600"
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
                    Cita a Domicilio
                  </h3>
                  <div className="bg-white/60 rounded-lg p-4 border border-yellow-100">
                    <p className="text-base text-gray-900 leading-relaxed mb-2">
                      El profesional llegará a la dirección del cliente en la fecha y hora programada.
                    </p>
                    {direccionCliente ? (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Dirección del cliente:</p>
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {direccionCliente}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-600 italic">
                          La dirección no está disponible en este momento. Por favor, contacta al cliente para confirmar la dirección.
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-3 italic">
                      Asegúrate de tener la dirección correcta antes de la cita.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Información de Pago */}
            {appointment.payment && (
              <div className="bg-gradient-to-br from-green-50 via-emerald-50/50 to-white rounded-xl p-5 border border-green-200/50 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Información de Pago
                </h3>
                <div className="space-y-3 bg-white/60 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Subtotal</span>
                    <span className="text-base font-semibold text-gray-900">
                      ${appointment.payment.subtotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  {appointment.payment.taxes && appointment.payment.taxes > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Impuestos</span>
                      <span className="text-base font-semibold text-gray-900">
                        ${appointment.payment.taxes.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t-2 border-green-200">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ${appointment.payment.total?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            {appointment.notes && (
              <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Notas
                </h3>
                <div className="text-base text-gray-900 bg-white rounded-lg p-4 leading-relaxed border border-blue-100">
                  {appointment.notes}
                </div>
              </div>
            )}

            {/* Información Adicional */}
            {!isRescheduleMode && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
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
                  Información Adicional
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Número de orden:</span>
                    <div className="text-sm font-bold text-gray-900 mt-1">
                      {appointment.orderNumber || `#${appointment.id}`}
                    </div>
                  </div>
                  {appointment.createdAt && (
                    <div className="p-3 bg-white rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Creada el:</span>
                      <div className="text-sm text-gray-700 mt-1">
                        {new Date(appointment.createdAt).toLocaleDateString("es-ES", {
                          timeZone: "Europe/Madrid",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  )}
                  {appointment.updatedAt && (
                    <div className="p-3 bg-white rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actualizada el:</span>
                      <div className="text-sm text-gray-700 mt-1">
                        {new Date(appointment.updatedAt).toLocaleDateString("es-ES", {
                          timeZone: "Europe/Madrid",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección de Reagendamiento */}
            {isRescheduleMode && (
              <div 
                ref={rescheduleSectionRef}
                className="bg-gradient-to-br from-primary/5 via-purple-50/50 to-white rounded-xl p-6 border border-primary/10 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-primary"
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
                    Seleccionar Nueva Fecha y Hora
                  </h3>
                </div>

                {/* Month header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const newMonth = new Date(currentMonth);
                        newMonth.setMonth(newMonth.getMonth() - 1);
                        setCurrentMonth(newMonth);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        const newMonth = new Date(currentMonth);
                        newMonth.setMonth(newMonth.getMonth() + 1);
                        setCurrentMonth(newMonth);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Date chips */}
                {loadingHorarios ? (
                  <div className="text-center py-8 text-gray-500">
                    Cargando horarios disponibles...
                  </div>
                ) : availableDays.length > 0 ? (
                  <>
                    <div className="flex w-full max-w-full gap-2 mb-6 overflow-x-auto snap-x snap-mandatory px-1">
                      {availableDays.slice(0, 14).map((day, i) => {
                        const isSelected =
                          selectedDate &&
                          day.date.getTime() === selectedDate.getTime();
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedDate(day.date);
                              setSelectedTimeSlot(null);
                              // Scroll suave hacia el selector de horarios después de un pequeño delay
                              setTimeout(() => {
                                if (contentRef.current) {
                                  const timeSlotsSection = contentRef.current.querySelector('[data-time-slots]');
                                  if (timeSlotsSection) {
                                    timeSlotsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }
                              }, 100);
                            }}
                            className={`px-3 py-2 rounded-md text-sm whitespace-nowrap snap-center ${
                              isSelected
                                ? "bg-primary text-white"
                                : day.isToday
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {day.dayName} {day.dayNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Times list */}
                    {selectedDate ? (
                      loadingAppointments ? (
                        <div className="text-center py-8 text-gray-500">
                          Cargando horarios...
                        </div>
                      ) : timeSlots.length > 0 ? (
                        <div className="space-y-3" data-time-slots>
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                              Horarios disponibles para{" "}
                              {selectedDate.toLocaleDateString("es-ES", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                                <span>Disponible</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                                <span>Ocupado</span>
                              </div>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {timeSlots.map((slot, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  slot.available &&
                                  setSelectedTimeSlot(slot.time)
                                }
                                disabled={!slot.available}
                                className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
                                  selectedTimeSlot === slot.time
                                    ? "bg-primary/10 border-primary text-primary shadow-md"
                                    : !slot.available
                                    ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                                    : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 hover:shadow-sm"
                                }`}
                                title={
                                  !slot.available
                                    ? "Este horario está ocupado"
                                    : "Click para seleccionar"
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      slot.available
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                  ></div>
                                  <span
                                    className={`text-sm font-medium ${
                                      !slot.available && "line-through"
                                    }`}
                                  >
                                    {slot.displayTime}
                                  </span>
                                  {!slot.available && (
                                    <span className="text-xs text-gray-400 italic">
                                      (Ocupado)
                                    </span>
                                  )}
                                </div>
                                {slot.available && (
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay horarios disponibles para esta fecha
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Selecciona una fecha para ver los horarios disponibles
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {loadingHorarios
                      ? "Cargando días disponibles..."
                      : "No hay días disponibles este mes"}
                  </div>
                )}

                {/* Botón de confirmar reagendamiento */}
                {selectedDate && selectedTimeSlot && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleConfirmReschedule}
                      disabled={isRescheduling}
                      className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRescheduling ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Reagendando...
                        </>
                      ) : (
                        <>
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
                          Confirmar Reagendamiento
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      La nueva fecha será: {selectedDate.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })} a las{" "}
                      {timeSlots.find((s) => s.time === selectedTimeSlot)?.displayTime}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 px-6 py-5 flex justify-between items-center backdrop-blur-sm">
            <div>
              {/* Botón de reagendar - Solo mostrar para citas confirmadas o pendientes y si NO estamos en dashboard profesional */}
              {!isProfessionalDashboard && 
               (appointment.status === "confirmed" || appointment.status === "pending") && (
                <button
                  onClick={() => {
                    setIsRescheduleMode(true);
                    setCurrentMonth(new Date());
                    setSelectedDate(null);
                    setSelectedTimeSlot(null);
                    // Scroll hacia la sección de reagendamiento después de un pequeño delay
                    setTimeout(() => {
                      if (contentRef.current && rescheduleSectionRef.current) {
                        const container = contentRef.current;
                        const section = rescheduleSectionRef.current;
                        const containerTop = container.getBoundingClientRect().top;
                        const sectionTop = section.getBoundingClientRect().top;
                        const currentScrollTop = container.scrollTop;
                        const offset = sectionTop - containerTop + currentScrollTop;
                        container.scrollTo({ 
                          top: Math.max(0, offset - 20), 
                          behavior: 'smooth' 
                        });
                      }
                    }, 200);
                  }}
                  className="px-6 py-2.5 text-white bg-primary rounded-xl hover:bg-primary-dark transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                >
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Reagendar Cita
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {isRescheduleMode && (
                <button
                  onClick={() => {
                    setIsRescheduleMode(false);
                    setSelectedDate(null);
                    setSelectedTimeSlot(null);
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                {isRescheduleMode ? "Cerrar" : "Cerrar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

