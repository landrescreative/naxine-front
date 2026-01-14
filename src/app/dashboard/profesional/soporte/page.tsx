"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ticketsService } from "@/services/api/tickets";

export default function SoportePage() {
  const { user } = useAuth();
  const [asunto, setAsunto] = useState("");
  const [message, setMessage] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-llenar el correo con el email del usuario autenticado
  useEffect(() => {
    if (user?.email && !correo) {
      setCorreo(user.email);
    }
  }, [user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await ticketsService.createTicket({
        asunto: asunto.trim() || "Consulta de soporte",
        mensaje: message.trim(),
        telefono: telefono.trim() || undefined,
        correo_electronico: correo.trim() || user?.email || undefined,
      });

      if (response.success) {
        setIsSubmitted(true);
        setMessage("");
        setAsunto("");
        setTelefono("");
        setCorreo("");
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        // Manejar errores de validación del backend
        if (response.errorDetails?.errors) {
          const validationErrors = response.errorDetails.errors;
          const errorMessages = Array.isArray(validationErrors)
            ? validationErrors.map((err: any) => err.message || err).join(", ")
            : JSON.stringify(validationErrors);
          setError(errorMessages);
        } else {
          setError(
            response.error ||
              "Error al enviar el ticket. Por favor, intenta nuevamente."
          );
        }
      }
    } catch (err: any) {
      console.error("[SoportePage] Error al enviar ticket:", err);
      setError(
        err?.message ||
          "Ocurrió un error al enviar el ticket. Por favor, intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setMessage(value);
    }
  };

  const handleAsuntoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setAsunto(value);
    }
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir números, espacios, guiones y paréntesis
    if (/^[\d\s\-\(\)]*$/.test(value) && value.length <= 20) {
      setTelefono(value);
    }
  };

  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setCorreo(value);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">
          Soporte
        </h1>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          {/* Contact Us Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
              Contáctanos
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Deja un mensaje al centro de soporte de Nexine y te contactaremos
              lo más brevemente posible.
            </p>
          </div>

          {/* User Information */}
          <div className="flex items-center mb-8">
            {/* User Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" />
              </svg>
            </div>

            {/* User Info */}
            <div>
              <h3 className="text-lg font-semibold text-black">
                {user?.name || "Profesional"}
              </h3>
              <p className="text-sm text-gray-500">
                Ésta información es confidencial.
              </p>
            </div>
          </div>

          {/* Message Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Asunto */}
            <div>
              <label
                htmlFor="asunto"
                className="block text-sm font-medium text-black mb-2"
              >
                Asunto <span className="text-gray-500 text-xs">(opcional)</span>
              </label>
              <input
                id="asunto"
                name="asunto"
                type="text"
                value={asunto}
                onChange={handleAsuntoChange}
                placeholder="Ej: Problema con mi perfil..."
                maxLength={255}
                className="w-full px-4 py-3 rounded-lg bg-purple-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {asunto.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {asunto.length}/255 caracteres
                </p>
              )}
            </div>

            {/* Mensaje */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-black mb-2"
              >
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={handleMessageChange}
                placeholder="Escribe tu mensaje aquí..."
                maxLength={2000}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/2000 caracteres
              </p>
            </div>

            {/* Teléfono (opcional) */}
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-black mb-2"
              >
                Teléfono{" "}
                <span className="text-gray-500 text-xs">(opcional)</span>
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={telefono}
                onChange={handleTelefonoChange}
                placeholder="Ej: +32 55 1234 5678"
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg bg-purple-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Para que podamos contactarte más rápido
              </p>
            </div>

            {/* Correo (opcional) */}
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-black mb-2"
              >
                Correo electrónico{" "}
                <span className="text-gray-500 text-xs">(opcional)</span>
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={correo}
                onChange={handleCorreoChange}
                placeholder={user?.email || "tu@email.com"}
                maxLength={255}
                className="w-full px-4 py-3 rounded-lg bg-purple-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {user?.email
                  ? `Tu correo actual: ${user.email} (puedes cambiarlo)`
                  : "Para recibir actualizaciones sobre tu ticket"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </form>

          {/* Success Message */}
          {isSubmitted && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-700 font-medium">
                  Ticket creado correctamente. Te contactaremos pronto.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
