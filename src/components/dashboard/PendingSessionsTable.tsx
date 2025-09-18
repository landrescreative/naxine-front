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
}

export default function PendingSessionsTable({
  sessions,
  basePath = "/dashboard/cliente",
}: PendingSessionsTableProps & { basePath?: string }) {
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
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-secondary">
        Lista de sesiones pendientes
      </h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Profesional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Modalidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
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
                            <span className="text-sm font-medium text-purple-600">
                              {session.professional.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-secondary">
                          {session.professional.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {getStatusText(session.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary">{session.date}</div>
                    <div className="text-sm text-secondary">{session.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    {session.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary">
                      {session.modality}
                    </div>
                    {session.status !== "cancelled" && (
                      <div className="text-sm text-purple-600">Ver enlace</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    {session.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          router.push(`${basePath}/citas/${session.id}`)
                        }
                        className="bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `${basePath}/pagos/reagendar?sessionId=${session.id}&professionalName=${session.professional.name}&currentDate=${session.date}&currentTime=${session.time}`
                          )
                        }
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Reagendar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
