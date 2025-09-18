import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import PendingSessionsTable from "@/components/dashboard/PendingSessionsTable";
import {
  getUpcomingSessions,
  getCalendarAppointments,
  getPendingSessions,
} from "@/data/clientAppointments";

export default function CitasPage() {
  // Usar datos centralizados - ahora todos vienen de la misma fuente
  const upcomingSessionsData = getUpcomingSessions();
  const calendarAppointmentsData = getCalendarAppointments();
  const pendingSessionsData = getPendingSessions();

  return (
    <div className="space-y-8">
      {/* Upcoming Sessions Section */}
      <UpcomingSessions sessions={upcomingSessionsData} />

      {/* Session Calendar Section */}
      <SessionCalendar
        appointments={calendarAppointmentsData}
        basePath="/dashboard/cliente"
      />

      {/* Pending Sessions Table Section */}
      <PendingSessionsTable sessions={pendingSessionsData} />
    </div>
  );
}
