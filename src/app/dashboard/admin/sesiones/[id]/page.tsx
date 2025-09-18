"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import {
  ChevronRight,
  CreditCard,
  DollarSign,
  User,
  Mail,
  Phone,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function AdminSessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = Array.isArray(params?.id)
    ? params?.id[0]
    : (params?.id as string);

  // Modal states
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Mock session data
  const session = {
    id: sessionId,
    orderNumber: "31029830",
    date: "25 Junio, 2025",
    status: "Confirmada",
    statusColor: "bg-green-100 text-green-800",
    product: {
      name: "Primera Sesión",
      price: "$100 USD",
      description: "Dieta para diabetes",
      specialty: "Nutriología",
      icon: "🩺",
    },
    paymentMethod: {
      type: "Master Card",
      number: "Master 1234 **** 58745",
      expiry: "12/23",
      cardholder: "Juan Perez",
    },
    client: {
      name: "Juan Pérez",
      email: "juanperez@gmail.com",
      phone: "+52 55 31 953 893",
    },
    pricing: {
      productPrice: "$100 USD",
      taxes: "$20",
      total: "$120",
    },
  };

  const handleRefund = () => {
    setIsRefundModalOpen(true);
  };

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const confirmRefund = () => {
    console.log("Refunding session...");
    setIsRefundModalOpen(false);
    // Add refund logic here
  };

  const confirmCancel = () => {
    console.log("Canceling session...");
    setIsCancelModalOpen(false);
    // Add cancel logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administración de Sesiones
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-medium">
              Administración de Sesiones
            </span>
            <span className="text-gray-400">{">"}</span>
            <span className="text-gray-500">Lista de sesiones</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Resumen de la sesión */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de la sesión
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Número de pedido:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.statusColor}`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Producto */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Producto
              </h2>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                  {session.product.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {session.product.name}
                  </h3>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    {session.product.price}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {session.product.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.product.specialty}
                  </p>
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Método de Pago
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {session.paymentMethod.type}
                  </span>
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-600">?</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {session.paymentMethod.number}
                </div>
                <div className="text-sm text-gray-600">
                  Expira {session.paymentMethod.expiry}
                </div>
                <div className="text-sm text-gray-600">
                  {session.paymentMethod.cardholder}
                </div>
                <div className="flex justify-end">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-orange-500 rounded-sm -ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Acciones */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handleRefund}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Rembolsar Sesión
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Cancelar Sesión
                </button>
              </div>
            </div>

            {/* Detalles del Cliente */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles del Cliente
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {session.client.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Correo Electrónico
                  </span>
                </div>
                <div className="ml-8 text-sm text-gray-900">
                  {session.client.email}
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Teléfono:</span>
                </div>
                <div className="ml-8 text-sm text-gray-900">
                  {session.client.phone}
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Precios
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Product Price:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.pricing.productPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Impuestos:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.pricing.taxes}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {session.pricing.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirmar Reembolso
              </h2>
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    ¿Estás seguro que deseas reembolsar esta sesión?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción procesará un reembolso de $120 USD al método de
                    pago original.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRefund}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Confirmar Reembolso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirmar Cancelación
              </h2>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    ¿Estás seguro que deseas cancelar esta sesión?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción cancelará la sesión y notificará al cliente. No
                    se puede deshacer.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
