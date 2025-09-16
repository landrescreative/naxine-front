"use client";

import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import PendingSessionsTable from "@/components/dashboard/PendingSessionsTable";

export default function CitasPage() {
  const upcomingSessionsData = [
    {
      id: "1",
      time: "Hoy 5:30 PM",
      professional: "Juan Perez",
      specialty: "Primera Sesión",
      description: "Tienes una videollamada con Juan Perez hoy.",
      isToday: true,
    },
    {
      id: "2",
      time: "Mañana 5:30 PM",
      professional: "Juan Perez",
      specialty: "Sesión de Seguimiento",
      description: "Tienes una videollamada con Juan Perez mañana.",
      isToday: false,
    },
  ];

  const calendarAppointmentsData = [
    {
      date: 3,
      professional: "Amanda Bryan",
      specialty: "Fisioterapeuta",
      time: "5:30 AM",
    },
    {
      date: 16,
      professional: "Janie Wells",
      specialty: "Nutriologa",
      time: "10:39 AM",
    },
  ];

  const pendingSessionsData = [
    {
      id: "1",
      professional: { name: "Janie Well" },
      status: "pending" as const,
      date: "24 de Junio",
      time: "10:39",
      category: "Nutriologa",
      modality: "En línea",
      product: "Primera Consulta",
    },
    {
      id: "2",
      professional: { name: "Amanda" },
      status: "confirmed" as const,
      date: "24 de Junio",
      time: "5:36 AM",
      category: "Fisioterapeuta",
      modality: "En línea",
      product: "Primera Consulta",
    },
    {
      id: "3",
      professional: { name: "Francesca" },
      status: "cancelled" as const,
      date: "---",
      time: "---",
      category: "Abogada",
      modality: "En línea",
      product: "Primera Consulta",
    },
  ];

  return (
    <div className="space-y-8">
      <UpcomingSessions sessions={upcomingSessionsData} />
      <SessionCalendar appointments={calendarAppointmentsData} />
      <PendingSessionsTable sessions={pendingSessionsData} />
    </div>
  );
}
