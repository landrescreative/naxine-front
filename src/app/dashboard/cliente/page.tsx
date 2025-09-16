import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import LatestPayments from "@/components/dashboard/LatestPayments";

export default function ClienteDashboard() {
  // Sample data for upcoming sessions
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

  // Sample data for calendar appointments
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
      <UpcomingSessions sessions={upcomingSessions} />

      {/* Session Calendar Section */}
      <SessionCalendar appointments={calendarAppointments} />

      {/* Latest Payments Section */}
      <LatestPayments payments={latestPayments} />
    </div>
  );
}
