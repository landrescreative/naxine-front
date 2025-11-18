"use client";

import { useState } from "react";
import { pagosService } from "@/services";

interface AppointmentHistory {
  id: string;
  order: {
    specialty: string;
    professional: string;
  };
  date: string;
  amount: string;
  type: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  url_comprobante_pago?: string | null;
  url_factura_fiscal?: string | null;
}

interface AppointmentHistoryTableProps {
  appointments: AppointmentHistory[];
}

export default function AppointmentHistoryTable({
  appointments,
}: AppointmentHistoryTableProps) {
  const [downloadingComprobanteId, setDownloadingComprobanteId] = useState<string | null>(null);
  const [downloadingFacturaId, setDownloadingFacturaId] = useState<string | null>(null);

  const handleDownloadComprobante = async (pagoId: string, url: string | null | undefined) => {
    if (!url) return;
    
    try {
      setDownloadingComprobanteId(pagoId);
      // Descargar archivo a través del backend (proxy, evita CORS)
      const blob = await pagosService.descargarComprobanteNaxine(pagoId);
      
      // Crear blob URL y descargar
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `comprobante-naxine-${pagoId}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar el blob URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error: any) {
      console.error('Error al descargar comprobante:', error);
      alert('Error al descargar el comprobante. Por favor, intenta nuevamente.');
    } finally {
      setDownloadingComprobanteId(null);
    }
  };

  const handleDownloadFacturaFiscal = async (pagoId: string, url: string | null | undefined) => {
    if (!url) return;

    try {
      setDownloadingFacturaId(pagoId);
      // Descargar archivo a través del backend (proxy, evita CORS)
      const blob = await pagosService.descargarFacturaFiscal(pagoId);
      
      // Crear blob URL y descargar
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `factura-fiscal-${pagoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar el blob URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error: any) {
      console.error('Error al descargar factura fiscal:', error);
      alert('Error al descargar la factura fiscal. Por favor, intenta nuevamente.');
    } finally {
      setDownloadingFacturaId(null);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
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
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendiente";
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
      <h2 className="text-lg font-bold text-gray-900">Historial de citas</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6 mr-3">
                        <svg
                          className="h-6 w-6 text-primary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {appointment.order.specialty}
                        </div>
                        <div className="text-sm text-primary">
                          {appointment.order.professional}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {appointment.url_comprobante_pago && (
                        <button 
                          onClick={() => handleDownloadComprobante(appointment.id, appointment.url_comprobante_pago!)}
                          disabled={downloadingComprobanteId === appointment.id}
                          className={`bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2 px-4 rounded transition-colors flex items-center gap-2 ${
                            downloadingComprobanteId === appointment.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {downloadingComprobanteId === appointment.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Descargando...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Descargar Comprobante Naxine
                            </>
                          )}
                        </button>
                      )}
                      {appointment.url_factura_fiscal && (
                        <button 
                          onClick={() => handleDownloadFacturaFiscal(appointment.id, appointment.url_factura_fiscal!)}
                          disabled={downloadingFacturaId === appointment.id}
                          className={`bg-secondary hover:bg-secondary/90 text-white text-sm font-medium py-2 px-4 rounded transition-colors flex items-center gap-2 ${
                            downloadingFacturaId === appointment.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {downloadingFacturaId === appointment.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Descargando...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Descargar Factura Fiscal
                            </>
                          )}
                        </button>
                      )}
                      {!appointment.url_comprobante_pago && !appointment.url_factura_fiscal && (
                        <span className="text-sm text-gray-500">Sin facturas disponibles</span>
                      )}
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
