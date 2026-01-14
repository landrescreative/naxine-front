"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
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
  const [selectedTipoAtencion, setSelectedTipoAtencion] = useState<
    "presencial" | "en_linea" | "a_domicilio" | null
  >((tipoAtencion as any) || null);
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [direccionDomicilio, setDireccionDomicilio] = useState<string>("");

  // Cargar el precio seleccionado
  useEffect(() => {
    if (precioId && professional.precios) {
      const precio = professional.precios.find(
        (p: any) =>
          String(p.id_precio || p.id || "") === String(precioId) ||
          String(p.raw?.id_precio || "") === String(precioId)
      );
      if (precio) {
        const precioNormalizado: ProfessionalPrice = {
          id_precio: precio.id_precio || precio.id || 0,
          nombre_servicio:
            precio.nombre_servicio ||
            precio.nombre_paquete ||
            precio.nombre ||
            "Servicio",
          descripcion: precio.descripcion || "",
          precio: precio.precio || 0,
          moneda: precio.moneda || "EUR",
          duracion: precio.duracion || undefined,
        };
        setSelectedPrice(precioNormalizado);
      }
    } else if (professional.precios && professional.precios.length > 0) {
      // Si no hay precioId, seleccionar el primero
      const primerPrecio = professional.precios[0];
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
      setSelectedPrice(precioNormalizado);
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
    if (professional.id) {
      const fetchHorarios = async () => {
        try {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
          const res = await fetch(
            `${apiBaseUrl}/disponibilidad-horarios/profesional/${professional.id}`
          );
          if (res.ok) {
            const data = await res.json();
            const extractSchedules = (obj: any): any[] => {
              const results: any[] = [];
              const visit = (node: any) => {
                if (!node) return;
                if (Array.isArray(node)) {
                  if (
                    node.length &&
                    typeof node[0] === "object" &&
                    "dia_semana" in (node[0] || {})
                  ) {
                    results.push(node);
                  } else {
                    node.forEach(visit);
                  }
                } else if (typeof node === "object") {
                  Object.values(node).forEach(visit);
                }
              };
              visit(obj);
              if (!results.length) {
                const guess =
                  obj?.data?.disponibilidad ||
                  obj?.disponibilidad ||
                  obj?.data ||
                  [];
                if (Array.isArray(guess)) results.push(guess);
              }
              return results.flat();
            };
            const horarios = extractSchedules(data);
            setHorariosCargados(horarios);
          }
        } catch (error) {
          console.error("Error loading schedules:", error);
        }
      };
      fetchHorarios();
    }
  }, [professional.id]);

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
      if (
        diaIndex !== undefined &&
        horario.tipo_atencion === selectedTipoAtencion
      ) {
        if (!horarios[diaIndex]) horarios[diaIndex] = [];
        horarios[diaIndex].push({
          desde: horario.hora_inicio.substring(0, 5),
          hasta: horario.hora_fin.substring(0, 5),
        });
      }
    });

    return horarios;
  }, [horariosCargados, selectedTipoAtencion]);

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
        const isAvailable = horariosDisponibles[dayOfWeek] !== undefined;
        const isPast = date < mañana24Horas;
        const isToday = date.getTime() === today.getTime();

        let hasAvailableSlots = false;
        if (isAvailable && !isPast && selectedPrice) {
          const rangosDelDia = horariosDisponibles[dayOfWeek];
          if (rangosDelDia && rangosDelDia.length > 0) {
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
                    aptStart.getTime() + (apt.duration || duracionMinutos) * 60000
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
          }
        } else if (isAvailable && !isPast) {
          hasAvailableSlots = true;
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
  }, [
    currentMonth,
    horariosDisponibles,
    selectedPrice,
    existingAppointments,
  ]);

  const availableDays = useMemo(() => {
    return getAvailableDays();
  }, [getAvailableDays]);

  // Generar slots de tiempo
  const generateTimeSlots = useCallback((
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
      return (
        diaHorarioNormalizado === diaSemanaNormalizado &&
        h.tipo_atencion === selectedTipoAtencion
      );
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
      horariosDelDia.forEach((horarioDelDia) => {
        const desde = timeToMinutes(horarioDelDia.hora_inicio.substring(0, 5));
        const hasta = timeToMinutes(horarioDelDia.hora_fin.substring(0, 5));
        let currentTime = desde;

        while (currentTime + duracionMinutos <= hasta) {
          const slotTime = minutesToTime(currentTime);
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

          slots.push({
            time: slotTime,
            displayTime,
            available,
          });

          currentTime += duracionMinutos;
        }
      });
    }

    return slots;
  }, [
    selectedPrice,
    selectedTipoAtencion,
    horariosCargados,
    existingAppointments,
    normalizarDia,
    timeToMinutes,
    minutesToTime,
    crearFechaEspanaUTC,
    normalizeDateToUTC,
  ]);

  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : [];
  }, [
    selectedDate,
    generateTimeSlots,
  ]);

  // Auto-seleccionar fecha si viene en los parámetros
  useEffect(() => {
    if (initialDate && !selectedDate) {
      setSelectedDate(new Date(initialDate));
    }
  }, [initialDate, selectedDate]);

  // Auto-seleccionar horario si viene en los parámetros
  useEffect(() => {
    if (initialHorario && !selectedTimeSlot) {
      setSelectedTimeSlot(initialHorario);
    }
  }, [initialHorario, selectedTimeSlot]);

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
      router.push(
        "/iniciar-sesion?redirect=" +
          encodeURIComponent(window.location.pathname)
      );
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

      const response = await citasService.createAppointment({
        id_profesional: Number(professional.id),
        id_precio: selectedPrice.id_precio,
        fecha_hora: slotDateTimeUTC.toISOString(),
        tipo_atencion: selectedTipoAtencion || "presencial",
        direccion_domicilio:
          selectedTipoAtencion === "a_domicilio"
            ? direccionDomicilio
            : undefined,
        duracion_minutos: duracionMinutos,
      });

      if (response.success) {
        router.push(
          `/dashboard/cliente/citas/${response.data?.id || ""}`
        );
      } else {
        alert(response.error || "Error al crear la cita");
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      alert(
        error?.message || "Ocurrió un error al crear la cita. Intenta de nuevo."
      );
    } finally {
      setIsCreatingAppointment(false);
    }
  };

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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Time Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Selecciona el horario que deseas
                </p>
                <h1 className="text-2xl font-bold text-gray-900">
                  Selecciona la hora de tu cita
                </h1>
              </div>

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
                          className={`px-3 py-2 rounded-md text-sm whitespace-nowrap snap-center ${
                            isSelected
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
                  <p className="text-gray-500 text-center py-4">
                    No hay fechas disponibles
                  </p>
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
                          className={`w-full text-left px-3 md:px-4 py-3 md:py-4 rounded-xl border flex items-center justify-between transition-all ${
                            selectedTimeSlot === slot.time
                              ? "bg-purple-100 border-purple-300 text-purple-800 shadow-md"
                              : !slot.available
                              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                              : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 hover:shadow-sm"
                          }`}
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
                            {codigosPostalesDomicilio.split(/[,\s]+/)
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
                  {professional.profileImage ? (
                    <Image
                      src={professional.profileImage}
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
                  )}
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
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-base font-bold text-gray-900">
                          {selectedPrice.moneda === "EUR" ? "EUR" : "USD"}{" "}
                          {selectedPrice.precio.toFixed(2)}
                        </span>
                      </div>
                    </div>
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
