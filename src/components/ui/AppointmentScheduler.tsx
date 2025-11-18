"use client";
import { useState, useMemo, useEffect } from "react";
import { ApiProfessional, ProfessionalPrice } from "@/services/types/api";
import { appointmentsService } from "@/services";

interface AppointmentSchedulerProps {
  professional: ApiProfessional;
  selectedPrice?: ProfessionalPrice;
  onSelectPrice: (price: ProfessionalPrice) => void;
  onConfirm: (appointmentData: {
    id_precio: number;
    fecha: string;
    hora_inicio: string;
  }) => void;
}

interface TimeSlot {
  time: string;
  displayTime: string;
  available: boolean;
}

export default function AppointmentScheduler({
  professional,
  selectedPrice,
  onSelectPrice,
  onConfirm,
}: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mapeo de días en español a índices
  const diasMap: { [key: string]: number } = {
    lunes: 1,
    martes: 2,
    miércoles: 3,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sábado: 6,
    sabado: 6,
    domingo: 0,
  };

  // Extraer horarios del profesional
  const horariosDisponibles = useMemo(() => {
    const horarios: { [key: number]: { desde: string; hasta: string } } = {};
    
    // Primero intentar usar disponibilidadRaw si está disponible (datos originales del backend)
    const disponibilidadRaw = (professional as any).disponibilidadRaw;
    
    if (disponibilidadRaw && disponibilidadRaw.dias && disponibilidadRaw.horario) {
      const desde = disponibilidadRaw.horario.desde || disponibilidadRaw.horario.inicio || "09:00";
      const hasta = disponibilidadRaw.horario.hasta || disponibilidadRaw.horario.fin || "18:00";
      
      disponibilidadRaw.dias.forEach((dia: string) => {
        const diaLower = dia.toLowerCase().trim();
        const diaIndex = diasMap[diaLower];
        if (diaIndex !== undefined) {
          horarios[diaIndex] = { desde, hasta };
        }
      });
    } else {
      // Formato legacy: verificar availability por día
      const availability = professional.availability as any;
      
      if (availability && typeof availability === 'object') {
        // Si tiene estructura { dias: [...], horario: {...} }
        if (availability.dias && availability.horario) {
          const desde = availability.horario.desde || availability.horario.inicio || "09:00";
          const hasta = availability.horario.hasta || availability.horario.fin || "18:00";
          
          availability.dias.forEach((dia: string) => {
            const diaLower = dia.toLowerCase().trim();
            const diaIndex = diasMap[diaLower];
            if (diaIndex !== undefined) {
              horarios[diaIndex] = { desde, hasta };
            }
          });
        } else {
          // Formato legacy con arrays por día
          Object.keys(availability).forEach((day) => {
            const dayKey = day.toLowerCase();
            const dayIndex = diasMap[dayKey];
            if (dayIndex !== undefined) {
              const times = availability[day];
              if (Array.isArray(times) && times.length > 0) {
                const sortedTimes = times.sort();
                horarios[dayIndex] = {
                  desde: sortedTimes[0],
                  hasta: sortedTimes[sortedTimes.length - 1],
                };
              }
            }
          });
        }
      }
    }

    return horarios;
  }, [professional.availability, (professional as any).disponibilidadRaw]);

  // Convertir hora "05:00 AM" o "05:00:00" a minutos desde medianoche
  const timeToMinutes = (timeStr: string): number => {
    // Limpiar y normalizar formato
    const cleaned = timeStr.trim().toUpperCase();
    
    // Si tiene formato "HH:MM AM/PM"
    if (cleaned.includes("AM") || cleaned.includes("PM")) {
      const [time, period] = cleaned.split(/\s*(AM|PM)/);
      const [hours, minutes] = time.split(":").map(Number);
      let totalMinutes = hours * 60 + (minutes || 0);
      
      if (period === "PM" && hours !== 12) {
        totalMinutes += 12 * 60;
      }
      if (period === "AM" && hours === 12) {
        totalMinutes -= 12 * 60;
      }
      
      return totalMinutes;
    }
    
    // Si tiene formato "HH:MM:SS" o "HH:MM"
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

  // Generar slots de tiempo para un día específico
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    if (!selectedPrice) return [];

    const dayOfWeek = date.getDay();
    const horario = horariosDisponibles[dayOfWeek];

    if (!horario) return [];

    const desde = timeToMinutes(horario.desde);
    const hasta = timeToMinutes(horario.hasta);
    const duracionMinutos = selectedPrice.duracion 
      ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
      : 60;

    const slots: TimeSlot[] = [];
    let currentTime = desde;

    while (currentTime + duracionMinutos <= hasta) {
      const slotTime = minutesToTime(currentTime);
      const slotDateTime = new Date(date);
      slotDateTime.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);

      // Verificar si el slot se solapa con citas existentes
      const isOccupied = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.dateTime);
        const aptEnd = new Date(aptStart.getTime() + (apt.duration || duracionMinutos) * 60000);
        const slotEnd = new Date(slotDateTime.getTime() + duracionMinutos * 60000);
        
        // Verificar solapamiento: el slot se solapa si:
        // - El inicio del slot está dentro del rango de la cita existente, O
        // - El fin del slot está dentro del rango de la cita existente, O
        // - El slot contiene completamente la cita existente
        return (
          (slotDateTime >= aptStart && slotDateTime < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (slotDateTime <= aptStart && slotEnd >= aptEnd)
        );
      });

      slots.push({
        time: `${Math.floor(currentTime / 60).toString().padStart(2, "0")}:${(currentTime % 60).toString().padStart(2, "0")}`,
        displayTime: slotTime,
        available: !isOccupied,
      });

      currentTime += duracionMinutos;
    }

    return slots;
  };

  // Cargar citas ocupadas del mes completo cuando cambia el mes o el profesional
  useEffect(() => {
    if (professional.id && currentMonth) {
      setLoadingAppointments(true);
      const fetchOccupiedAppointments = async () => {
        try {
          // Calcular rango del mes visible
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const inicioMes = new Date(year, month, 1);
          const finMes = new Date(year, month + 1, 0, 23, 59, 59);
          
          // Importar citasService
          const { citasService } = await import("@/services/api/citas");
          
          // Obtener citas ocupadas del mes
          const response = await citasService.getCitasOcupadas(
            professional.id,
            inicioMes.toISOString(),
            finMes.toISOString()
          );

          // Acceder directamente a response.data.citas
          let citasData = null;
          if (response.success && response.data && response.data.citas && Array.isArray(response.data.citas)) {
            citasData = response.data.citas;
          }

          if (citasData && citasData.length > 0) {
            // Convertir citas ocupadas al formato esperado por el componente
            const appointments = citasData.map((cita: any) => ({
              id: String(cita.id_cita),
              dateTime: cita.fecha_inicio,
              duration: Math.round(
                (new Date(cita.fecha_fin).getTime() - 
                 new Date(cita.fecha_inicio).getTime()) / 60000
              ),
              estado: cita.estado
            }));
            setExistingAppointments(appointments);
            console.log(`[AppointmentScheduler] Citas ocupadas cargadas: ${appointments.length}`, appointments);
          } else {
            console.warn('[AppointmentScheduler] No se encontraron citas ocupadas o la estructura de respuesta es incorrecta:', response);
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
  }, [currentMonth, professional.id]);

  // Generar días del mes con disponibilidad
  const getAvailableDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: Array<{
      date: Date;
      available: boolean;
      isToday: boolean;
      isPast: boolean;
    }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isAvailable = horariosDisponibles[dayOfWeek] !== undefined;
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();

      days.push({
        date,
        available: isAvailable && !isPast,
        isToday,
        isPast,
      });
    }

    return days;
  };

  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : [];
  }, [selectedDate, selectedPrice, existingAppointments, horariosDisponibles]);

  const handleDateSelect = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return;
    const dayOfWeek = date.getDay();
    if (!horariosDisponibles[dayOfWeek]) return;
    
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleConfirm = () => {
    if (!selectedPrice || !selectedDate || !selectedTimeSlot) return;

    const [hours, minutes] = selectedTimeSlot.split(":").map(Number);
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    onConfirm({
      id_precio: selectedPrice.id_precio,
      fecha: selectedDate.toISOString().split("T")[0],
      hora_inicio: selectedTimeSlot,
    });
  };

  const availableDays = getAvailableDays();
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const canConfirm = selectedPrice && selectedDate && selectedTimeSlot;

  return (
    <div className="space-y-6">
      {/* Selección de Paquete */}
      {!selectedPrice && professional.precios && professional.precios.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Selecciona un paquete</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {professional.precios.map((precio) => (
              <button
                key={precio.id_precio}
                onClick={() => onSelectPrice(precio)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors text-left"
              >
                <div className="font-bold text-lg">{precio.nombre_servicio}</div>
                <div className="text-sm text-gray-600 mt-1">{precio.descripcion}</div>
                <div className="text-primary font-bold mt-2">
                  ${precio.precio.toFixed(2)} {precio.moneda}
                </div>
                {precio.duracion && (
                  <div className="text-xs text-gray-500 mt-1">Duración: {precio.duracion}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resumen del paquete seleccionado */}
      {selectedPrice && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">{selectedPrice.nombre_servicio}</div>
              <div className="text-sm text-gray-600">
                ${selectedPrice.precio.toFixed(2)} {selectedPrice.moneda}
                {selectedPrice.duracion && ` • ${selectedPrice.duracion}`}
              </div>
            </div>
            <button
              onClick={() => {
                onSelectPrice(null as any);
                setSelectedDate(null);
                setSelectedTimeSlot(null);
              }}
              className="text-sm text-primary hover:underline"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Calendario */}
      {selectedPrice && (
        <div>
          <h3 className="text-xl font-bold mb-4">Selecciona una fecha</h3>
          
          {/* Navegación del mes */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="font-bold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {availableDays.map((day, index) => {
              const isSelected = selectedDate && day.date.getTime() === selectedDate.getTime();
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day.date)}
                  disabled={!day.available}
                  className={`
                    p-2 rounded-lg text-sm transition-colors
                    ${!day.available 
                      ? "text-gray-300 cursor-not-allowed" 
                      : isSelected
                      ? "bg-primary text-white"
                      : day.isToday
                      ? "bg-orange-100 text-orange-700 font-bold"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>

          {Object.keys(horariosDisponibles).length === 0 && (
            <div className="mt-4 text-center text-gray-500">
              No hay horarios disponibles configurados
            </div>
          )}
        </div>
      )}

      {/* Slots de tiempo */}
      {selectedDate && selectedPrice && (
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">
              Horarios disponibles para{" "}
              {selectedDate.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
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

          {loadingAppointments ? (
            <div className="text-center py-8 text-gray-500">Cargando horarios...</div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay horarios disponibles para esta fecha
            </div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                  disabled={!slot.available}
                  className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
                    selectedTimeSlot === slot.time
                      ? "bg-purple-100 border-purple-300 text-purple-800 shadow-md"
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
                  {slot.available ? (
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botón de confirmación */}
      {canConfirm && (
        <div className="pt-4 border-t">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="text-sm text-gray-600 mb-2">Resumen de la cita:</div>
            <div className="space-y-1">
              <div><strong>Paquete:</strong> {selectedPrice.nombre_servicio}</div>
              <div><strong>Fecha:</strong> {selectedDate.toLocaleDateString("es-ES", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}</div>
              <div><strong>Hora:</strong> {timeSlots.find(s => s.time === selectedTimeSlot)?.displayTime}</div>
              <div><strong>Precio:</strong> ${selectedPrice.precio.toFixed(2)} {selectedPrice.moneda}</div>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
          >
            Confirmar Cita
          </button>
        </div>
      )}
    </div>
  );
}

