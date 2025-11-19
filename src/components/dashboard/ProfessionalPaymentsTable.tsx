"use client";

import { useState } from "react";
import { pagosService } from "@/services";

interface PaymentRow {
  id: string;
  professional: {
    specialty: string; // e.g., "Nutriologa"
    name: string; // e.g., "Carmen Leandra"
  };
  date: string; // e.g., "Dic 23, 2024"
  amount: string; // e.g., "USD $12.00" or "Sube factura fiscal para ver monto"
  type: string; // e.g., "Primera consulta"
  status: "pending" | "confirmed" | "cancelled";
  url_comprobante_pago?: string | null;
  url_factura_fiscal?: string | null;
  necesitaFacturaFiscal?: boolean; // Flag para indicar si necesita subir factura fiscal
}

interface ProfessionalPaymentsTableProps {
  rows: PaymentRow[];
  onUploadInvoice?: (pagoId: string, file: File) => Promise<void>;
}

export default function ProfessionalPaymentsTable({
  rows,
  onUploadInvoice,
}: ProfessionalPaymentsTableProps) {
  const [uploadingPagoId, setUploadingPagoId] = useState<string | null>(null);
  const [loadingInvoicePagoId, setLoadingInvoicePagoId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // Helper para verificar si una URL es válida
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (url === null || url === undefined) return false;
    const urlStr = String(url).trim();
    return urlStr !== '' && urlStr !== 'null' && urlStr !== 'undefined';
  };

  const handleDownloadComprobante = (url: string | null | undefined) => {
    if (!isValidUrl(url)) {
      alert('No hay comprobante disponible para descargar');
      return;
    }
    window.open(url!, '_blank');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, pagoId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setToastMessage('Tipo de archivo no permitido. Solo se permiten PDF e imágenes.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      setToastMessage('El archivo es demasiado grande. El tamaño máximo es 10MB.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    if (onUploadInvoice) {
      try {
        setUploadingPagoId(pagoId);
        await onUploadInvoice(pagoId, file);
        // Mostrar mensaje de éxito
        setToastMessage('Factura subida exitosamente');
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          // Recargar la página después de 1 segundo para mostrar la factura actualizada
          window.location.reload();
        }, 2000);
        // Limpiar el input después de subir exitosamente
        if (e.target) {
          e.target.value = '';
        }
      } catch (error: any) {
        console.error('Error al subir factura:', error);
        setToastMessage(error.message || 'Error al subir factura. Por favor, intenta nuevamente.');
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
        // Limpiar el input incluso si hay error
        if (e.target) {
          e.target.value = '';
        }
      } finally {
        setUploadingPagoId(null);
      }
    } else {
      // Limpiar el input si no hay handler
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDownloadInvoice = async (pagoId: string, url: string | null | undefined) => {
    if (!isValidUrl(url)) {
      setToastMessage('No hay factura disponible para descargar');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }

    try {
      setLoadingInvoicePagoId(pagoId);
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
      
      setToastMessage('Descarga iniciada');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error('[ProfessionalPaymentsTable] Error al descargar factura:', error);
      setToastMessage('Error al descargar la factura. Por favor, intenta nuevamente.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setLoadingInvoicePagoId(null);
    }
  };
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
          <thead className="bg-white">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Fecha
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Tipo
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Estado
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => {
              return (
              <tr key={row.id} className="hover:bg-gray-50">
                {/* Orden (PDF icon + specialty/name) */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 mr-2 sm:mr-3">
                      {/* PDF icon style */}
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded bg-purple-100 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-purple-700"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H4zm8 6H9V3L12 6z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {row.professional.specialty}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                        {row.professional.name}
                      </div>
                      <div className="text-xs text-gray-500 sm:hidden">
                        {row.date}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                  {row.date}
                </td>

                {/* Cantidad */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                  {row.amount}
                </td>

                {/* Tipo */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                  {row.type}
                </td>

                {/* Estado (pill) */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(
                      row.status
                    )}`}
                  >
                    {statusText(row.status)}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                    <label 
                      className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-colors ${
                        uploadingPagoId === row.id
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : row.necesitaFacturaFiscal
                          ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer animate-pulse'
                          : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
                      } flex items-center gap-1 sm:gap-2`}
                      title={row.necesitaFacturaFiscal ? 'Sube la factura fiscal para ver el monto de este pago' : ''}
                    >
                      {uploadingPagoId === row.id ? (
                        <>
                          <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="hidden sm:inline">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          {row.necesitaFacturaFiscal && (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          <span className="hidden sm:inline">{row.url_factura_fiscal ? 'Actualizar Factura' : 'Subir Factura'}</span>
                          <span className="sm:hidden">Factura</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, row.id)}
                        disabled={uploadingPagoId === row.id}
                      />
                    </label>
                    {isValidUrl(row.url_factura_fiscal) && (
                      <button 
                        onClick={() => handleDownloadInvoice(row.id, row.url_factura_fiscal)}
                        disabled={loadingInvoicePagoId === row.id}
                        className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-colors flex items-center gap-1 sm:gap-2 ${
                          loadingInvoicePagoId === row.id
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                        }`}
                      >
                        {loadingInvoicePagoId === row.id ? (
                          <>
                            <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden sm:inline">Descargando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="hidden sm:inline">Descargar Factura Fiscal</span>
                            <span className="sm:hidden">Factura</span>
                          </>
                        )}
                      </button>
                    )}
                    <button 
                      onClick={() => handleDownloadComprobante(row.url_comprobante_pago)}
                      disabled={!isValidUrl(row.url_comprobante_pago)}
                      className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-colors ${
                        isValidUrl(row.url_comprobante_pago)
                          ? 'bg-secondary hover:bg-secondary/90 text-white cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="hidden sm:inline">Descargar Comprobante Naxine</span>
                      <span className="sm:hidden">Comprobante</span>
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Toast de éxito */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toast de error */}
      {showErrorToast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowErrorToast(false)}
              className="flex-shrink-0 text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
