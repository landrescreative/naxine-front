"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function VerifyCodePage() {
  const [code, setCode] = useState("7789BM6X");
  const [showCode, setShowCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically verify the code with your backend
    setIsVerified(true);
  };

  const handleResendCode = () => {
    setIsResending(true);
    // Here you would typically resend the verification code
    setTimeout(() => {
      setIsResending(false);
      // You could show a success message here
    }, 2000);
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Success Message */}
        <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
          <div className="w-full max-w-md text-center">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Código verificado!
            </h1>
            <p className="text-gray-600 mb-8">
              Tu código ha sido verificado correctamente. Ahora puedes crear una
              nueva contraseña.
            </p>

            {/* Continue Button */}
            <Link
              href="/nueva-contrasena"
              className="inline-block w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center"
            >
              Crear nueva contraseña
            </Link>

            {/* Back to Login */}
            <Link
              href="/iniciar-sesion"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium mt-4"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Right Side - Professional Image */}
        <div className="flex flex-1 relative">
          <div className="relative w-full h-full flex items-center lg:items-start justify-center p-2">
            <div className="sticky top-4 w-full">
              <div className="w-11/12 h-[400px] lg:h-[600px] relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&crop=face"
                  alt="Profesional"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Verification Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link
            href="/olvidaste-contrasena"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-8"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver
          </Link>

          {/* Header */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verificar código
            </h1>
            <p className="text-gray-600">
              Un código de verificación ha sido enviado a tu correo.
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input Field */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ingresa el código
              </label>
              <div className="relative">
                <input
                  type={showCode ? "text" : "password"}
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Ingresa el código de verificación"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCode ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Resend Code Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-primary hover:text-primary/80 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Reenviando..." : "Reenviar código"}
              </button>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Verificar
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Professional Image */}
      <div className="flex flex-1 relative">
        <div className="relative w-full h-full flex items-center lg:items-start justify-center p-2">
          <div className="sticky top-4 w-full">
            <div className="w-11/12 h-[400px] lg:h-[600px] relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&crop=face"
                alt="Profesional"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
