"use client";

import { use, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SuccessPopup from "@/components/ui/SuccessPopup";
import { disponibilidadService, citasService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { createSpainLocalDateUTC, parseMySQLDateAsSpainLocal } from "@/services/utils/api-helpers";

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
    // Retornar formato 24 horas para los slots (HH:MM)
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Usar funciones centralizadas de api-helpers.ts
  const crearFechaEspanaUTC = createSpainLocalDateUTC;
  const normalizeDateToUTC = parseMySQLDateAsSpainLocal;

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

  // Normalizar tipo de atención
  const normalizeTipoAtencion = useCallback(
    (tipo: any): "presencial" | "en_linea" | "a_domicilio" | null => {
      if (!tipo) return null;
      const tipoLower = String(tipo).toLowerCase().trim();
      if (tipoLower === "presencial" || tipoLower === "en_persona") {
        return "presencial";
      } else if (
        tipoLower === "en_linea" ||
        tipoLower === "en línea" ||
        tipoLower === "online" ||
        tipoLower === "virtual"
      ) {
        return "en_linea";
      } else if (
        tipoLower === "a_domicilio" ||
        tipoLower === "a domicilio" ||
        tipoLower === "domicilio"
      ) {
        return "a_domicilio";
      }
      return null;
    },
    []
  );

  // Cargar horarios del profesional desde endpoint público (igual que SelectTimePageClient)
  useEffect(() => {
    const idProfesional = loadedProfessionalId || professionalId;
    if (!idProfesional || !tipoAtencion) {
      console.log("[ReschedulePage] No se pueden cargar horarios - ID:", idProfesional, "tipo:", tipoAtencion);
      setTodosLosHorarios([]);
      return;
    }

    console.log("[ReschedulePage] Cargando horarios para profesional:", idProfesional, "tipo:", tipoAtencion);
    setLoadingHorarios(true);
    
    const fetchHorariosDesdeEndpoint = async () => {
      try {
        const tipoNormalizado = normalizeTipoAtencion(tipoAtencion);
        if (!tipoNormalizado) {
          console.warn("[ReschedulePage] ⚠️ No hay tipo de atención válido, esperando...");
          setTodosLosHorarios([]);
          return;
        }

        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
        const url = `${apiBaseUrl}/disponibilidad-horarios/public/profesional/${idProfesional}`;
        console.log(
          `[ReschedulePage] Cargando horarios desde endpoint público: ${url} (filtrando por tipo: ${tipoNormalizado})`
        );

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("[ReschedulePage] Respuesta del endpoint:", data);

          let horarios: any[] = [];
          if (data.success && data.data?.disponibilidad_horarios) {
            horarios = data.data.disponibilidad_horarios;
          } else if (Array.isArray(data.data)) {
            horarios = data.data;
          } else if (Array.isArray(data)) {
            horarios = data;
          }

          if (horarios.length > 0) {
            // Normalizar y filtrar horarios por tipo de atención
            const normalizarYFiltrarHorarios = (horarios: any[]) => {
              const horariosNormalizados = horarios.map((h: any) => {
                let tipoNormalizado = h.tipo_atencion || null;
                
                if (tipoNormalizado) {
                  const tipoLower = String(tipoNormalizado).toLowerCase().trim();
                  
                  if (tipoLower === "presencial" || tipoLower === "en_linea" || tipoLower === "a_domicilio") {
                    tipoNormalizado = tipoLower;
                  } else {
                    if (tipoLower === "en_persona") {
                      tipoNormalizado = "presencial";
                    } else if (
                      tipoLower === "en línea" ||
                      tipoLower === "en-linea" ||
                      tipoLower === "online" ||
                      tipoLower === "virtual"
                    ) {
                      tipoNormalizado = "en_linea";
                    } else if (
                      tipoLower === "a-domicilio" ||
                      tipoLower === "a domicilio" ||
                      tipoLower === "domicilio"
                    ) {
                      tipoNormalizado = "a_domicilio";
                    }
                  }
                }

                return {
                  dia_semana: h.dia_semana || "",
                  hora_inicio: h.hora_inicio || "09:00:00",
                  hora_fin: h.hora_fin || "17:00:00",
                  tipo_atencion: tipoNormalizado,
                };
              });

              // Filtrar por el tipo de atención
              const horariosFiltrados = horariosNormalizados.filter((h) => {
                return h.tipo_atencion === tipoNormalizado;
              });

              return horariosFiltrados.map((h) => ({
                dia_semana: h.dia_semana,
                hora_inicio: h.hora_inicio,
                hora_fin: h.hora_fin,
                tipo_atencion: h.tipo_atencion,
              }));
            };

            const horariosFiltrados = normalizarYFiltrarHorarios(horarios);

            console.log(
              "[ReschedulePage] Horarios cargados desde endpoint:",
              horariosFiltrados.length,
              "de",
              horarios.length,
              "total (filtrados por tipo:",
              tipoNormalizado,
              ")"
            );
            setTodosLosHorarios(horariosFiltrados);
          } else {
            console.warn(
              "[ReschedulePage] No se encontraron horarios en la respuesta"
            );
            setTodosLosHorarios([]);
          }
        } else {
          console.warn(
            "[ReschedulePage] Error al cargar horarios:",
            response.status,
            response.statusText
          );
          setTodosLosHorarios([]);
        }
      } catch (error) {
        console.error("[ReschedulePage] Error loading schedules:", error);
        setTodosLosHorarios([]);
      } finally {
        setLoadingHorarios(false);
      }
    };

    fetchHorariosDesdeEndpoint();
  }, [loadedProfessionalId, professionalId, tipoAtencion, normalizeTipoAtencion]);

  // Cargar citas ocupadas del mes (igual que SelectTimePageClient)
  useEffect(() => {
    const idProfesional = loadedProfessionalId || professionalId;
    if (idProfesional && currentMonth) {
      setLoadingAppointments(true);
      const fetchOccupiedAppointments = async () => {
        try {
          // Calcular rango del mes visible
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const inicioMes = new Date(year, month, 1);
          const finMes = new Date(year, month + 1, 0, 23, 59, 59);

          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
          const response = await fetch(
            `${apiBaseUrl}/citas/profesional/${idProfesional}/ocupadas?fecha_inicio=${inicioMes.toISOString()}&fecha_fin=${finMes.toISOString()}`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // Manejar estructura anidada: response.data.data.citas o response.data.citas
            let citasData = null;
            if (data.success && data.data) {
              if (
                data.data.data &&
                data.data.data.citas &&
                Array.isArray(data.data.data.citas)
              ) {
                citasData = data.data.data.citas;
              } else if (data.data.citas && Array.isArray(data.data.citas)) {
                citasData = data.data.citas;
              } else if (Array.isArray(data.data)) {
                citasData = data.data;
              }
            }

            if (citasData && citasData.length > 0) {
              // Convertir citas ocupadas al formato esperado por el componente
              // Normalizar fechas a UTC para comparación precisa
              const appointments = citasData
                .filter((cita: any) => String(cita.id_cita) !== String(sessionId)) // Excluir la cita actual
                .map((cita: any) => {
                  // Los eventos de Google Calendar y Outlook ya vienen en formato ISO UTC desde el backend
                  // Solo las citas de la plataforma (MySQL DATETIME) necesitan conversión
                  let fechaInicioUTC: Date;
                  let fechaFinUTC: Date;
                  
                  if (cita.fuente === "google_calendar" || cita.fuente === "outlook_calendar") {
                    // Eventos externos ya vienen en formato ISO UTC desde el backend
                    fechaInicioUTC = new Date(cita.fecha_inicio);
                    fechaFinUTC = new Date(cita.fecha_fin);
                  } else {
                    // Citas de la plataforma vienen en formato MySQL DATETIME, necesitan conversión
                    fechaInicioUTC = normalizeDateToUTC(cita.fecha_inicio);
                    fechaFinUTC = normalizeDateToUTC(cita.fecha_fin);
                  }
                  
                  const duration = Math.round(
                    (fechaFinUTC.getTime() - fechaInicioUTC.getTime()) / 60000
                  );

                  // Generar ID único
                  let uniqueId = String(
                    cita.id_cita ||
                      cita.id_evento_google ||
                      cita.id_evento_outlook ||
                      `event_${Date.now()}_${Math.random()}`
                  );

                  if (
                    cita.id_cita &&
                    (cita.id_cita.toString().startsWith("gc_") ||
                      cita.id_cita.toString().startsWith("oc_"))
                  ) {
                    uniqueId = String(cita.id_cita);
                  }

                  return {
                    id: uniqueId,
                    dateTime: fechaInicioUTC.toISOString(), // Guardar en formato ISO UTC
                    dateTimeUTC: fechaInicioUTC, // Guardar objeto Date UTC para comparación rápida
                    dateTimeEnd: fechaFinUTC.toISOString(), // Guardar fecha fin en formato ISO UTC
                    dateTimeEndUTC: fechaFinUTC, // Guardar objeto Date UTC para fecha fin
                    duration,
                    estado: cita.estado || "confirmada",
                    fuente: cita.fuente || "plataforma",
                    titulo: cita.titulo || null,
                  };
                });
              
              console.log(
                `[ReschedulePage] ✅ Citas ocupadas cargadas: ${appointments.length} total`
              );
              
              setExistingAppointments(appointments);
            } else {
              console.warn(
                "[ReschedulePage] No se encontraron citas ocupadas o la estructura de respuesta es incorrecta:",
                data
              );
              setExistingAppointments([]);
            }
          } else {
            console.error(
              "[ReschedulePage] Error al cargar citas ocupadas:",
              response.status,
              response.statusText
            );
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

  // Generar slots de tiempo (igual que SelectTimePageClient)
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
      
      // Los horarios ya están filtrados por tipo de atención desde la carga
      const horariosDelDia = horariosCargados.filter((h) => {
        const diaHorarioNormalizado = normalizarDia(h.dia_semana);
        const horarioTipoNormalizado = normalizeTipoAtencion(h.tipo_atencion);
        const tipoCoincide = horarioTipoNormalizado === tipoAtencion;
        return diaHorarioNormalizado === diaSemanaNormalizado && tipoCoincide;
      });

      if (horariosDelDia.length === 0) return [];

      const slots: Array<{ time: string; displayTime: string; available: boolean }> = [];
      const duracionMinutos = currentAppointmentData?.duracion 
        ? parseInt(String(currentAppointmentData.duracion).replace(/\D/g, "")) || 60
        : 60;

      // Intervalo fijo para generar slots (cada 15 minutos)
      const slotIntervalMinutes = 15;

      // Usar un Map para evitar duplicados basándose en el time del slot
      const slotsMap = new Map<
        string,
        {
          time: string;
          displayTime: string;
          available: boolean;
        }
      >();

      horariosDelDia.forEach((horarioDelDia) => {
        const desde = timeToMinutes(horarioDelDia.hora_inicio.substring(0, 5));
        const hasta = timeToMinutes(horarioDelDia.hora_fin.substring(0, 5));
        let currentTime = desde;

        // Generar slots cada slotIntervalMinutes minutos, verificando si hay tiempo suficiente
        while (currentTime + duracionMinutos <= hasta) {
          const slotTime = minutesToTime(currentTime);

          // Si ya existe este slot, solo actualizar si el nuevo es más disponible
          if (slotsMap.has(slotTime)) {
            const existingSlot = slotsMap.get(slotTime)!;
            if (!existingSlot.available) {
              // Continuar con la lógica para verificar disponibilidad
            } else {
              // Si el existente ya está disponible, no hacer nada
              currentTime += slotIntervalMinutes;
              continue;
            }
          }

          const hour = Math.floor(currentTime / 60);
          const minute = currentTime % 60;
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          
          const slotDateTimeUTC = createSpainLocalDateUTC(
            year,
            month,
            day,
            hour,
            minute,
            0
          );
          const slotEndUTC = new Date(
            slotDateTimeUTC.getTime() + duracionMinutos * 60000
          );

          let isPastTime = false;
          if (isToday) {
            const now = new Date();
            const nowInSpain = new Date(
              now.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
            );
            const nowMinutes =
              nowInSpain.getHours() * 60 + nowInSpain.getMinutes();
            if (currentTime < nowMinutes) {
              isPastTime = true;
            }
          }

          // Verificar si hay suficiente tiempo continuo disponible desde este slot
          // Un slot está ocupado si se solapa con alguna cita existente
          const isOccupied = existingAppointments.some((apt) => {
            // Asegurarse de que aptStart sea un objeto Date válido
            const aptStart =
              apt.dateTimeUTC instanceof Date
                ? apt.dateTimeUTC
                : normalizeDateToUTC(apt.dateTime || apt.dateTimeUTC);
            
            // Si la cita tiene fecha_fin, usarla directamente en lugar de calcular desde duration
            let aptEnd: Date;
            if (apt.dateTimeEndUTC instanceof Date) {
              aptEnd = apt.dateTimeEndUTC;
            } else if (apt.dateTimeEnd) {
              aptEnd = normalizeDateToUTC(apt.dateTimeEnd);
            } else {
              // Fallback: calcular desde duration
              aptEnd = new Date(
                aptStart.getTime() + (apt.duration || duracionMinutos) * 60000
              );
            }
            
            // Lógica de solapamiento: dos intervalos se solapan si:
            // 1. El inicio del slot está dentro del intervalo de la cita (>= inicio y < fin)
            // 2. El fin del slot está dentro del intervalo de la cita (>= inicio y <= fin)
            // 3. El slot contiene completamente la cita (slot inicio <= cita inicio y slot fin >= cita fin)
            // 4. El slot empieza exactamente cuando termina la cita (necesitamos buffer de 15 minutos entre citas)
            const condition1 = slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd;
            const condition2 = slotEndUTC > aptStart && slotEndUTC <= aptEnd;
            const condition3 = slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd;
            const condition4 = slotDateTimeUTC.getTime() === aptEnd.getTime(); // Slot empieza cuando termina la cita (buffer necesario)
            const hasOverlap = condition1 || condition2 || condition3 || condition4;
            
            return hasOverlap;
          });

          const available = !isPastTime && !isOccupied;

          const [hours24, minutes24] = slotTime.split(":").map(Number);
          const period = hours24 >= 12 ? "pm" : "am";
          const hours12 = hours24 % 12 || 12;
          const displayTime = `${hours12}:${minutes24
            .toString()
            .padStart(2, "0")}${period}`;

          // Solo agregar si no existe o si el existente no está disponible y este sí
          if (!slotsMap.has(slotTime) || !slotsMap.get(slotTime)!.available) {
            slotsMap.set(slotTime, {
              time: slotTime,
              displayTime,
              available,
            });
          }

          // Incrementar por intervalo fijo (15 minutos) en lugar de por duración completa
          currentTime += slotIntervalMinutes;
        }
      });

      // Convertir el Map a un array y ordenar por tiempo
      return Array.from(slotsMap.values()).sort((a, b) => {
        const timeA = timeToMinutes(a.time);
        const timeB = timeToMinutes(b.time);
        return timeA - timeB;
      });
    },
    [
      horariosCargados,
      tipoAtencion,
      existingAppointments,
      normalizarDia,
      timeToMinutes,
      minutesToTime,
      crearFechaEspanaUTC,
      normalizeDateToUTC,
      normalizeTipoAtencion,
      currentAppointmentData,
    ]
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
      const fechaInicioUTC = createSpainLocalDateUTC(year, month, day, hours, minutes, 0);
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
