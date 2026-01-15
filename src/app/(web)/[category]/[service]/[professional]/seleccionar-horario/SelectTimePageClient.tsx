"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ApiProfessional, ProfessionalPrice } from "@/services/types/api";
import { appointmentsService, citasService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface SelectTimePageClientProps {
  professional: ApiProfessional;
  initialDate?: string;
  precioId?: string;
  tipoAtencion?: string;
  initialHorario?: string;
}

export default function SelectTimePageClient({
  professional,
  initialDate,
  precioId,
  tipoAtencion,
  initialHorario,
}: SelectTimePageClientProps) {
  const router = useRouter();
  const params = useParams<{
    category: string;
    service: string;
    professional: string;
  }>();
  const { user, isAuthenticated } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(
    initialHorario || null
  );
  const [selectedPrice, setSelectedPrice] = useState<ProfessionalPrice | null>(
    null
  );
  // Normalizar tipo de atención inicial
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

  const [selectedTipoAtencion, setSelectedTipoAtencion] = useState<
    "presencial" | "en_linea" | "a_domicilio" | null
  >(normalizeTipoAtencion(tipoAtencion));
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [direccionDomicilio, setDireccionDomicilio] = useState<string>("");
  const [stripeTaxCode, setStripeTaxCode] = useState<string | null>(null);

  // Ref para evitar re-seleccionar el precio múltiples veces
  const hasSelectedPrice = useRef(false);

  // Resetear la referencia cuando cambia el profesional o precioId
  useEffect(() => {
    hasSelectedPrice.current = false;
  }, [professional?.id, precioId]);

  // Cargar el precio seleccionado
  useEffect(() => {
    if (!professional.precios || professional.precios.length === 0) {
      console.log("[SelectTimePageClient] No hay precios disponibles");
      return;
    }

    // Evitar re-seleccionar si ya se seleccionó
    if (hasSelectedPrice.current) {
      return;
    }

    console.log("[SelectTimePageClient] Cargando precio:", {
      precioId,
      totalPrecios: professional.precios.length,
    });

    if (precioId) {
      const precio = professional.precios.find(
        (p: any) =>
          String(p.id_precio || p.id || "") === String(precioId) ||
          String(p.raw?.id_precio || "") === String(precioId)
      );
      if (precio) {
        const precioAny = precio as any;
        const precioNormalizado: ProfessionalPrice = {
          id_precio: precioAny.id_precio || precioAny.id || 0,
          nombre_servicio:
            precioAny.nombre_servicio ||
            precioAny.nombre_paquete ||
            precioAny.nombre ||
            "Servicio",
          descripcion: precioAny.descripcion || "",
          precio: precioAny.precio || 0,
          moneda: precioAny.moneda || "EUR",
          duracion: precioAny.duracion || undefined,
        };
        console.log(
          "[SelectTimePageClient] Precio encontrado por ID:",
          precioNormalizado
        );
        setSelectedPrice(precioNormalizado);
        hasSelectedPrice.current = true;
        return;
      } else {
        console.warn(
          "[SelectTimePageClient] Precio con ID no encontrado, seleccionando el primero"
        );
      }
    }

    // Si no hay precioId o no se encontró el precio, seleccionar el primero
    if (professional.precios.length > 0) {
      const primerPrecio = professional.precios[0] as any;
      const precioNormalizado: ProfessionalPrice = {
        id_precio: primerPrecio.id_precio || primerPrecio.id || 0,
        nombre_servicio:
          primerPrecio.nombre_servicio ||
          primerPrecio.nombre_paquete ||
          primerPrecio.nombre ||
          "Servicio",
        descripcion: primerPrecio.descripcion || "",
        precio: primerPrecio.precio || 0,
        moneda: primerPrecio.moneda || "EUR",
        duracion: primerPrecio.duracion || undefined,
      };
      console.log(
        "[SelectTimePageClient] Auto-seleccionando primer precio:",
        precioNormalizado
      );
      setSelectedPrice(precioNormalizado);
      hasSelectedPrice.current = true;
    }
  }, [precioId, professional.precios]);

  // Cargar horarios del profesional
  const [horariosCargados, setHorariosCargados] = useState<
    Array<{
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
      tipo_atencion: string | null;
    }>
  >([]);

  useEffect(() => {
    if (!professional.id) return;

    // Primero intentar obtener horarios del objeto professional
    const raw = (professional as any).raw;
    const horariosRaw =
      raw?.horarios ||
      (professional as any).horarios ||
      raw?.disponibilidad?.horarios ||
      [];

    console.log(
      "[SelectTimePageClient] Horarios encontrados en professional:",
      horariosRaw,
      "Total:",
      Array.isArray(horariosRaw) ? horariosRaw.length : 0
    );

    // Si hay horarios en el objeto professional, usarlos
    if (Array.isArray(horariosRaw) && horariosRaw.length > 0) {
      const horariosNormalizados = horariosRaw.map((h: any) => {
        let tipoNormalizado = h.tipo_atencion || null;
        if (tipoNormalizado) {
          const tipoLower = String(tipoNormalizado).toLowerCase().trim();
          if (tipoLower === "presencial" || tipoLower === "en_persona") {
            tipoNormalizado = "presencial";
          } else if (
            tipoLower === "en_linea" ||
            tipoLower === "en línea" ||
            tipoLower === "online" ||
            tipoLower === "virtual"
          ) {
            tipoNormalizado = "en_linea";
          } else if (
            tipoLower === "a_domicilio" ||
            tipoLower === "a domicilio" ||
            tipoLower === "domicilio"
          ) {
            tipoNormalizado = "a_domicilio";
          }
        }

        return {
          dia_semana: h.dia_semana || "",
          hora_inicio: h.hora_inicio || "09:00:00",
          hora_fin: h.hora_fin || "17:00:00",
          tipo_atencion: tipoNormalizado,
        };
      });

      console.log(
        "[SelectTimePageClient] Usando horarios del objeto professional:",
        horariosNormalizados.length
      );
      setHorariosCargados(horariosNormalizados);
      return;
    }

    // Si no hay horarios en el objeto, intentar cargar desde el endpoint público
    const fetchHorarios = async () => {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
        const url = `${apiBaseUrl}/disponibilidad-horarios/public/profesional/${professional.id}`;
        console.log(
          `[SelectTimePageClient] Cargando horarios desde endpoint público: ${url}`
        );

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("[SelectTimePageClient] Respuesta del endpoint:", data);

          let horarios: any[] = [];
          if (data.success && data.data?.disponibilidad_horarios) {
            horarios = data.data.disponibilidad_horarios;
          } else if (Array.isArray(data.data)) {
            horarios = data.data;
          } else if (Array.isArray(data)) {
            horarios = data;
          }

          if (horarios.length > 0) {
            // Normalizar tipos de atención en los horarios
            const horariosNormalizados = horarios.map((h: any) => {
              let tipoNormalizado = h.tipo_atencion || null;
              if (tipoNormalizado) {
                const tipoLower = String(tipoNormalizado).toLowerCase().trim();
                if (tipoLower === "presencial" || tipoLower === "en_persona") {
                  tipoNormalizado = "presencial";
                } else if (
                  tipoLower === "en_linea" ||
                  tipoLower === "en línea" ||
                  tipoLower === "online" ||
                  tipoLower === "virtual"
                ) {
                  tipoNormalizado = "en_linea";
                } else if (
                  tipoLower === "a_domicilio" ||
                  tipoLower === "a domicilio" ||
                  tipoLower === "domicilio"
                ) {
                  tipoNormalizado = "a_domicilio";
                }
              }

              return {
                dia_semana: h.dia_semana || "",
                hora_inicio: h.hora_inicio || "09:00:00",
                hora_fin: h.hora_fin || "17:00:00",
                tipo_atencion: tipoNormalizado,
              };
            });

            console.log(
              "[SelectTimePageClient] Horarios cargados desde endpoint:",
              horariosNormalizados.length
            );
            setHorariosCargados(horariosNormalizados);
          } else {
            console.warn(
              "[SelectTimePageClient] No se encontraron horarios en la respuesta"
            );
            setHorariosCargados([]);
          }
        } else {
          console.warn(
            "[SelectTimePageClient] Error al cargar horarios:",
            response.status,
            response.statusText
          );
          setHorariosCargados([]);
        }
      } catch (error) {
        console.error("[SelectTimePageClient] Error loading schedules:", error);
        setHorariosCargados([]);
      }
    };

    fetchHorarios();
  }, [professional.id, professional]);

  // Cargar citas ocupadas
  useEffect(() => {
    if (professional.id && currentMonth) {
      setLoadingAppointments(true);
      const fetchOccupiedAppointments = async () => {
        try {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth() + 1;
          const response = await fetch(
            `${apiBaseUrl}/citas/profesional/${professional.id}/ocupadas?year=${year}&month=${month}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
              setExistingAppointments(
                data.data.map((apt: any) => ({
                  ...apt,
                  dateTimeUTC: apt.dateTimeUTC || apt.dateTime,
                }))
              );
            } else {
              setExistingAppointments([]);
            }
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
  }, [currentMonth, professional.id]);

  // Funciones helper
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

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  const crearFechaEspanaUTC = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number
  ): Date => {
    const fechaEspana = new Date(
      Date.UTC(year, month, day, hour, minute, 0, 0)
    );
    return fechaEspana;
  };

  const normalizeDateToUTC = (dateString: string): Date => {
    return new Date(dateString);
  };

  // Generar horarios disponibles basados en los horarios cargados
  const horariosDisponibles = useMemo(() => {
    const horarios: {
      [key: number]: Array<{ desde: string; hasta: string }>;
    } = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    console.log("[SelectTimePageClient] Generando horarios disponibles:", {
      horariosCargados: horariosCargados.length,
      selectedTipoAtencion,
    });

    horariosCargados.forEach((horario) => {
      const diaNormalizado = normalizarDia(horario.dia_semana);
      const diaMap: { [key: string]: number } = {
        domingo: 0,
        lunes: 1,
        martes: 2,
        miercoles: 2,
        miércoles: 2,
        jueves: 3,
        viernes: 4,
        sabado: 5,
        sábado: 5,
      };
      const diaIndex = diaMap[diaNormalizado];

      // Normalizar tipo de atención para comparación
      const horarioTipoNormalizado = normalizeTipoAtencion(
        horario.tipo_atencion
      );

      // Si el horario no tiene tipo_atencion, mostrarlo para todos los tipos
      // Si tiene tipo_atencion, solo mostrarlo si coincide con el seleccionado
      const tipoCoincide =
        !horarioTipoNormalizado || // Si el horario no tiene tipo, mostrar para todos
        !selectedTipoAtencion || // Si no hay tipo seleccionado, mostrar todos
        horarioTipoNormalizado === selectedTipoAtencion;

      if (diaIndex !== undefined && tipoCoincide) {
        if (!horarios[diaIndex]) horarios[diaIndex] = [];
        horarios[diaIndex].push({
          desde: horario.hora_inicio?.substring(0, 5) || "09:00",
          hasta: horario.hora_fin?.substring(0, 5) || "17:00",
        });
      }
    });

    console.log(
      "[SelectTimePageClient] Horarios disponibles generados:",
      horarios
    );

    return horarios;
  }, [horariosCargados, selectedTipoAtencion, normalizeTipoAtencion]);

  // Obtener tipos de atención disponibles de los horarios
  const tiposAtencionDisponibles = useMemo(() => {
    const tipos = new Set<string>();
    horariosCargados.forEach((horario) => {
      if (horario.tipo_atencion) {
        tipos.add(horario.tipo_atencion);
      }
    });
    return Array.from(tipos) as Array<
      "presencial" | "en_linea" | "a_domicilio"
    >;
  }, [horariosCargados]);

  // Ref para evitar re-seleccionar el tipo de atención múltiples veces
  const hasSelectedTipoAtencion = useRef(false);

  // Resetear la referencia cuando cambia el profesional
  useEffect(() => {
    hasSelectedTipoAtencion.current = false;
  }, [professional?.id]);

  // Auto-seleccionar el primer tipo de atención disponible cuando se cargan los horarios
  useEffect(() => {
    if (
      tiposAtencionDisponibles.length > 0 &&
      !selectedTipoAtencion &&
      !hasSelectedTipoAtencion.current
    ) {
      // Si viene tipoAtencion en los parámetros, usarlo; si no, usar el primero disponible
      const tipoInicial = normalizeTipoAtencion(tipoAtencion);
      if (tipoInicial && tiposAtencionDisponibles.includes(tipoInicial)) {
        console.log(
          "[SelectTimePageClient] Auto-seleccionando tipo de atención desde parámetros:",
          tipoInicial
        );
        setSelectedTipoAtencion(tipoInicial);
        hasSelectedTipoAtencion.current = true;
      } else {
        console.log(
          "[SelectTimePageClient] Auto-seleccionando primer tipo disponible:",
          tiposAtencionDisponibles[0]
        );
        setSelectedTipoAtencion(tiposAtencionDisponibles[0]);
        hasSelectedTipoAtencion.current = true;
      }
    }
  }, [
    tiposAtencionDisponibles,
    selectedTipoAtencion,
    tipoAtencion,
    normalizeTipoAtencion,
  ]);

  // Generar fechas disponibles
  const getAvailableDays = useMemo(() => {
    return () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mañana24Horas = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      mañana24Horas.setHours(0, 0, 0, 0);

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
        const rangosDelDia = horariosDisponibles[dayOfWeek];
        const isAvailable =
          rangosDelDia !== undefined && rangosDelDia.length > 0;
        const isPast = date < mañana24Horas;
        const isToday = date.getTime() === today.getTime();

        let hasAvailableSlots = false;
        // Si hay horarios disponibles para este día y no es pasado, marcar como disponible
        if (isAvailable && !isPast) {
          // Si hay precio seleccionado, verificar slots específicos
          if (selectedPrice && rangosDelDia && rangosDelDia.length > 0) {
            const duracionMinutos = selectedPrice.duracion
              ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
              : 60;

            for (const horario of rangosDelDia) {
              const desde = timeToMinutes(horario.desde);
              const hasta = timeToMinutes(horario.hasta);
              let currentTime = desde;
              while (currentTime + duracionMinutos <= hasta) {
                const hour = Math.floor(currentTime / 60);
                const minute = currentTime % 60;
                const slotDateTimeUTC = crearFechaEspanaUTC(
                  year,
                  month,
                  day,
                  hour,
                  minute
                );
                const slotEndUTC = new Date(
                  slotDateTimeUTC.getTime() + duracionMinutos * 60000
                );

                const isOccupied = existingAppointments.some((apt) => {
                  const aptStart =
                    apt.dateTimeUTC || normalizeDateToUTC(apt.dateTime);
                  const aptEnd = new Date(
                    aptStart.getTime() +
                    (apt.duration || duracionMinutos) * 60000
                  );
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
              if (hasAvailableSlots) break;
            }
          } else {
            // Si no hay precio seleccionado pero hay horarios, marcar como disponible
            // (los slots específicos se verificarán cuando se seleccione un precio)
            hasAvailableSlots = true;
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

      const filteredDays = days.filter((d) => d.available);
      console.log("[SelectTimePageClient] Días disponibles generados:", {
        totalDias: days.length,
        diasDisponibles: filteredDays.length,
        horariosDisponibles,
        selectedPrice: selectedPrice?.id_precio,
        selectedTipoAtencion,
      });
      return filteredDays;
    };
  }, [currentMonth, horariosDisponibles, selectedPrice, existingAppointments]);

  const availableDays = useMemo(() => {
    const days = getAvailableDays();
    console.log(
      "[SelectTimePageClient] availableDays actualizado:",
      days.length,
      "días"
    );
    return days;
  }, [getAvailableDays]);

  // Generar slots de tiempo
  const generateTimeSlots = useCallback(
    (
      date: Date
    ): Array<{ time: string; displayTime: string; available: boolean }> => {
      if (!selectedPrice || !date || !selectedTipoAtencion) return [];

      const dayOfWeek = date.getDay();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(date);
      selectedDateOnly.setHours(0, 0, 0, 0);
      const isToday = selectedDateOnly.getTime() === today.getTime();

      const dayNames = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ];
      const diaSemanaNombre = dayNames[dayOfWeek];
      const diaSemanaNormalizado = normalizarDia(diaSemanaNombre);

      const horariosDelDia = horariosCargados.filter((h) => {
        const diaHorarioNormalizado = normalizarDia(h.dia_semana);
        const horarioTipoNormalizado = normalizeTipoAtencion(h.tipo_atencion);

        // Si el horario no tiene tipo_atencion, mostrarlo para todos los tipos
        // Si tiene tipo_atencion, solo mostrarlo si coincide con el seleccionado
        const tipoCoincide =
          !horarioTipoNormalizado || // Si el horario no tiene tipo, mostrar para todos
          horarioTipoNormalizado === selectedTipoAtencion;

        return diaHorarioNormalizado === diaSemanaNormalizado && tipoCoincide;
      });

      const slots: Array<{
        time: string;
        displayTime: string;
        available: boolean;
      }> = [];

      const duracionMinutos = selectedPrice.duracion
        ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
        : 60;

      if (horariosDelDia.length > 0) {
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
          const desde = timeToMinutes(
            horarioDelDia.hora_inicio.substring(0, 5)
          );
          const hasta = timeToMinutes(horarioDelDia.hora_fin.substring(0, 5));
          let currentTime = desde;

          while (currentTime + duracionMinutos <= hasta) {
            const slotTime = minutesToTime(currentTime);

            // Si ya existe este slot, solo actualizar si el nuevo es más disponible
            if (slotsMap.has(slotTime)) {
              const existingSlot = slotsMap.get(slotTime)!;
              // Si el slot existente no está disponible pero este sí, actualizarlo
              if (!existingSlot.available) {
                // Continuar con la lógica para verificar disponibilidad
              } else {
                // Si el existente ya está disponible, no hacer nada
                currentTime += duracionMinutos;
                continue;
              }
            }

            const hour = Math.floor(currentTime / 60);
            const minute = currentTime % 60;

            const slotDateTimeUTC = crearFechaEspanaUTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              hour,
              minute
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

            const isOccupied = existingAppointments.some((apt) => {
              const aptStart =
                apt.dateTimeUTC || normalizeDateToUTC(apt.dateTime);
              const aptEnd = new Date(
                aptStart.getTime() + (apt.duration || duracionMinutos) * 60000
              );
              return (
                (slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd) ||
                (slotEndUTC > aptStart && slotEndUTC <= aptEnd) ||
                (slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd)
              );
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

            currentTime += duracionMinutos;
          }
        });

        // Convertir el Map a un array y ordenar por tiempo
        return Array.from(slotsMap.values()).sort((a, b) => {
          const timeA = timeToMinutes(a.time);
          const timeB = timeToMinutes(b.time);
          return timeA - timeB;
        });
      }

      return slots;
    },
    [
      selectedPrice,
      selectedTipoAtencion,
      horariosCargados,
      existingAppointments,
      normalizarDia,
      timeToMinutes,
      minutesToTime,
      crearFechaEspanaUTC,
      normalizeDateToUTC,
      normalizeTipoAtencion,
    ]
  );

  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : [];
  }, [selectedDate, generateTimeSlots]);

  // Auto-seleccionar fecha si viene en los parámetros (después de que los horarios se carguen)
  useEffect(() => {
    if (
      initialDate &&
      !selectedDate &&
      horariosCargados.length > 0 &&
      selectedPrice &&
      selectedTipoAtencion
    ) {
      const fechaInicial = new Date(initialDate);
      // Verificar que la fecha esté en los días disponibles
      const tempSlots = generateTimeSlots(fechaInicial);
      if (tempSlots.length > 0) {
        console.log(
          "[SelectTimePageClient] Auto-seleccionando fecha inicial:",
          fechaInicial.toISOString(),
          "con",
          tempSlots.length,
          "slots disponibles"
        );
        setSelectedDate(fechaInicial);
      } else {
        console.warn(
          "[SelectTimePageClient] Fecha inicial no tiene slots disponibles:",
          fechaInicial.toISOString()
        );
        // Si la fecha inicial no tiene slots, seleccionar la primera fecha disponible
        if (availableDays.length > 0) {
          console.log(
            "[SelectTimePageClient] Seleccionando primera fecha disponible:",
            availableDays[0].date.toISOString()
          );
          setSelectedDate(availableDays[0].date);
        }
      }
    }
  }, [
    initialDate,
    selectedDate,
    horariosCargados,
    selectedPrice,
    selectedTipoAtencion,
    generateTimeSlots,
    availableDays,
  ]);

  // Auto-seleccionar horario si viene en los parámetros (después de que la fecha se seleccione)
  useEffect(() => {
    if (
      initialHorario &&
      !selectedTimeSlot &&
      selectedDate &&
      horariosCargados.length > 0 &&
      selectedPrice &&
      selectedTipoAtencion
    ) {
      const tempSlots = generateTimeSlots(selectedDate);
      console.log(
        "[SelectTimePageClient] Buscando horario inicial:",
        initialHorario,
        "Slots disponibles:",
        tempSlots.map((s) => ({ time: s.time, displayTime: s.displayTime }))
      );

      // Normalizar el horario inicial para comparación (puede venir en formato HH:MM o HH:MM:SS)
      const horarioNormalizado = initialHorario.includes(":")
        ? initialHorario.substring(0, 5) // Tomar solo HH:MM
        : initialHorario;

      const slotEncontrado = tempSlots.find(
        (slot) =>
          slot.time === horarioNormalizado ||
          slot.time === initialHorario ||
          slot.displayTime === initialHorario ||
          slot.time.substring(0, 5) === horarioNormalizado
      );

      if (slotEncontrado) {
        if (slotEncontrado.available) {
          console.log(
            "[SelectTimePageClient] Auto-seleccionando horario inicial:",
            slotEncontrado.time
          );
          setSelectedTimeSlot(slotEncontrado.time);
        } else {
          console.warn(
            "[SelectTimePageClient] Horario inicial encontrado pero no disponible:",
            slotEncontrado.time
          );
          // Si el horario exacto no está disponible, seleccionar el primero disponible
          const primerDisponible = tempSlots.find((slot) => slot.available);
          if (primerDisponible) {
            console.log(
              "[SelectTimePageClient] Seleccionando primer horario disponible:",
              primerDisponible.time
            );
            setSelectedTimeSlot(primerDisponible.time);
          }
        }
      } else if (tempSlots.length > 0) {
        // Si el horario exacto no se encuentra, seleccionar el primero disponible
        const primerDisponible = tempSlots.find((slot) => slot.available);
        if (primerDisponible) {
          console.log(
            "[SelectTimePageClient] Horario inicial no encontrado, seleccionando primer disponible:",
            primerDisponible.time
          );
          setSelectedTimeSlot(primerDisponible.time);
        }
      }
    }
  }, [
    initialHorario,
    selectedTimeSlot,
    selectedDate,
    horariosCargados,
    selectedPrice,
    selectedTipoAtencion,
    generateTimeSlots,
  ]);

  const handleDateSelect = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return;
    const dayOfWeek = date.getDay();
    if (!horariosDisponibles[dayOfWeek]) return;

    if (!selectedPrice) {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
      return;
    }

    const tempSlots = generateTimeSlots(date);
    const hasAvailableSlots = tempSlots.some((slot) => slot.available);

    if (!hasAvailableSlots) {
      alert(
        "Esta fecha no tiene horarios disponibles. Por favor, selecciona otra fecha."
      );
      return;
    }

    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedPrice || !selectedDate || !selectedTimeSlot) return;

    if (tiposAtencionDisponibles.length > 0 && !selectedTipoAtencion) {
      alert(
        "Por favor, selecciona un tipo de atención antes de confirmar la cita."
      );
      return;
    }

    if (
      selectedTipoAtencion === "a_domicilio" &&
      (!direccionDomicilio || direccionDomicilio.trim() === "")
    ) {
      alert(
        "Por favor, proporciona tu dirección para la atención a domicilio."
      );
      return;
    }

    if (!isAuthenticated || !user) {
      // Si el usuario no ha iniciado sesión, redirigir a una página de
      // pre-confirmación donde pueda registrarse o iniciar sesión
      try {
        const queryParams = new URLSearchParams();

        // Datos básicos de la cita
        queryParams.set("category", params.category);
        queryParams.set("service", params.service);
        queryParams.set("professionalSlug", params.professional);
        queryParams.set("professionalName", professional.name || "");
        if (professional.city) {
          queryParams.set("professionalCity", professional.city);
        }

        // Foto de perfil (si existe)
        const raw = (professional as any).raw;
        const profileImageUrl =
          (professional as any).profileImage ||
          raw?.foto_perfil ||
          raw?.imagen_perfil ||
          raw?.enlace_publico ||
          "";
        if (profileImageUrl) {
          queryParams.set("professionalImage", profileImageUrl);
        }

        // Datos del servicio/precio
        queryParams.set(
          "serviceName",
          selectedPrice.nombre_servicio || "Servicio"
        );
        queryParams.set("price", String(selectedPrice.precio ?? 0));
        queryParams.set("currency", selectedPrice.moneda || "EUR");
        if (selectedPrice.duracion) {
          queryParams.set("duration", selectedPrice.duracion);
        }

        // Fecha y hora seleccionadas
        queryParams.set("dateISO", selectedDate.toISOString());
        queryParams.set("time", selectedTimeSlot);

        // Tipo de atención
        if (selectedTipoAtencion) {
          queryParams.set("tipoAtencion", selectedTipoAtencion);
        }

        // Snapshot de impuestos para que la tarjeta sea idéntica
        if (taxInfo) {
          queryParams.set("taxBase", String(taxInfo.base));
          queryParams.set("taxAmount", String(taxInfo.tax));
          queryParams.set("taxTotal", String(taxInfo.total));
          queryParams.set("taxPercentage", String(taxInfo.taxPercentage ?? 0));
          queryParams.set("taxIsExempt", taxInfo.isExempt ? "true" : "false");
        }

        // URL a la que queremos volver después de registrarnos / iniciar sesión
        if (typeof window !== "undefined") {
          queryParams.set("returnUrl", window.location.href);
        }

        const confirmPath = `/confirmar-cita?${queryParams.toString()}`;
        router.push(confirmPath);
      } catch {
        // Fallback: si algo falla al construir la URL, redirigir al login clásico
        router.push(
          "/iniciar-sesion?redirect=" +
          encodeURIComponent(window.location.pathname)
        );
      }
      return;
    }

    setIsCreatingAppointment(true);

    try {
      const [hours, minutes] = selectedTimeSlot.split(":").map(Number);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const slotDateTimeUTC = crearFechaEspanaUTC(
        year,
        month,
        day,
        hours,
        minutes
      );

      const duracionMinutos = selectedPrice.duracion
        ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
        : 60;

      const fechaInicio = slotDateTimeUTC.toISOString();
      const fechaFin = new Date(
        slotDateTimeUTC.getTime() + duracionMinutos * 60000
      ).toISOString();

      const response = await citasService.createCita({
        id_cliente: Number(user?.id || 0),
        id_profesional: Number(professional.id),
        id_precio: selectedPrice.id_precio,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        crear_payment_intent: true,
        moneda: selectedPrice.moneda || "EUR",
        tipo_atencion: (selectedTipoAtencion || "presencial") as
          | "presencial"
          | "en_linea"
          | "a_domicilio",
        direccion_domicilio:
          selectedTipoAtencion === "a_domicilio"
            ? direccionDomicilio
            : undefined,
      });

      if (response.success && response.data) {
        // Redirigir a la página de pago o a las citas del cliente
        if (response.data.redirectToPayment) {
          router.push(response.data.redirectToPayment.url);
        } else {
          router.push(
            `/dashboard/cliente/citas/${response.data.cita?.id_cita || ""}`
          );
        }
      } else {
        // Verificar si el error es sobre perfil de cliente incompleto
        const errorMessage = response.error || "";
        if (
          errorMessage.includes("perfil de cliente") ||
          errorMessage.includes("No se encontró un perfil de cliente") ||
          errorMessage.includes("completa tu perfil")
        ) {
          // Redirigir a la página de confirmación en lugar de mostrar error
          try {
            const queryParams = new URLSearchParams();

            // Datos básicos de la cita
            queryParams.set("category", params.category);
            queryParams.set("service", params.service);
            queryParams.set("professionalSlug", params.professional);
            queryParams.set("professionalName", professional.name || "");
            if (professional.city) {
              queryParams.set("professionalCity", professional.city);
            }

            // Foto de perfil (si existe)
            const raw = (professional as any).raw;
            const profileImageUrl =
              (professional as any).profileImage ||
              raw?.foto_perfil ||
              raw?.imagen_perfil ||
              raw?.enlace_publico ||
              "";
            if (profileImageUrl) {
              queryParams.set("professionalImage", profileImageUrl);
            }

            // Datos del servicio/precio
            queryParams.set(
              "serviceName",
              selectedPrice.nombre_servicio || "Servicio"
            );
            queryParams.set("price", String(selectedPrice.precio ?? 0));
            queryParams.set("currency", selectedPrice.moneda || "EUR");
            if (selectedPrice.duracion) {
              queryParams.set("duration", selectedPrice.duracion);
            }

            // Fecha y hora seleccionadas
            queryParams.set("dateISO", selectedDate.toISOString());
            queryParams.set("time", selectedTimeSlot);

            // Tipo de atención
            if (selectedTipoAtencion) {
              queryParams.set("tipoAtencion", selectedTipoAtencion);
            }

            const confirmPath = `/confirmar-cita?${queryParams.toString()}`;
            router.push(confirmPath);
            return;
          } catch (redirectError) {
            console.error("Error redirecting to confirm page:", redirectError);
          }
        }
        alert(response.error || "Error al crear la cita");
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);

      // Verificar si el error es sobre perfil de cliente incompleto
      const errorMessage = error?.message || error?.error || "";
      if (
        errorMessage.includes("perfil de cliente") ||
        errorMessage.includes("No se encontró un perfil de cliente") ||
        errorMessage.includes("completa tu perfil")
      ) {
        // Redirigir a la página de confirmación en lugar de mostrar error
        try {
          const queryParams = new URLSearchParams();

          // Datos básicos de la cita
          queryParams.set("category", params.category);
          queryParams.set("service", params.service);
          queryParams.set("professionalSlug", params.professional);
          queryParams.set("professionalName", professional.name || "");
          if (professional.city) {
            queryParams.set("professionalCity", professional.city);
          }

          // Foto de perfil (si existe)
          const raw = (professional as any).raw;
          const profileImageUrl =
            (professional as any).profileImage ||
            raw?.foto_perfil ||
            raw?.imagen_perfil ||
            raw?.enlace_publico ||
            "";
          if (profileImageUrl) {
            queryParams.set("professionalImage", profileImageUrl);
          }

          // Datos del servicio/precio
          queryParams.set(
            "serviceName",
            selectedPrice.nombre_servicio || "Servicio"
          );
          queryParams.set("price", String(selectedPrice.precio ?? 0));
          queryParams.set("currency", selectedPrice.moneda || "EUR");
          if (selectedPrice.duracion) {
            queryParams.set("duration", selectedPrice.duracion);
          }

          // Fecha y hora seleccionadas
          queryParams.set("dateISO", selectedDate.toISOString());
          queryParams.set("time", selectedTimeSlot);

          // Tipo de atención
          if (selectedTipoAtencion) {
            queryParams.set("tipoAtencion", selectedTipoAtencion);
          }

          const confirmPath = `/confirmar-cita?${queryParams.toString()}`;
          router.push(confirmPath);
          return;
        } catch (redirectError) {
          console.error("Error redirecting to confirm page:", redirectError);
        }
      }

      alert(
        error?.message || "Ocurrió un error al crear la cita. Intenta de nuevo."
      );
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  // Obtener stripe_tax_code desde la especialidad del profesional
  useEffect(() => {
    const fetchStripeTaxCode = async () => {
      try {
        const raw: any = professional as any;
        // Intentar obtener desde el objeto professional
        let taxCode =
          raw?.stripe_tax_code ||
          raw?.raw?.stripe_tax_code ||
          raw?.raw?.especialidad?.stripe_tax_code ||
          null;

        // Si no está disponible, intentar obtener desde el backend usando id_especialidad
        if (!taxCode) {
          const idEspecialidad =
            raw?.id_especialidad ||
            raw?.raw?.id_especialidad ||
            raw?.raw?.especialidad?.id_especialidad ||
            null;

          if (idEspecialidad) {
            const apiBaseUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
            const response = await fetch(
              `${apiBaseUrl}/especialidades/${idEspecialidad}`
            );
            if (response.ok) {
              const data = await response.json();
              taxCode =
                data.data?.stripe_tax_code || data.stripe_tax_code || null;
            }
          }
        }

        setStripeTaxCode(taxCode);
      } catch (error) {
        console.warn(
          "[SelectTimePageClient] Error al obtener stripe_tax_code:",
          error
        );
        // Si hay error, intentar determinar por el nombre de la especialidad
        const raw: any = professional as any;
        const specialtyName = (
          raw?.specialty ||
          raw?.raw?.especialidad?.nombre ||
          raw?.raw?.nombre_especialidad ||
          ""
        ).toLowerCase();

        // Servicios sanitarios (exentos de IVA)
        if (
          specialtyName.includes("psicología") ||
          specialtyName.includes("psicologia") ||
          specialtyName.includes("nutrición") ||
          specialtyName.includes("nutricion") ||
          specialtyName.includes("fisioterapia") ||
          specialtyName.includes("logopedia") ||
          specialtyName.includes("desarrollo personal")
        ) {
          setStripeTaxCode("txcd_10000000");
        }
        // Servicios legales (con IVA)
        else if (specialtyName.includes("legal")) {
          setStripeTaxCode("txcd_10000001");
        }
      }
    };

    fetchStripeTaxCode();
  }, [professional]);

  // Calcular información de impuestos basándome en el stripe_tax_code
  const taxInfo = useMemo(() => {
    if (!selectedPrice) return null;

    const baseAmount = selectedPrice.precio;
    let taxPercentage = 0;
    let isExempt = false;

    // Determinar porcentaje de impuestos según el código
    if (stripeTaxCode === "txcd_10000000") {
      // Servicios sanitarios - IVA exento en España
      taxPercentage = 0;
      isExempt = true;
    } else if (stripeTaxCode === "txcd_10000001") {
      // Servicios legales - IVA 21% en España
      taxPercentage = 21;
      isExempt = false;
    } else {
      // Por defecto, asumir exento si no hay código
      taxPercentage = 0;
      isExempt = true;
    }

    const taxAmount = (baseAmount * taxPercentage) / 100;
    const totalAmount = baseAmount + taxAmount;

    return {
      base: baseAmount,
      tax: taxAmount,
      total: totalAmount,
      taxPercentage,
      isExempt,
    };
  }, [selectedPrice, stripeTaxCode]);

  // Obtener códigos postales
  const codigosPostalesDomicilio = useMemo(() => {
    const raw: any = professional as any;
    let codigos =
      raw?.codigos_postales_domicilio ||
      raw?.homeVisitPostalCodes ||
      raw?.codigosPostales ||
      null;

    if (!codigos && raw?.raw) {
      codigos =
        raw.raw?.codigos_postales_domicilio ||
        raw.raw?.homeVisitPostalCodes ||
        raw.raw?.codigosPostales ||
        null;
    }

    if (codigos && typeof codigos === "string" && codigos.trim()) {
      return codigos.trim();
    }

    return null;
  }, [professional]);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-purple-600 mb-2">
              Selecciona el horario que deseas
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Selecciona la hora de tu cita
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Time Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Date Picker */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </h3>
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
                {availableDays.length > 0 ? (
                  <div className="flex w-full max-w-full gap-2 mb-6 overflow-x-auto snap-x snap-mandatory px-1 sm:px-2">
                    {availableDays.slice(0, 14).map((day, i) => {
                      const isSelected =
                        selectedDate &&
                        day.date.getTime() === selectedDate.getTime();
                      return (
                        <button
                          key={i}
                          onClick={() => handleDateSelect(day.date)}
                          className={`px-3 py-2 rounded-md text-sm whitespace-nowrap snap-center ${isSelected
                              ? "bg-orange-500 text-white"
                              : day.isToday
                                ? "bg-orange-100 text-orange-700 border border-orange-300"
                                : "bg-white text-gray-700 border border-gray-200"
                            }`}
                        >
                          {day.dayName} {day.dayNumber}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    <p className="mb-2">No hay fechas disponibles</p>
                    {!selectedPrice && (
                      <p className="text-sm text-gray-400">
                        Selecciona un paquete de precios primero
                      </p>
                    )}
                    {!selectedTipoAtencion && (
                      <p className="text-sm text-gray-400">
                        Selecciona un tipo de atención primero
                      </p>
                    )}
                    {horariosCargados.length === 0 && (
                      <p className="text-sm text-gray-400">
                        Cargando horarios...
                      </p>
                    )}
                  </div>
                )}

                {/* Time Slots */}
                {selectedDate ? (
                  loadingAppointments ? (
                    <div className="text-center py-8 text-gray-500">
                      Cargando horarios...
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="space-y-3">
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
                      {timeSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            slot.available && setSelectedTimeSlot(slot.time)
                          }
                          disabled={!slot.available}
                          className={`w-full text-left px-3 md:px-4 py-3 md:py-4 rounded-xl border flex items-center justify-between transition-all ${selectedTimeSlot === slot.time
                              ? "bg-purple-100 border-purple-300 text-purple-800 shadow-md"
                              : !slot.available
                                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                                : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 hover:shadow-sm"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${slot.available ? "bg-green-500" : "bg-gray-400"
                                }`}
                            ></div>
                            <span
                              className={`text-sm font-medium ${!slot.available && "line-through"
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
                            <div className="flex items-center gap-2">
                              {selectedTimeSlot === slot.time && (
                                <span className="text-xs text-purple-700 font-medium">
                                  Horario Seleccionado
                                </span>
                              )}
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No hay horarios disponibles para esta fecha
                    </p>
                  )
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Selecciona una fecha para ver los horarios disponibles
                  </p>
                )}
              </div>

              {/* Campo de dirección para citas a domicilio */}
              {selectedTipoAtencion === "a_domicilio" && (
                <div className="mb-6">
                  {codigosPostalesDomicilio && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            Zonas de servicio
                          </h4>
                          <p className="text-sm text-blue-800 mb-2">
                            Este profesional ofrece atención a domicilio en los
                            siguientes códigos postales:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {codigosPostalesDomicilio
                              .split(/[,\s]+/)
                              .filter((cp: string) => cp.trim())
                              .map((cp: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                >
                                  {cp.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección para atención a domicilio{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={direccionDomicilio}
                    onChange={(e) => setDireccionDomicilio(e.target.value)}
                    placeholder="Ingresa tu dirección completa (calle, número, ciudad, código postal)"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Professional Info */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const raw = (professional as any).raw;
                    const profileImageUrl =
                      professional.profileImage ||
                      raw?.foto_perfil ||
                      raw?.imagen_perfil ||
                      raw?.enlace_publico ||
                      null;

                    return profileImageUrl ? (
                      <Image
                        src={profileImageUrl}
                        alt={professional.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                        {professional.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedPrice?.nombre_servicio || "Servicio"}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {professional.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {professional.city || "Ciudad no especificada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Resumen de tu cita
                </h3>
                {selectedPrice && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {selectedPrice.nombre_servicio}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedPrice.duracion || "1h"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Precio</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedPrice.precio.toFixed(2)}
                        {selectedPrice.moneda === "EUR" ? "€" : "$"}
                      </span>
                    </div>
                    {selectedDate && selectedTimeSlot && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Fecha</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedDate.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Hora</span>
                          <span className="text-sm font-medium text-gray-900">
                            {timeSlots.find((s) => s.time === selectedTimeSlot)
                              ?.displayTime || selectedTimeSlot}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Desglose de impuestos */}
                    {taxInfo && (
                      <div className="pt-2 border-t border-gray-200 mt-2 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Subtotal (sin impuestos):
                          </span>
                          <span className="font-medium text-gray-900">
                            {selectedPrice.moneda === "EUR" ? "€" : "$"}{" "}
                            {taxInfo.base.toFixed(2)}
                          </span>
                        </div>
                        {!taxInfo.isExempt && taxInfo.tax > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Impuestos (IVA {taxInfo.taxPercentage}%):
                            </span>
                            <span className="font-medium text-gray-900">
                              {selectedPrice.moneda === "EUR" ? "€" : "$"}{" "}
                              {taxInfo.tax.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {taxInfo.isExempt && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Impuestos:</span>
                            <span className="font-medium text-green-600">
                              Exento
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-semibold text-gray-900">
                              Total
                            </span>
                            <span className="text-base font-bold text-gray-900">
                              {selectedPrice.moneda === "EUR" ? "€" : "$"}{" "}
                              {taxInfo.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {!taxInfo && (
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-gray-900">
                            Total
                          </span>
                          <span className="text-base font-bold text-gray-900">
                            {selectedPrice.moneda === "EUR" ? "€" : "$"}{" "}
                            {selectedPrice.precio.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleConfirmAppointment}
                disabled={
                  !selectedPrice ||
                  !selectedDate ||
                  !selectedTimeSlot ||
                  isCreatingAppointment ||
                  (selectedTipoAtencion === "a_domicilio" &&
                    !direccionDomicilio.trim())
                }
                className="w-full bg-[#1a0082] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1a0082]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingAppointment ? "Procesando..." : "Continuar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
