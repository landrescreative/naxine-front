"use client";

import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import { getCalendarAppointments } from "@/data/clientAppointments";
import LatestPayments from "@/components/dashboard/LatestPayments";

export default function ProfesionalDashboard() {
  // Sample data for upcoming sessions
  const upcomingSessions = [
    {
      id: "1",
      time: "Hoy 3:30 PM",
      professional: "Juan Pérez",
      specialty: "Sesión de Seguimiento",
      description: "Tienes una videollamada con Juan Pérez hoy.",
      isToday: true,
    },
    {
      id: "2",
      time: "Mañana 5:30 PM",
      professional: "María Gómez",
      specialty: "Primera Sesión",
      description: "Tienes una videollamada con María Gómez mañana.",
      isToday: false,
    },
  ];

  // Centralized calendar appointments with IDs
  const calendarAppointments = getCalendarAppointments();

  // Sample data for latest payments (últimas transacciones)
  const latestPayments = [
    {
      id: "1",
      professional: {
        name: "David",
        email: "david@gmail.com",
      },
      product: "Primera Consulta",
      orderNumber: "#10421",
      modality: "En línea",
      status: "paid" as const,
      date: "12 Jan, 2023",
    },
    {
      id: "2",
      professional: {
        name: "Sarah",
        email: "sarah@gmail.com",
      },
      product: "Primera Consulta",
      orderNumber: "#10422",
      modality: "En línea",
      status: "cancelled" as const,
      date: "10 Jan, 2023",
    },
    {
      id: "3",
      professional: {
        name: "Mike",
        email: "mike@gmail.com",
      },
      product: "Primera Consulta",
      orderNumber: "#10423",
      modality: "En línea",
      status: "refunded" as const,
      date: "8 Jan, 2023",
    },
  ];

  return (
    <div className="space-y-8">
      <UpcomingSessions
        sessions={upcomingSessions}
        basePath="/dashboard/profesional"
      />
      <SessionCalendar
        appointments={calendarAppointments}
        basePath="/dashboard/profesional"
      />
      <LatestPayments payments={latestPayments} />
    </div>
  );
}
