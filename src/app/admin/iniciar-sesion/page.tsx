"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple demo credential for admin login page (separate from Basic Auth at /admin)
    if (email === "admin@naxine.com" && password === "admin123") {
      login({ email, role: "administracion", name: "Administrador" });
      router.push("/dashboard/admin");
    } else {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Acceso Administración</h1>
        <p className="text-sm text-gray-600 mb-6">
          Usa el usuario de prueba para entrar al panel de administración.
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
            className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
          >
            Iniciar sesión
          </button>
          <div className="text-xs text-gray-600 pt-2">
            Usuario de prueba: admin@naxine.com / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
