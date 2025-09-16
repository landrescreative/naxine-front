import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import PendingSessionsTable from "@/components/dashboard/PendingSessionsTable";

export default function CitasPage() {
  // Sample data for upcoming sessions (same as home page)
  const upcomingSessions = [
    {
      id: "1",
      time: "Hoy 5:30 PM",
      professional: "Dr. Pramod Mehta",
      specialty: "Nutriologa",
      description: "Tienes una videollamada con Dr.Pramod Mehta hoy.",
      isToday: true,
    },
    {
      id: "2",
      time: "Mañana 5:30 PM",
      professional: "Dr. Pramod Mehta",
      specialty: "Nutriologa",
      description: "Tienes una videollamada con Dr.Pramod Mehta mañana.",
      isToday: false,
    },
  ];

  // Sample data for calendar appointments (same as home page)
  const calendarAppointments = [
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
      time: "10:30 AM",
    },
  ];

  // Sample data for pending sessions table
  const pendingSessions = [
    {
      id: "1",
      professional: {
        name: "Janie Wells",
        avatar: undefined,
      },
      status: "pending" as const,
      date: "24 de Junio",
      time: "10:30 AM",
      category: "Nutriologa",
      modality: "En linea",
      product: "Primera Consulta",
    },
    {
      id: "2",
      professional: {
        name: "Amanda",
        avatar: undefined,
      },
      status: "confirmed" as const,
      date: "24 de Junio",
      time: "5:30 AM",
      category: "Fisioterapeuta",
      modality: "En linea",
      product: "Primera Consulta",
    },
    {
      id: "3",
      professional: {
        name: "Francesca",
        avatar: undefined,
      },
      status: "cancelled" as const,
      date: "---",
      time: "---",
      category: "Abogada",
      modality: "En linea",
      product: "Primera Consulta",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Upcoming Sessions Section */}
      <UpcomingSessions sessions={upcomingSessions} />

      {/* Session Calendar Section */}
      <SessionCalendar appointments={calendarAppointments} />

      {/* Pending Sessions Table Section */}
      <PendingSessionsTable sessions={pendingSessions} />
    </div>
  );
}
