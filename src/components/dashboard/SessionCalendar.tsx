"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface SessionCalendarProps {
  appointments: CalendarAppointment[];
  basePath?: string;
  onAppointmentClick?: (appointmentId: string) => void;
}

export default function SessionCalendar({
  appointments,
  basePath = "/dashboard/cliente",
  onAppointmentClick,
}: SessionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();

  const months = [
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

  const daysOfWeek = ["LUN", "MAR", "MIER", "JUE", "VIE", "SAB", "DOM"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonth = new Date(year, month - 1, 0);
      const prevMonthDays = prevMonth.getDate();
      days.push({
        day: prevMonthDays - startingDayOfWeek + i + 1,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString();
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Add empty cells for days after the last day of the month
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getAppointmentForDate = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return null;
    
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    return appointments.find((apt) => {
      // Si tiene dateTime (fecha completa ISO), comparar por fecha completa
      if (apt.dateTime) {
        const aptDate = new Date(apt.dateTime);
        return (
          aptDate.getDate() === day &&
          aptDate.getMonth() === currentMonth &&
          aptDate.getFullYear() === currentYear
        );
      }
      
      // Si tiene month y year, comparar con esos valores
      if (apt.month !== undefined && apt.year !== undefined) {
        return (
          apt.date === day &&
          apt.month === currentMonth &&
          apt.year === currentYear
        );
      }
      
      // Fallback: solo comparar por día (comportamiento anterior)
      return apt.date === day;
    });
  };

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment.id);
    } else {
    router.push(`${basePath}/citas/${appointment.id}`);
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <section className="space-y-4" aria-labelledby="session-calendar-title">
      <h2 id="session-calendar-title" className="text-lg font-bold text-gray-900">
        Calendario de Sesiones
      </h2>

      {/* Calendar Navigation */}
      <nav className="flex items-center justify-between bg-primary/15 rounded-lg p-3" aria-label="Navegación del calendario">
        <span className="text-sm font-medium text-primary">Calendario</span>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
            aria-label="Mes anterior"
          >
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span className="text-sm font-semibold text-primary" aria-live="polite">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>

          <button
            onClick={() => navigateMonth("next")}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
            aria-label="Mes siguiente"
          >
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" role="grid" aria-label={`Calendario de ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}>
        {/* Days of Week Header */}
        <div className="grid grid-cols-7" role="row">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="bg-primary text-white text-[10px] sm:text-xs font-medium py-2 sm:py-3 text-center"
              role="columnheader"
              aria-label={day}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7" role="rowgroup">
          {days.map((dayData, index) => {
            const appointment = getAppointmentForDate(
              dayData.day,
              dayData.isCurrentMonth
            );

            return (
              <div
                key={index}
                className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border-r border-b border-gray-200 last:border-r-0 ${
                  dayData.isCurrentMonth ? "bg-white" : "bg-gray-50"
                }`}
                role="gridcell"
                aria-label={dayData.isCurrentMonth ? `Día ${dayData.day}${appointment ? ', tiene cita' : ''}${dayData.isToday ? ', hoy' : ''}` : undefined}
              >
                <div
                  className={`text-xs sm:text-sm font-medium mb-1 ${
                    dayData.isCurrentMonth
                      ? dayData.isToday
                        ? "text-primary font-bold"
                        : "text-gray-900"
                      : "text-gray-400"
                  }`}
                  aria-hidden="true"
                >
                  {dayData.day}
                </div>

                {appointment && (
                  <button
                    className="w-full text-left bg-primary/15 rounded p-1 sm:p-2 text-[10px] sm:text-xs cursor-pointer hover:bg-primary/25 transition-colors"
                    onClick={() => handleAppointmentClick(appointment)}
                    aria-label={`Cita: ${appointment.specialty} con ${appointment.professional} a las ${appointment.time}`}
                  >
                    <div className="font-medium text-primary truncate">
                      {appointment.specialty}
                    </div>
                    <div className="text-primary truncate hidden sm:block">
                      {appointment.professional}
                    </div>
                    <div className="text-primary hidden sm:block">{appointment.time}</div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
