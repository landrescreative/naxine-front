// src/components/examples/AuthExample.tsx
"use client";

import { useState } from "react";
import { useAuth, type LoginResult } from "@/hooks/useAuth";
import { validateEmail, validatePassword } from "@/services/utils/api-helpers";

export const AuthExample = () => {
  const { user, loading, error, login, register, logout, clearError } =
    useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    clearError();

    // Validaciones
    const errors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      errors.email = "Email inválido";
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        errors.name = "Nombre es requerido";
      }
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(", ");
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let success: LoginResult | { success: boolean; email: string | null } = false;

      if (isLogin) {
        success = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        success = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: "client",
        });
      }

      if (success === true || 
          (typeof success === 'object' && 'needsVerification' in success && success.needsVerification) ||
          (typeof success === 'object' && 'success' in success && success.success)) {
        setFormData({ email: "", password: "", name: "" });
        console.log("Operación exitosa");
      }
    } catch (err) {
      console.error("Error en autenticación:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Cargando...</div>;
  }

  if (user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">¡Bienvenido!</h2>
        <div className="mb-4">
          <p>
            <strong>Nombre:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Rol:</strong> {user.role}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? "Iniciar Sesión" : "Registrarse"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Tu nombre completo"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="tu@email.com"
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Mínimo 8 caracteres"
          />
          {formErrors.password && (
            <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading
            ? "Procesando..."
            : isLogin
            ? "Iniciar Sesión"
            : "Registrarse"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:text-blue-700"
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
};
