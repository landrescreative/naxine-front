"use client";

interface Payment {
  id: string;
  professional: {
    name: string;
    email: string;
    avatar?: string;
  };
  product: string;
  orderNumber: string;
  modality: string;
  status: "paid" | "cancelled" | "refunded";
  date: string;
}

interface LatestPaymentsProps {
  payments: Payment[];
}

export default function LatestPayments({ payments }: LatestPaymentsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "refunded":
        return "bg-teal-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagada";
      case "cancelled":
        return "Cancelada";
      case "refunded":
        return "Rembolsada";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Últimas transacciones</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Id
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {payment.professional.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={payment.professional.avatar}
                            alt={payment.professional.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {payment.professional.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.professional.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.professional.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.modality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`h-2 w-2 rounded-full ${getStatusColor(
                          payment.status
                        )} mr-2`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.date}
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
