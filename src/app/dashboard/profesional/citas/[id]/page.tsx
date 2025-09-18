"use client";

import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import { SiMastercard } from "react-icons/si";
import { getSessionDetailsById } from "@/data/clientAppointments";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProfessionalSessionDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const isAllowed =
      file.type.startsWith("image/") || file.type === "application/pdf";
    if (!isAllowed) {
      alert("Formato no soportado. Sube una imagen o un PDF.");
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reuse same mock data source for now
  const appointmentDetails = getSessionDetailsById(id);

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
        {/* Top row: Resumen + Factura */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resumen de la sesión */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Resumen de la sesión
            </h2>
            <div className="space-y-4">
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
          </div>

          {/* Factura */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Factura
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sube el archivo de la factura
            </p>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const f = e.dataTransfer.files;
                if (f && f.length) {
                  const file = f[0];
                  const isAllowed =
                    file.type.startsWith("image/") ||
                    file.type === "application/pdf";
                  if (!isAllowed) {
                    alert("Formato no soportado. Sube una imagen o un PDF.");
                  } else {
                    setSelectedFile(file);
                    if (file.type.startsWith("image/")) {
                      setPreviewUrl(URL.createObjectURL(file));
                    } else {
                      setPreviewUrl(null);
                    }
                  }
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
            >
              {!selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Arrastra una imagen o PDF, o haz click para subir.
                  </p>
                  <button
                    type="button"
                    className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors"
                  >
                    Subir Archivo
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-left">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                        PDF
                      </div>
                    )}
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 truncate max-w-[220px]">
                        {selectedFile.name}
                      </div>
                      <div className="text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg"
                    >
                      Reemplazar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-2 px-3 rounded-lg"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files;
                  if (f && f.length) {
                    const file = f[0];
                    const isAllowed =
                      file.type.startsWith("image/") ||
                      file.type === "application/pdf";
                    if (!isAllowed) {
                      alert("Formato no soportado. Sube una imagen o un PDF.");
                    } else {
                      setSelectedFile(file);
                      if (file.type.startsWith("image/")) {
                        setPreviewUrl(URL.createObjectURL(file));
                      } else {
                        setPreviewUrl(null);
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Content cards below */}
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

          {/* Detalles del Cliente */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Detalles del Cliente
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                <div>
                  <div className="text-gray-500">Nombre</div>
                  <div className="font-semibold text-gray-900">Juan Pérez</div>
                </div>
                <div>
                  <div className="text-gray-500">Correo Electrónico</div>
                  <div>juanperez@gmail.com</div>
                </div>
                <div>
                  <div className="text-gray-500">Teléfono</div>
                  <div>+52 55 31 953 893</div>
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
                <div className="text-gray-500">Product Price :</div>
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
    </div>
  );
}
