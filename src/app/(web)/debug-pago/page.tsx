"use client";

import { useEffect, useState } from "react";

export default function DebugPagoPage() {
  const [logs, setLogs] = useState<any>(null);

  useEffect(() => {
    // Leer logs guardados en localStorage
    const lastCitaResponse = localStorage.getItem("lastCitaResponse");
    const lastPaymentUrl = localStorage.getItem("lastPaymentUrl");
    const lastPaymentUrlTimestamp = localStorage.getItem("lastPaymentUrlTimestamp");
    const lastCitaError = localStorage.getItem("lastCitaError");

    setLogs({
      lastCitaResponse: lastCitaResponse ? JSON.parse(lastCitaResponse) : null,
      lastPaymentUrl,
      lastPaymentUrlTimestamp,
      lastCitaError: lastCitaError ? JSON.parse(lastCitaError) : null,
    });
  }, []);

  const clearLogs = () => {
    localStorage.removeItem("lastCitaResponse");
    localStorage.removeItem("lastPaymentUrl");
    localStorage.removeItem("lastPaymentUrlTimestamp");
    localStorage.removeItem("lastCitaError");
    setLogs({
      lastCitaResponse: null,
      lastPaymentUrl: null,
      lastPaymentUrlTimestamp: null,
      lastCitaError: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Debug: Información de Pago
            </h1>
            <button
              onClick={clearLogs}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Limpiar Logs
            </button>
          </div>

          <div className="space-y-6">
            {/* Última respuesta de crearCita */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Última Respuesta de crearCita
              </h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {logs?.lastCitaResponse
                  ? JSON.stringify(logs.lastCitaResponse, null, 2)
                  : "No hay datos guardados"}
              </pre>
            </div>

            {/* Última URL de pago */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Última URL de Pago
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>URL:</strong> {logs?.lastPaymentUrl || "No hay URL guardada"}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Timestamp:</strong>{" "}
                  {logs?.lastPaymentUrlTimestamp || "No hay timestamp"}
                </p>
              </div>
            </div>

            {/* Último error */}
            {logs?.lastCitaError && (
              <div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  Último Error
                </h2>
                <pre className="bg-red-50 border border-red-200 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(logs.lastCitaError, null, 2)}
                </pre>
              </div>
            )}

            {/* Información útil */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                ¿Cómo usar esta página?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  Esta página muestra los logs guardados cuando intentas crear una
                  cita
                </li>
                <li>
                  Si ves una URL de pago, puedes copiarla y navegar manualmente
                </li>
                <li>
                  Si ves un error, revisa qué datos faltan en la respuesta del
                  backend
                </li>
                <li>
                  Los logs se guardan automáticamente cuando confirmas una cita
                </li>
              </ul>
            </div>

            {/* Botón para navegar a la URL si existe */}
            {logs?.lastPaymentUrl && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">
                  Navegar a la URL de pago
                </h3>
                <a
                  href={logs.lastPaymentUrl}
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Ir a: {logs.lastPaymentUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
