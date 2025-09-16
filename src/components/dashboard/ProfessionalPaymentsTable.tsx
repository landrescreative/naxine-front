"use client";

interface PaymentRow {
  id: string;
  professional: {
    specialty: string; // e.g., "Nutriologa"
    name: string; // e.g., "Carmen Leandra"
  };
  date: string; // e.g., "Dic 23, 2024"
  amount: string; // e.g., "USD $12.00"
  type: string; // e.g., "Primera consulta"
  status: "pending" | "confirmed" | "cancelled";
}

interface ProfessionalPaymentsTableProps {
  rows: PaymentRow[];
}

export default function ProfessionalPaymentsTable({
  rows,
}: ProfessionalPaymentsTableProps) {
  const statusStyle = (status: PaymentRow["status"]) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-700"; // pill color similar to screenshot (celeste)
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statusText = (status: PaymentRow["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "cancelled":
        return "Confirmada"; // screenshot shows red "Confirmada" in última fila
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {/* Orden (PDF icon + specialty/name) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-9 w-9 mr-3">
                      {/* PDF icon style */}
                      <div className="h-9 w-9 rounded bg-purple-100 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-purple-700"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H4zm8 6H9V3L12 6z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {row.professional.specialty}
                      </div>
                      <div className="text-sm text-gray-600">
                        {row.professional.name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.date}
                </td>

                {/* Cantidad */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.amount}
                </td>

                {/* Tipo */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.type}
                </td>

                {/* Estado (pill) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(
                      row.status
                    )}`}
                  >
                    {statusText(row.status)}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary hover:bg-primary/90 text-white transition-colors">
                      Subir Factura
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/90 hover:bg-primary text-white transition-colors">
                      Descargar Factura Naxine
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
