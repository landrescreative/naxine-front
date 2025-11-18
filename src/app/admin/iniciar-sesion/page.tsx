"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, error: authError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Llamar a la API real con las credenciales
      const success = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (success) {
        // Verificar que el usuario sea admin antes de redirigir
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.role === "admin") {
            router.push("/dashboard/admin");
          } else {
            setError("No tienes permisos de administrador");
          }
        } else {
          router.push("/dashboard/admin");
        }
      } else {
        // El error ya está manejado por el hook useAuth
        setError(authError || "Email o contraseña incorrectos");
      }
    } catch (err) {
      const errorMessage = "Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.";
      setError(errorMessage);
      logger.error("Error en login admin", err, "AdminLoginPage");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Acceso Administración</h1>
        <p className="text-sm text-gray-600 mb-6">
          Ingresa tus credenciales de administrador para acceder al panel.
        </p>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@naxine.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin123"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
