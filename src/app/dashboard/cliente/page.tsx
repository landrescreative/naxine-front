import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import LatestPayments from "@/components/dashboard/LatestPayments";
import {
  getUpcomingSessions,
  getCalendarAppointments,
} from "@/data/clientAppointments";

export default function ClienteDashboard() {
  // Usar datos centralizados - ahora ambos vienen de la misma fuente
  const upcomingSessionsData = getUpcomingSessions();
  const calendarAppointmentsData = getCalendarAppointments();

  // Sample data for latest payments
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
    <div className="space-y-2">
      {/* Upcoming Sessions Section */}
      <UpcomingSessions sessions={upcomingSessionsData} />

      {/* Session Calendar Section */}
      <SessionCalendar appointments={calendarAppointmentsData} />

      {/* Latest Payments Section */}
      <LatestPayments payments={latestPayments} />
    </div>
  );
}
