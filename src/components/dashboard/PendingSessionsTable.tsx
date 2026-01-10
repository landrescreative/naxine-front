"use client";

import { useRouter } from "next/navigation";

interface PendingSession {
  id: string;
  professional: {
    name: string;
    avatar?: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed";
  date: string;
  time: string;
  category: string;
  modality: string;
  product: string;
}

interface PendingSessionsTableProps {
  sessions: PendingSession[];
  basePath?: string;
  onViewDetails?: (sessionId: string) => void;
}

export default function PendingSessionsTable({
  sessions,
  basePath = "/dashboard/cliente",
  onViewDetails,
}: PendingSessionsTableProps) {
  const router = useRouter();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      default:
        return "Desconocido";
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="pending-sessions-title">
      <h2 id="pending-sessions-title" className="text-lg font-bold text-secondary">
        Lista de sesiones pendientes
      </h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" aria-label="Tabla de sesiones pendientes">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Profesional
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider hidden md:table-cell">
                  Fecha y Hora
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider hidden lg:table-cell">
                  Categoría
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider hidden lg:table-cell">
                  Modalidad
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider hidden xl:table-cell">
                  Producto
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {session.professional.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={session.professional.avatar}
                            alt={session.professional.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-medium text-purple-600">
                              {session.professional.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <div className="text-xs sm:text-sm font-medium text-secondary">
                          {session.professional.name}
                        </div>
                        <div className="text-xs text-secondary md:hidden">
                          {session.date} {session.time}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {getStatusText(session.status)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-xs sm:text-sm text-secondary">{session.date}</div>
                    <div className="text-xs sm:text-sm text-secondary">{session.time}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-secondary hidden lg:table-cell">
                    {session.category}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-xs sm:text-sm text-secondary">
                      {session.modality}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-secondary hidden xl:table-cell">
                    {session.product}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          if (onViewDetails) {
                            onViewDetails(session.id);
                          } else {
                            router.push(`${basePath}/citas/${session.id}`);
                          }
                        }}
                        className="bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors"
                        aria-label={`Ver detalles de sesión con ${session.professional.name}`}
                      >
                        Ver detalles
                      </button>
                      {/* Ocultar botón de reagendar para profesionales */}
                      {!basePath?.includes("/profesional") && (
                        <button
                          onClick={() =>
                            router.push(
                              `${basePath}/pagos/reagendar?sessionId=${session.id}&professionalName=${session.professional.name}&currentDate=${session.date}&currentTime=${session.time}`
                            )
                          }
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors"
                          aria-label={`Reagendar sesión con ${session.professional.name}`}
                        >
                          Reagendar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
