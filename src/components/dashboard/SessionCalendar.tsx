"use client";

import { useState } from "react";

interface CalendarAppointment {
  date: number;
  professional: string;
  specialty: string;
  time: string;
}

interface SessionCalendarProps {
  appointments: CalendarAppointment[];
}

export default function SessionCalendar({
  appointments,
}: SessionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
    return appointments.find((apt) => apt.date === day);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">
        Calendario de Sesiones
      </h2>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-primary/15 rounded-lg p-3">
        <span className="text-sm font-medium text-primary">Calendario</span>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span className="text-sm font-semibold text-primary">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>

          <button
            onClick={() => navigateMonth("next")}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            <svg
              className="w-4 h-4 text-primary"
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
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="bg-primary text-white text-xs font-medium py-3 text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((dayData, index) => {
            const appointment = getAppointmentForDate(
              dayData.day,
              dayData.isCurrentMonth
            );

            return (
              <div
                key={index}
                className={`min-h-[80px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                  dayData.isCurrentMonth ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    dayData.isCurrentMonth
                      ? dayData.isToday
                        ? "text-primary font-bold"
                        : "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {dayData.day}
                </div>

                {appointment && (
                  <div className="bg-primary/15 rounded p-2 text-xs">
                    <div className="font-medium text-primary truncate">
                      {appointment.specialty}
                    </div>
                    <div className="text-primary truncate">
                      {appointment.professional}
                    </div>
                    <div className="text-primary">{appointment.time}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
