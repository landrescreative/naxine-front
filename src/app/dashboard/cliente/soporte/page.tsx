"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SoportePage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío del mensaje
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setMessage("");

    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-black mb-8">Soporte</h1>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Contact Us Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">Contáctanos</h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Deja un mensaje al centro de soporte de Nexine y te contactaremos
              lo más brevemente posible.
            </p>
          </div>

          {/* User Information */}
          <div className="flex items-center mb-8">
            {/* User Icon */}
            <img
              src="/PNG-03.png"
              alt="Usuario"
              className="w-12 h-12 mr-4 flex-shrink-0"
            />

            {/* User Info */}
            <div>
              <h3 className="text-lg font-semibold text-black">
                {user?.name || "Usuario"}
              </h3>
              <p className="text-sm text-primary underline">
                Ésta información es confidencial.
              </p>
            </div>
          </div>

          {/* Message Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-black mb-2"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={handleMessageChange}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full h-32 px-4 py-3 rounded-lg bg-primary/10 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-md transition-colors duration-200"
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
                  Mensaje enviado correctamente. Te contactaremos pronto.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
