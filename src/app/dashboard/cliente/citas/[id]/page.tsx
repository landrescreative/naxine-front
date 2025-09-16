"use client";

import { useRouter } from "next/navigation";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="p-6">
      <h1 className="text-[22px] font-bold text-gray-900 mb-4">
        Detalles de la sesión
      </h1>

      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">
            Resumen de la sesión
          </h2>
          <button
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg"
            onClick={() => alert("Solicitar Factura al Profesional")}
          >
            Solicitar Factura al Profesional
          </button>
        </div>

        {/* Top meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Número de pedido:</div>
            <div className="text-sm font-semibold text-gray-900">{id}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Fecha:</div>
            <div className="text-sm font-semibold text-gray-900">
              25 Junio, 2025
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Estado:</div>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
              Confirmada
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
                    Primera Sesión
                  </div>
                  <div>$100 USD</div>
                  <div>Dieta para diabetes</div>
                  <div>Nutriología</div>
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
                    Dr. Pramod Mehta - Nutrióloga
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Correo Electrónico</div>
                  <div>drpramodmehta@gmail.com</div>
                </div>
                <div>
                  <div className="text-gray-500">Teléfono</div>
                  <div>+52 55 31 953 893</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-gray-500">Info</div>
                  <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    ?
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
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-700">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">Master Card</div>
                  <div>Master 1234 **** 58745</div>
                  <div>Expira 12/23</div>
                  <div>Juan Perez</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
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
                <div className="text-gray-500">Product Price :</div>
                <div className="text-right font-semibold text-gray-900">
                  $100 USD
                </div>
                <div className="text-gray-500">Impuestos:</div>
                <div className="text-right">$20</div>
                <div className="text-gray-900 font-semibold">Total :</div>
                <div className="text-right font-semibold text-gray-900">
                  $120
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
