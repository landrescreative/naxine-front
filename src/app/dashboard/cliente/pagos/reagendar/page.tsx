"use client";

import { use, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SuccessPopup from "@/components/ui/SuccessPopup";
import { disponibilidadService, citasService } from "@/services";
import { useAuth } from "@/hooks/useAuth";

interface ReschedulePageProps {
  searchParams: Promise<{
    sessionId?: string;
    professionalId?: string;
    professionalName?: string;
    currentDate?: string;
    currentTime?: string;
    tipoAtencion?: string;
  }>;
}

export default function ReschedulePage({ searchParams }: ReschedulePageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const sp = use(searchParams);
  const sessionId = sp.sessionId;
  const professionalId = sp.professionalId;
  const [tipoAtencion, setTipoAtencion] = useState<"presencial" | "en_linea" | "a_domicilio">(
    (sp.tipoAtencion as "presencial" | "en_linea" | "a_domicilio") || "en_linea"
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  const [professional, setProfessional] = useState<{
    name: string;
    title: string;
    image: string;
  } | null>(null);
  
  const [currentAppointment, setCurrentAppointment] = useState<{
    date: string;
    time: string;
    modality: string;
  } | null>(null);

  const [todosLosHorarios, setTodosLosHorarios] = useState<Array<{
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    tipo_atencion: string | null;
  }>>([]);

  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loadedProfessionalId, setLoadedProfessionalId] = useState<string | null>(null);
  const [currentAppointmentData, setCurrentAppointmentData] = useState<any>(null);
  const [canReschedule, setCanReschedule] = useState<boolean>(true);
  const [rescheduleRestrictionMessage, setRescheduleRestrictionMessage] = useState<string | null>(null);

  // Helper functions
  const normalizarDia = (dia: string): string => {
    const dias: { [key: string]: string } = {
      domingo: "domingo",
      lunes: "lunes",
      martes: "martes",
      miércoles: "miércoles",
      jueves: "jueves",
      viernes: "viernes",
      sábado: "sábado",
      dom: "domingo",
      lun: "lunes",
      mar: "martes",
      mie: "miércoles",
      mier: "miércoles",
      jue: "jueves",
      vie: "viernes",
      sab: "sábado",
    };
    return dias[dia.toLowerCase()] || dia.toLowerCase();
  };

  const diasMap: { [key: string]: number } = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sábado: 6,
  };

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

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${period}`;
  };

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

  // Cargar información de la cita
  useEffect(() => {
    if (!sessionId || !isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadAppointmentInfo = async () => {
      try {
        setLoading(true);
        const response = await citasService.getCitaPorId(Number(sessionId));
        console.log("[ReschedulePage] Respuesta completa de getCitaPorId:", response);
        if (response.success && response.data) {
          const data = response.data as any;
          const cita = data.data?.cita || data.cita || data;
          console.log("[ReschedulePage] Cita extraída:", cita);
          
          if (!cita) {
            console.error("[ReschedulePage] No se pudo extraer la cita de la respuesta");
            return;
          }
          
          // Guardar datos completos de la cita para usar en el reagendamiento
          console.log("[ReschedulePage] Guardando datos de cita:", {
            id_cita: cita.id_cita,
            id_cliente: cita.id_cliente,
            id_profesional: cita.id_profesional,
            duracion: cita.duracion,
            tipo_atencion: cita.tipo_atencion
          });
          setCurrentAppointmentData(cita);
          
          const fechaInicio = new Date(cita.fecha_inicio);
          
          // Verificar si se puede reagendar (debe ser al menos 24 horas antes)
          const ahora = new Date();
          const diferenciaMs = fechaInicio.getTime() - ahora.getTime();
          const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
          const puedeReagendar = diferenciaHoras >= 24;
          
          setCanReschedule(puedeReagendar);
          
          if (!puedeReagendar) {
            const horasRestantes = Math.floor(diferenciaHoras);
            const minutosRestantes = Math.floor((diferenciaHoras - horasRestantes) * 60);
            if (diferenciaHoras < 0) {
              setRescheduleRestrictionMessage("Esta cita ya pasó y no puede ser reagendada.");
            } else {
              setRescheduleRestrictionMessage(
                `No puedes reagendar esta cita. Faltan menos de 24 horas (${horasRestantes}h ${minutosRestantes}m restantes).`
              );
            }
            console.log("[ReschedulePage] No se puede reagendar - Faltan:", diferenciaHoras, "horas");
          } else {
            setRescheduleRestrictionMessage(null);
            console.log("[ReschedulePage] Se puede reagendar - Faltan:", diferenciaHoras, "horas");
          }
          const fechaFormateada = fechaInicio.toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const horaFormateada = fechaInicio.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          // Establecer tipo de atención desde la cita
          const tipoAtencionCita = cita.tipo_atencion as "presencial" | "en_linea" | "a_domicilio";
          if (tipoAtencionCita) {
            setTipoAtencion(tipoAtencionCita);
            console.log("[ReschedulePage] Tipo de atención establecido desde cita:", tipoAtencionCita);
          }

          setCurrentAppointment({
            date: fechaFormateada,
            time: horaFormateada,
            modality: tipoAtencionCita === "en_linea" ? "En línea" : 
                     tipoAtencionCita === "a_domicilio" ? "A Domicilio" : "Presencial",
          });

          const idProfesional = String(cita.id_profesional || professionalId || "");
          if (idProfesional && idProfesional !== "undefined" && idProfesional !== "null") {
            console.log("[ReschedulePage] Professional ID encontrado:", idProfesional);
            setLoadedProfessionalId(idProfesional);
            // Cargar información del profesional
            // Por ahora usamos datos mock, pero podrías cargar desde la API
            setProfessional({
              name: cita.profesional_nombre || sp.professionalName || "Profesional",
              title: "Especialista",
              image: "/1821c887-f531-4da4-8c1d-e81b8c21c771.png",
            });
          } else {
            console.warn("[ReschedulePage] No se pudo obtener el ID del profesional");
          }
        }
      } catch (error) {
        console.error("Error loading appointment:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointmentInfo();
  }, [sessionId, isAuthenticated, professionalId, sp.professionalName]);

  // Cargar horarios del profesional
  useEffect(() => {
    const idProfesional = loadedProfessionalId || professionalId;
    if (idProfesional && tipoAtencion) {
      console.log("[ReschedulePage] Cargando horarios para profesional:", idProfesional, "tipo:", tipoAtencion);
      setLoadingHorarios(true);
      const fetchHorarios = async () => {
        try {
          const response = await disponibilidadService.getDisponibilidadProfesional(
            idProfesional,
            tipoAtencion
          );
          console.log("[ReschedulePage] Respuesta de horarios:", response);
          if (response.success && response.data) {
            // El apiClient devuelve { success: true, data: {...} }
            // El backend devuelve { success: true, data: { disponibilidad_horarios: [...] } }
            // Entonces response.data es el objeto completo del backend
            const backendData = response.data as any;
            const horarios = backendData.data?.disponibilidad_horarios || backendData.disponibilidad_horarios;
            
            if (horarios && Array.isArray(horarios)) {
              console.log("[ReschedulePage] Horarios cargados:", horarios.length, horarios);
              setTodosLosHorarios(horarios);
            } else {
              console.warn("[ReschedulePage] No se encontraron horarios en la respuesta:", backendData);
              setTodosLosHorarios([]);
            }
          } else {
            console.warn("[ReschedulePage] Respuesta no exitosa:", response);
            setTodosLosHorarios([]);
          }
        } catch (error) {
          console.error("[ReschedulePage] Error al cargar horarios:", error);
        } finally {
          setLoadingHorarios(false);
        }
      };
      fetchHorarios();
    } else {
      console.log("[ReschedulePage] No se pueden cargar horarios - ID:", idProfesional, "tipo:", tipoAtencion);
    }
  }, [loadedProfessionalId, professionalId, tipoAtencion]);

  // Cargar citas ocupadas del mes
  useEffect(() => {
    const idProfesional = loadedProfessionalId || professionalId;
    if (idProfesional && currentMonth) {
      setLoadingAppointments(true);
      const fetchOccupiedAppointments = async () => {
        try {
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const inicioMes = new Date(year, month, 1);
          const finMes = new Date(year, month + 1, 0, 23, 59, 59);

          const response = await citasService.getCitasOcupadas(
            idProfesional,
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
              .filter((cita: any) => String(cita.id_cita) !== String(sessionId)) // Excluir la cita actual
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
  }, [loadedProfessionalId, professionalId, currentMonth, sessionId]);

  // Filtrar horarios según el tipo de atención
  const horariosCargados = useMemo(() => {
    if (!tipoAtencion) {
      console.log("[ReschedulePage] No hay tipoAtencion, retornando array vacío");
      return [];
    }
    const filtered = todosLosHorarios.filter(
      (horario) => horario.tipo_atencion === tipoAtencion
    );
    console.log("[ReschedulePage] Horarios filtrados por tipo:", tipoAtencion, "resultado:", filtered.length, filtered);
    return filtered;
  }, [todosLosHorarios, tipoAtencion]);

  // Extraer horarios disponibles
  const horariosDisponibles = useMemo(() => {
    const horarios: { [key: number]: { desde: string; hasta: string } } = {};
    console.log("[ReschedulePage] Procesando horariosCargados:", horariosCargados.length);
    if (horariosCargados.length > 0) {
      horariosCargados.forEach((horario) => {
        const diaNormalizado = normalizarDia(horario.dia_semana);
        const diaIndex = diasMap[diaNormalizado];
        console.log("[ReschedulePage] Procesando horario:", horario.dia_semana, "->", diaNormalizado, "->", diaIndex);
        if (diaIndex !== undefined) {
          const desde = horario.hora_inicio.substring(0, 5);
          const hasta = horario.hora_fin.substring(0, 5);
          console.log("[ReschedulePage] Horario para día", diaIndex, ":", desde, "-", hasta);
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
    console.log("[ReschedulePage] Horarios disponibles finales:", horarios);
    return horarios;
  }, [horariosCargados]);

  // Generar días disponibles
  const availableDays = useMemo(() => {
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
    }> = [];

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    console.log("[ReschedulePage] Generando días disponibles para mes:", month + 1, year);
    console.log("[ReschedulePage] Horarios disponibles:", horariosDisponibles);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isAvailable = horariosDisponibles[dayOfWeek] !== undefined;
      const isPast = date < today;

      days.push({
        date,
        dayName: dayNames[dayOfWeek],
        dayNumber: day,
        available: isAvailable && !isPast,
      });
    }

    const available = days.filter((d) => d.available);
    console.log("[ReschedulePage] Días disponibles generados:", available.length, available.map(d => `${d.dayName} ${d.dayNumber}`));
    return available;
  }, [currentMonth, horariosDisponibles]);

  // Generar slots de tiempo
  const generateTimeSlots = useCallback(
    (date: Date): Array<{ time: string; displayTime: string; available: boolean }> => {
      if (!date || !tipoAtencion) return [];

      const dayOfWeek = date.getDay();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(date);
      selectedDateOnly.setHours(0, 0, 0, 0);
      const isToday = selectedDateOnly.getTime() === today.getTime();

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
      const duracionMinutos = 60; // Default duration

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
    },
    [horariosCargados, horariosDisponibles, tipoAtencion, existingAppointments]
  );

  const timeSlots = useMemo(() => {
    if (!selectedDate) {
      console.log("[ReschedulePage] No hay fecha seleccionada");
      return [];
    }
    const slots = generateTimeSlots(selectedDate);
    console.log("[ReschedulePage] Slots generados para fecha:", selectedDate, "cantidad:", slots.length, slots);
    return slots;
  }, [selectedDate, generateTimeSlots]);

  // Navegación de mes
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleReschedule = async () => {
    console.log("[ReschedulePage] handleReschedule llamado con:", {
      selectedDate,
      selectedTimeSlot,
      sessionId,
      currentAppointmentData: currentAppointmentData ? "existe" : "null"
    });
    
    if (!selectedDate || !selectedTimeSlot || !sessionId) {
      console.error("[ReschedulePage] Faltan datos básicos para reagendar:", {
        selectedDate,
        selectedTimeSlot,
        sessionId
      });
      alert("Por favor, selecciona una fecha y hora para reagendar la cita.");
      return;
    }
    
    // Validar que se puede reagendar (24 horas antes)
    if (!canReschedule) {
      alert(rescheduleRestrictionMessage || "No puedes reagendar esta cita. Debe ser al menos 24 horas antes de la cita programada.");
      return;
    }
    
    // Si no tenemos los datos de la cita, intentar cargarlos nuevamente
    let appointmentData = currentAppointmentData;
    if (!appointmentData) {
      console.warn("[ReschedulePage] currentAppointmentData es null, intentando cargar nuevamente...");
      try {
        const response = await citasService.getCitaPorId(Number(sessionId));
        if (response.success && response.data) {
          const data = response.data as any;
          const cita = data.data?.cita || data.cita || data;
          if (cita) {
            appointmentData = cita;
            setCurrentAppointmentData(cita);
            
            // Verificar nuevamente si se puede reagendar
            const fechaInicio = new Date(cita.fecha_inicio);
            const ahora = new Date();
            const diferenciaMs = fechaInicio.getTime() - ahora.getTime();
            const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
            
            if (diferenciaHoras < 24) {
              const horasRestantes = Math.floor(diferenciaHoras);
              const minutosRestantes = Math.floor((diferenciaHoras - horasRestantes) * 60);
              alert(
                diferenciaHoras < 0
                  ? "Esta cita ya pasó y no puede ser reagendada."
                  : `No puedes reagendar esta cita. Faltan menos de 24 horas (${horasRestantes}h ${minutosRestantes}m restantes).`
              );
              return;
            }
            
            console.log("[ReschedulePage] Datos de cita cargados exitosamente:", {
              id_cita: cita.id_cita,
              id_cliente: cita.id_cliente,
              id_profesional: cita.id_profesional
            });
          } else {
            console.error("[ReschedulePage] No se pudo extraer la cita de la respuesta");
            alert("No se pudieron cargar los datos de la cita. Por favor, recarga la página.");
            return;
          }
        } else {
          console.error("[ReschedulePage] Respuesta no exitosa al cargar cita:", response);
          alert("Error al cargar los datos de la cita. Por favor, recarga la página.");
          return;
        }
      } catch (error) {
        console.error("[ReschedulePage] Error al cargar datos de la cita:", error);
        alert("Error al cargar los datos de la cita. Por favor, recarga la página.");
        return;
      }
    }

    setIsRescheduling(true);
    try {
      // Usar appointmentData (que puede ser currentAppointmentData o el cargado recientemente)
      if (!appointmentData) {
        throw new Error("No se pudieron obtener los datos de la cita");
      }
      
      // Obtener la duración de la cita actual
      const duracionMinutos = appointmentData.duracion || 60;
      
      // Construir fecha en zona horaria de España
      const [hours, minutes] = selectedTimeSlot.split(":").map(Number);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      
      // Crear fecha UTC que representa la hora seleccionada en España
      const fechaInicioUTC = crearFechaEspanaUTC(year, month, day, hours, minutes);
      const fechaFinUTC = new Date(fechaInicioUTC.getTime() + duracionMinutos * 60000);

      console.log("[ReschedulePage] Reagendando cita:", {
        sessionId,
        fechaInicio: fechaInicioUTC.toISOString(),
        fechaFin: fechaFinUTC.toISOString(),
        duracionMinutos,
        id_cliente: appointmentData.id_cliente,
        id_profesional: appointmentData.id_profesional,
        tipo_atencion: appointmentData.tipo_atencion
      });

      // El backend requiere id_cliente e id_profesional según validateCita.crear
      const response = await citasService.actualizarCita(Number(sessionId), {
        id_cliente: appointmentData.id_cliente,
        id_profesional: appointmentData.id_profesional,
        fecha_inicio: fechaInicioUTC.toISOString(),
        fecha_fin: fechaFinUTC.toISOString(),
        tipo_atencion: appointmentData.tipo_atencion,
      });

      if (response.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          router.push("/dashboard/cliente/pagos");
        }, 2000);
      } else {
        const errorMessage = (response as any).error || response.error || "Error desconocido";
        const errorDetails = (response as any).errorDetails;
        console.error("[ReschedulePage] Error al reagendar:", errorMessage, errorDetails);
        alert(`Error al reagendar la cita: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error("[ReschedulePage] Error al reagendar:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      alert(`Error al reagendar la cita: ${errorMessage}`);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleConfirmReschedule = () => {
    setShowSuccessPopup(false);
    router.push("/dashboard/cliente/pagos");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reagendar Cita
              </h1>
              <p className="text-gray-600 mt-1">
                Selecciona una nueva fecha y hora para tu cita
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Professional Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              {professional && (
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative">
                    <Image
                      src={professional.image}
                      alt={professional.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {professional.name}
                    </h3>
                    <p className="text-sm text-gray-600">{professional.title}</p>
                  </div>
                </div>
              )}

              {/* Current Appointment Info */}
              {currentAppointment && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Cita Actual
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span className="font-medium">{currentAppointment.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hora:</span>
                      <span className="font-medium">{currentAppointment.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modalidad:</span>
                      <span className="font-medium">{currentAppointment.modality}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* New Appointment Summary */}
              <div className="bg-primary/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Nueva Cita
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span className="font-medium text-primary">
                      {selectedDate
                        ? selectedDate.toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        : "No seleccionada"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora:</span>
                    <span className="font-medium text-primary">
                      {selectedTimeSlot
                        ? timeSlots.find((s) => s.time === selectedTimeSlot)?.displayTime || selectedTimeSlot
                        : "No seleccionada"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modalidad:</span>
                    <span className="font-medium text-primary">
                      {currentAppointment?.modality || "En línea"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar and Time Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecciona Nueva Fecha y Hora
                </h2>
                {!canReschedule && rescheduleRestrictionMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-red-800">
                          Reagendamiento no disponible
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {rescheduleRestrictionMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Month header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-700">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Date chips */}
              {!canReschedule ? (
                <div className="text-center py-8 mb-8 text-gray-500">
                  <p className="text-sm">{rescheduleRestrictionMessage}</p>
                </div>
              ) : loadingHorarios ? (
                <div className="flex items-center justify-center py-8 mb-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Cargando días disponibles...</p>
                  </div>
                </div>
              ) : availableDays.length > 0 ? (
                <div className="flex w-full max-w-full gap-3 mb-8 overflow-x-auto snap-x snap-mandatory px-1">
                  {availableDays.map((day, i) => {
                    const isSelected =
                      selectedDate &&
                      selectedDate.getDate() === day.date.getDate() &&
                      selectedDate.getMonth() === day.date.getMonth() &&
                      selectedDate.getFullYear() === day.date.getFullYear();
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          console.log("[ReschedulePage] Fecha seleccionada:", day.date);
                          setSelectedDate(day.date);
                        }}
                        className={`px-4 py-3 rounded-lg text-sm whitespace-nowrap snap-center transition-all duration-200 ${
                          isSelected
                            ? "bg-primary text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {day.dayName} {day.dayNumber}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 mb-8 text-gray-500">
                  <p>No hay días disponibles en este mes</p>
                  <p className="text-sm mt-2">El profesional no tiene horarios configurados para este mes</p>
                </div>
              )}

              {/* Times list */}
              {loadingHorarios || loadingAppointments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Cargando horarios...</p>
                  </div>
                </div>
              ) : selectedDate && timeSlots.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Horarios Disponibles
                  </h4>
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                    {timeSlots.map((slot, idx) => (
                      <button
                        key={`slot-${idx}`}
                        onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                        disabled={!slot.available}
                        className={`w-full text-left rounded-xl border flex items-center justify-between transition-all duration-200 overflow-hidden ${
                          selectedTimeSlot === slot.time
                            ? "bg-primary text-white border-primary shadow-md"
                            : slot.available
                            ? "bg-white border-gray-200 hover:bg-gray-50 hover:border-primary/50 text-gray-700 cursor-pointer"
                            : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3 px-6 py-4">
                          <span className="text-sm font-medium">{slot.displayTime}</span>
                          {!slot.available && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              Ocupado
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-4 ${
                            selectedTimeSlot === slot.time
                              ? "text-white"
                              : slot.available
                              ? "text-gray-400"
                              : "text-gray-300"
                          }`}
                        >
                          {slot.available ? (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedDate ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No hay horarios disponibles para esta fecha</p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Selecciona una fecha para ver los horarios disponibles</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={!selectedDate || !selectedTimeSlot || isRescheduling || !canReschedule}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRescheduling ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Reagendando...
                    </>
                  ) : (
                    "Confirmar Reagendamiento"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={handleConfirmReschedule}
        message="Cita reagendada exitosamente"
        duration={3000}
      />
    </div>
  );
}
