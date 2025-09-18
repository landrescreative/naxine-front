"use client";

import { useEffect, useState } from "react";

interface SuccessPopupProps {
  isVisible: boolean;
  onClose: () => void;
  message: string;
  duration?: number;
}

export default function SuccessPopup({
  isVisible,
  onClose,
  message,
  duration = 3000,
}: SuccessPopupProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Pequeño delay para permitir que la animación de entrada se complete
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  useEffect(() => {
    if (isVisible) {
      // Activar animación de entrada
      setIsAnimating(true);
    } else {
      // Resetear estado de animación cuando se cierra
      setIsAnimating(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? "opacity-10" : "opacity-0"
        }`}
      />

      {/* Popup */}
      <div
        className={`relative bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 transform transition-all duration-300 ease-out ${
          isAnimating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Éxito!</h3>
          <p className="text-gray-600 mb-3">{message}</p>
          <p className="text-sm text-gray-500">
            El profesional recibirá una notificación para subir la factura
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
