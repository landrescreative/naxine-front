"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/api/auth";

function VerifyCodeForm() {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get("email") || "";
  // Normalizar el email igual que en el registro: trim y lowercase
  const email = rawEmail.trim().toLowerCase();

  useEffect(() => {
    // Si no hay email, redirigir al registro profesional
    if (!email) {
      router.push("/registro-profesional");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!code.trim()) {
      setError("Por favor ingresa el código de verificación");
      setLoading(false);
      return;
    }

    // Asegurar que el email esté normalizado antes de enviarlo
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await authService.verifyCode(
        normalizedEmail,
        code.trim()
      );

      if (response.success && response.data) {
        // Verificar si la respuesta incluye datos de autenticación (usuario y token)
        const backendResponse = response.data as any;
        const actualData = backendResponse.data || backendResponse;

        console.log("[VerifyCodePage] Respuesta del backend:", actualData);
        console.log(
          "[VerifyCodePage] Mensaje del backend:",
          backendResponse.message
        );

        // Verificar si es un profesional pendiente de aprobación
        if (
          actualData.profesional &&
          actualData.profesional.estado_aprobacion === "pendiente"
        ) {
          // Mostrar mensaje de pendiente de aprobación
          setIsVerified(true);
          setPendingApproval(true);
          setApprovalMessage(
            backendResponse.message ||
            actualData.profesional.mensaje ||
            "Tu solicitud está pendiente de aprobación por un administrador."
          );
          // NO redirigir - mantener al usuario en esta pantalla
          return;
        }

        // Si hay token y usuario, iniciar sesión automáticamente
        if (actualData.token && (actualData.usuario || actualData.user)) {
          // Mapear la respuesta del backend al formato del frontend
          const roleMap: Record<string, "client" | "professional" | "admin"> = {
            cliente: "client",
            profesional: "professional",
            admin: "admin",
            administracion: "admin",
          };

          const userData = {
            id: String(
              actualData.usuario?.id_usuario || actualData.user?.id || ""
            ),
            email: actualData.usuario?.email || actualData.user?.email || email,
            name: actualData.usuario?.nombre || actualData.user?.name || "",
            role:
              roleMap[actualData.usuario?.rol || actualData.user?.role || ""] ||
              "client",
            token: actualData.token || "",
            refreshToken: actualData.refreshToken,
          };

          // Guardar en localStorage e iniciar sesión
          localStorage.setItem("user", JSON.stringify(userData));
          window.dispatchEvent(new CustomEvent("userLogin"));

          setIsVerified(true);
          // Redirigir al dashboard o a la URL especificada después de iniciar sesión
          const redirectTarget = searchParams.get("redirect") || "/";
          setTimeout(() => {
            router.push(redirectTarget);
          }, 1500);
        } else {
          // Si no hay token, solo mostrar éxito y redirigir al login
          setIsVerified(true);
          setTimeout(() => {
            router.push("/iniciar-sesion");
          }, 2000);
        }
      } else {
        setError(
          response.error || "Código inválido. Por favor, intenta de nuevo."
        );
      }
    } catch (err) {
      setError(
        "Ocurrió un error al verificar el código. Por favor, intenta de nuevo."
      );
      console.error("Error en verificación:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");

    // Asegurar que el email esté normalizado
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("No se puede reenviar el código sin un email válido");
      setIsResending(false);
      return;
    }

    try {
      const response = await authService.resendVerificationCode(
        normalizedEmail
      );

      if (response.success) {
        // Mostrar mensaje de éxito
        setError("");
        // Podríamos mostrar un mensaje de éxito temporal aquí
        alert("Código reenviado. Por favor revisa tu correo.");
      } else {
        setError(
          response.error ||
          "Error al reenviar el código. Por favor, intenta de nuevo."
        );
      }
    } catch (err) {
      setError(
        "Ocurrió un error al reenviar el código. Por favor, intenta de nuevo."
      );
      console.error("Error al reenviar código:", err);
    } finally {
      setIsResending(false);
    }
  };

  const statusMessageId = "verify-code-status";
  const instructionId = "verify-code-instructions";

  if (isVerified) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Success Message */}
        <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
          <div className="w-full max-w-md text-center">
            {pendingApproval ? (
              <>
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Solicitud Pendiente
                </h1>
                <p
                  className="text-gray-600 mb-8"
                  role="status"
                  aria-live="polite"
                >
                  {approvalMessage ||
                    "Tu solicitud está pendiente de aprobación por un administrador. Te notificaremos por email cuando tu cuenta sea aprobada y puedas acceder a la plataforma."}
                </p>
              </>
            ) : (
              <>
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
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  ¡Código verificado!
                </h1>
                <p
                  className="text-gray-600 mb-8"
                  role="status"
                  aria-live="polite"
                >
                  Tu código ha sido verificado correctamente. Iniciando
                  sesión...
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Logo */}
        <div className="flex flex-1 relative bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <Image
                src="/PNG-01.png"
                alt="Naxine Logo"
                width={400}
                height={160}
                className="w-full h-auto"
                priority
              />
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
          {/* Header */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verificar código
            </h1>
            <p className="text-gray-600" id={instructionId}>
              Un código de verificación ha sido enviado a{" "}
              <strong>{email}</strong>
            </p>
          </div>

          {/* Verification Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-describedby={`${instructionId} ${statusMessageId}`}
            aria-busy={loading}
          >
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                role="alert"
                aria-live="assertive"
                id={statusMessageId}
              >
                {error}
              </div>
            )}
            {!error && (
              <p id={statusMessageId} className="sr-only" aria-live="polite">
                Introduce el código recibido para completar tu verificación.
              </p>
            )}
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
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${instructionId} ${statusMessageId}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showCode ? "Ocultar código" : "Mostrar código"}
                  aria-pressed={showCode}
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
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Logo */}
      <div className="flex flex-1 relative bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Image
              src="/PNG-01.png"
              alt="Naxine Logo"
              width={400}
              height={160}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <VerifyCodeForm />
    </Suspense>
  );
}
