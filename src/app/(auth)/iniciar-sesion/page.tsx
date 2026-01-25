"use client";

import { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error: authError, loading, isAuthenticated } = useAuth();

  // Redirigir a la página principal o a la URL de redirección si el usuario ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/";
      logger.info("Usuario ya autenticado, redirigiendo", { redirectTo }, "LoginPage");
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Obtener el valor directamente del input para evitar problemas con el estado
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const emailValue = emailInput?.value || email;

    try {
      // Normalizar el email antes de enviarlo
      const normalizedEmail = emailValue.trim().toLowerCase();

      logger.debug("Intentando login", { email: normalizedEmail }, "LoginPage");

      // Llamar a la API real con las credenciales
      const result = await login({
        email: normalizedEmail,
        password,
      });

      // Verificar si el resultado indica que necesita verificación
      if (
        result &&
        typeof result === "object" &&
        "needsVerification" in result &&
        result.needsVerification
      ) {
        // Redirigir a la página de verificación con el email y el parámetro redirect
        const emailToVerify = result.email || normalizedEmail;
        const redirectParam = searchParams.get("redirect");
        const verificationUrl = redirectParam
          ? `/verificar-codigo?email=${encodeURIComponent(emailToVerify)}&redirect=${encodeURIComponent(redirectParam)}`
          : `/verificar-codigo?email=${encodeURIComponent(emailToVerify)}`;
        router.push(verificationUrl);
        return;
      }

      // Verificar si el resultado contiene un mensaje de error
      if (
        result &&
        typeof result === "object" &&
        "error" in result
      ) {
        // Usar el mensaje de error retornado directamente
        setError(result.error);
        return;
      }

      if (result === true) {
        // Esperar un momento para asegurar que el token se haya guardado en localStorage
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar que el token esté guardado antes de redirigir
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            if (!parsedUser.token) {
              logger.warn("Token no encontrado después del login", undefined, "LoginPage");
              setError("Error al guardar la sesión. Por favor, intenta nuevamente.");
              return;
            }
          } catch (error) {
            logger.error("Error verificando token después del login", error, "LoginPage");
            setError("Error al verificar la sesión. Por favor, intenta nuevamente.");
            return;
          }
        }
        
        // Redirigir a la página de destino o a la principal
        const redirectTo = searchParams.get("redirect") || "/";
        logger.info("Login exitoso, redirigiendo", { redirectTo }, "LoginPage");
        router.push(redirectTo);
      } else {
        // El error ya está manejado por el hook useAuth
        // Priorizar el mensaje del hook que puede contener información específica del backend
        // También verificar si authError se actualizó (puede haber un pequeño delay)
        setError(authError || "Email o contraseña incorrectos");
      }
    } catch (err) {
      const errorMessage =
        "Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.";
      setError(errorMessage);
      logger.error("Error en login", err, "LoginPage");
    }
  };

  const statusMessageId = "login-form-status";

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar el formulario (ya se está redirigiendo)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row" aria-labelledby="login-title">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-left mb-8">
            <h1 id="login-title" className="text-3xl font-bold text-gray-800 mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600">Accede a tu cuenta</p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-describedby={error ? statusMessageId : undefined}
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
                Formulario listo para autenticación.
              </p>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Ingresa tu email"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                      aria-hidden="true"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Recuérdame</span>
              </label>
              <Link
                href="/olvidaste-contrasena"
                className="text-sm text-primary hover:text-primary/80"
              >
                Olvidé mi contraseña
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            {/* Registration Link */}
            <div className="text-center">
              <span className="text-gray-700">¿No tienes una cuenta? </span>
              <Link
                href="/registro"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Regístrate
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  O inicia sesión con
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Professional Image */}
      <div className="flex flex-1 relative" aria-hidden="true">
        <div className="relative w-full h-full flex items-center lg:items-start justify-center p-2">
          <div className="sticky top-4 w-full">
            <div className="w-11/12 h-[400px] lg:h-[600px] relative rounded-3xl overflow-hidden">
              <Image
                src="/smk_Snapchat-Picture.webp"
                alt=""
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
