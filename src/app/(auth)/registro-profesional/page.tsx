"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api/auth";
import { validateEmail, validatePassword } from "@/services/utils/api-helpers";

export default function RegisterProfessionalPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    numeroColegiado: "",
    especialidad: "",
    mensaje: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validaciones
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son requeridos";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(", ");
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Por favor confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    }

    if (!formData.numeroColegiado.trim()) {
      newErrors.numeroColegiado = "El número de colegiado es requerido";
    }

    if (!formData.especialidad.trim()) {
      newErrors.especialidad = "La especialidad es requerida";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Combinar código de país con teléfono
      const telefonoCompleto = formData.telefono.trim();

      const response = await authService.registerProfessional({
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        telefono: telefonoCompleto,
        numero_colegiado: formData.numeroColegiado.trim(),
        especialidad: formData.especialidad.trim(),
        descripcion: formData.mensaje.trim() || "",
      });

      if (response.success) {
        // Para profesionales: no redirigir a verificación por código
        setSuccessMsg(
          response.message ||
            "Tu solicitud de registro ha sido enviada al administrador. Te notificaremos por email cuando sea revisada."
        );
      } else {
        // Mostrar el mensaje de error específico del backend
        const errorMessage =
          response.error || "Error al registrar. Por favor, intenta de nuevo.";

        // Solo loggear si hay información útil
        if (process.env.NODE_ENV === "development") {
          if (
            response.errorDetails &&
            Object.keys(response.errorDetails).length > 0
          ) {
            console.error(
              "[Registro Profesional] Error del backend:",
              response
            );
            console.error(
              "[Registro Profesional] Error details:",
              response.errorDetails
            );
          } else if (response.error) {
            console.error("[Registro Profesional] Error:", response.error);
          }
        }

        // Mapear errores de validación a campos específicos si están disponibles
        const fieldErrors: Record<string, string> = {};

        if (
          response.errorDetails?.errors &&
          Array.isArray(response.errorDetails.errors)
        ) {
          response.errorDetails.errors.forEach((err: any) => {
            // El error puede venir en diferentes formatos
            let fieldName = "";
            let errorMsg = "";

            if (typeof err === "string") {
              errorMsg = err;
            } else if (err.field) {
              fieldName = err.field;
              errorMsg = err.message || err.msg || JSON.stringify(err);
            } else if (err.path || err.param) {
              fieldName = err.path || err.param;
              errorMsg = err.message || err.msg || JSON.stringify(err);
            } else {
              errorMsg = err.message || err.msg || JSON.stringify(err);
            }

            // Mapear nombres de campos del backend a los del frontend
            const fieldMap: Record<string, string> = {
              nombre: "nombre",
              apellidos: "apellidos",
              email: "email",
              password: "password",
              telefono: "telefono",
              numero_colegiado: "numeroColegiado",
              especialidad: "especialidad",
              descripcion: "mensaje",
            };

            const frontendField = fieldName
              ? fieldMap[fieldName.toLowerCase()] || fieldName
              : "";

            if (frontendField && errorMsg) {
              fieldErrors[frontendField] = errorMsg;
            } else if (errorMsg && !frontendField) {
              // Si no hay campo específico, agregar al error general
              if (!fieldErrors.submit) {
                fieldErrors.submit = errorMsg;
              } else {
                fieldErrors.submit += `, ${errorMsg}`;
              }
            }
          });
        }

        // Si hay errores de campos específicos, usarlos; si no, usar el mensaje general
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: errorMessage });
        }
      }
    } catch (err: any) {
      // Capturar y mostrar el error detallado
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al registrar. Por favor, intenta de nuevo.";
      console.error("Error en registro profesional:", err);
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const statusMessageId = "professional-register-status";
  const successMessageId = `${statusMessageId}-success`;
  const describedByIds =
    [
      errors.submit ? statusMessageId : "",
      successMsg ? successMessageId : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Regístrate como profesional
            </h1>
            <p className="text-gray-600">
              Estamos encantados de trabajar contigo.
            </p>
          </div>

          {/* Registration Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-describedby={describedByIds}
            aria-busy={loading}
          >
            {/* Name and Last Name Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.nombre ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Tu nombre"
                  required
                  disabled={!!successMsg}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? "nombre-prof-error" : undefined}
                />
                {errors.nombre && (
                <p id="nombre-prof-error" className="mt-1 text-sm text-red-600">
                  {errors.nombre}
                </p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <label
                  htmlFor="apellidos"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Apellidos
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.apellidos ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Tus apellidos"
                  required
                  disabled={!!successMsg}
                aria-invalid={Boolean(errors.apellidos)}
                aria-describedby={errors.apellidos ? "apellidos-prof-error" : undefined}
                />
                {errors.apellidos && (
                <p id="apellidos-prof-error" className="mt-1 text-sm text-red-600">
                    {errors.apellidos}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="tu@email.com"
                  required
                  disabled={!!successMsg}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-prof-error" : undefined}
              />
              {errors.email && (
                <p id="email-prof-error" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
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
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={!!successMsg}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-prof-error" : undefined}
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
              {errors.password && (
                <p id="password-prof-error" className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirma tu contraseña"
                  required
                  disabled={!!successMsg}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-prof-error" : undefined
                }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmación de contraseña"
                    : "Mostrar confirmación de contraseña"
                }
                aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p
                  id="confirm-password-prof-error"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.telefono ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="+34 600 123 456"
                  required
                  disabled={!!successMsg}
                aria-invalid={Boolean(errors.telefono)}
                aria-describedby={errors.telefono ? "telefono-prof-error" : undefined}
              />
              {errors.telefono && (
                <p id="telefono-prof-error" className="mt-1 text-sm text-red-600">
                  {errors.telefono}
                </p>
              )}
            </div>

            {/* Membership Number Field */}
            <div>
              <label
                htmlFor="numeroColegiado"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de colegiado
              </label>
              <input
                type="text"
                id="numeroColegiado"
                name="numeroColegiado"
                value={formData.numeroColegiado}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.numeroColegiado ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Número de colegiado"
                  required
                  disabled={!!successMsg}
                aria-invalid={Boolean(errors.numeroColegiado)}
                aria-describedby={
                  errors.numeroColegiado ? "colegiado-prof-error" : undefined
                }
              />
              {errors.numeroColegiado && (
                <p id="colegiado-prof-error" className="mt-1 text-sm text-red-600">
                  {errors.numeroColegiado}
                </p>
              )}
            </div>

            {/* Specialty Field */}
            <div>
              <label
                htmlFor="especialidad"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Especialidad o área profesional
              </label>
              <input
                type="text"
                id="especialidad"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.especialidad ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Tu especialidad profesional"
                  required
                  disabled={!!successMsg}
                aria-invalid={Boolean(errors.especialidad)}
                aria-describedby={
                  errors.especialidad ? "especialidad-prof-error" : undefined
                }
              />
              {errors.especialidad && (
                <p id="especialidad-prof-error" className="mt-1 text-sm text-red-600">
                  {errors.especialidad}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="mensaje"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleInputChange}
                rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Cuéntanos sobre ti y tu experiencia profesional..."
                  disabled={!!successMsg}
              />
            </div>

            {/* Success / Error Messages */}
            {successMsg && (
              <div
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
                role="status"
                aria-live="polite"
                id={successMessageId}
              >
                {successMsg}
              </div>
            )}
            {!successMsg && errors.submit && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                role="alert"
                aria-live="assertive"
                id={statusMessageId}
              >
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mt-6"
            >
              {loading ? "Registrando..." : successMsg ? "Enviado" : "Enviar"}
            </button>

            {/* Login Link */}
            <div className="text-center mt-4">
              <span className="text-gray-700">¿Ya tienes una cuenta? </span>
              <Link
                href="/iniciar-sesion"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Iniciar sesión
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Professional Image */}
      <div className="flex flex-1 relative">
        <div className="relative w-full h-full flex items-center lg:items-start justify-center p-2">
          <div className="sticky top-4 w-full">
            <div className="w-11/12 h-[400px] lg:h-[600px] relative rounded-3xl overflow-hidden">
              <Image
                src="/smk_Snapchat-Picture.webp"
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
