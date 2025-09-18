"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { SiMastercard } from "react-icons/si";
import { getSessionDetailsById } from "@/data/clientAppointments";
import SuccessPopup from "@/components/ui/SuccessPopup";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);

  // Obtener detalles de la sesión desde datos centralizados
  const appointmentDetails = getSessionDetailsById(id);

  // Si no se encuentra la sesión, mostrar mensaje de error
  if (!appointmentDetails) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sesión no encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            La sesión que buscas no existe o ha sido eliminada.
          </p>
          <button
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg"
            onClick={() => router.back()}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">
          Detalles de la sesión
        </h1>
        <button
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2"
          onClick={() => router.back()}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">
            Resumen de la sesión
          </h2>
          <button
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg"
            onClick={() => setShowInvoicePopup(true)}
          >
            Solicitar Factura al Profesional
          </button>
        </div>

        {/* Top meta */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">Número de pedido:</div>
            <div className="text-sm font-semibold text-gray-900">
              {appointmentDetails.orderNumber}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">Fecha:</div>
            <div className="text-sm font-semibold text-gray-900">
              {appointmentDetails.dateTime.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">Estado:</div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${
                appointmentDetails.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : appointmentDetails.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : appointmentDetails.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {appointmentDetails.status === "confirmed"
                ? "Confirmada"
                : appointmentDetails.status === "pending"
                ? "Pendiente"
                : appointmentDetails.status === "cancelled"
                ? "Cancelada"
                : "Completada"}
            </span>
          </div>
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Producto */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Producto
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-7-5H6a2 2 0 0 0-2 2v14z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">
                    {appointmentDetails.product.name}
                  </div>
                  <div>${appointmentDetails.product.price} USD</div>
                  <div>{appointmentDetails.product.description}</div>
                  <div>{appointmentDetails.product.category}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del Profesional */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Detalles del Profesional
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                <div>
                  <div className="text-gray-500">Nombre</div>
                  <div className="font-semibold text-gray-900">
                    {appointmentDetails.professional.name}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Correo Electrónico</div>
                  <div>{appointmentDetails.professional.email}</div>
                </div>
                <div>
                  <div className="text-gray-500">Teléfono</div>
                  <div>{appointmentDetails.professional.phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-gray-500">Especialidad</div>
                  <div className="font-semibold text-gray-900">
                    {appointmentDetails.professional.specialty}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Método de Pago
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-700 relative">
              <div className="space-y-1">
                <div className="font-semibold text-gray-900">
                  {appointmentDetails.payment.method}
                </div>
                <div className="text-gray-400">
                  {appointmentDetails.payment.cardNumber}
                </div>
                <div className="text-gray-400">
                  Expira {appointmentDetails.payment.expiryDate}
                </div>
                <div className="font-semibold text-gray-900">
                  {appointmentDetails.payment.cardholderName}
                </div>
              </div>
              <div className="absolute bottom-4 right-4">
                <SiMastercard className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Precios */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Precios
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-gray-500">Precio del Producto:</div>
                <div className="text-right font-semibold text-gray-900">
                  ${appointmentDetails.payment.subtotal} USD
                </div>
                <div className="text-gray-500">Impuestos:</div>
                <div className="text-right">
                  ${appointmentDetails.payment.taxes}
                </div>
                <div className="text-gray-900 font-semibold">Total:</div>
                <div className="text-right font-semibold text-gray-900">
                  ${appointmentDetails.payment.total}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        isVisible={showInvoicePopup}
        onClose={() => setShowInvoicePopup(false)}
        message="Factura solicitada"
      />
    </div>
  );
}
