"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Usuarios ficticios para testing
const fakeUsers = {
  cliente: {
    email: "cliente@naxine.com",
    password: "cliente123",
    role: "cliente",
    name: "Juan Pérez",
  },
  profesional: {
    email: "profesional@naxine.com",
    password: "profesional123",
    role: "profesional",
    name: "María García",
  },
  admin: {
    email: "admin@naxine.com",
    password: "admin123",
    role: "administracion",
    name: "Carlos Admin",
  },
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Buscar usuario por email y contraseña
    const user = Object.values(fakeUsers).find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      console.log("Login: Usuario encontrado:", user);
      // Usar el hook de autenticación
      login(user);

      // Redirigir a la página principal después del login
      router.push("/");
    } else {
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600">Accede a tu cuenta</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Ingresa tu email"
                required
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
                >
                  {showPassword ? (
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
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Iniciar sesión
            </button>

            {/* Registration Link */}
            <div className="text-center">
              <span className="text-gray-700">¿No tienes una cuenta? </span>
              <Link
                href="/register"
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

            {/* Usuarios de Prueba */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Usuarios de Prueba:
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div>
                  <strong>Cliente:</strong> cliente@naxine.com / cliente123
                </div>
                <div>
                  <strong>Profesional:</strong> profesional@naxine.com /
                  profesional123
                </div>
                <div>
                  <strong>Admin:</strong> admin@naxine.com / admin123
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Professional Image */}
      <div className="flex flex-1 relative">
        <div className="relative w-full h-full flex items-center lg:items-start justify-center p-2">
          <div className="sticky top-4 w-full">
            <div className="w-11/12 h-[400px] lg:h-[600px] relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
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
