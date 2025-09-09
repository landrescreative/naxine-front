"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function RegisterProfessionalPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    numeroColegiado: "",
    especialidad: "",
    mensaje: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Tu nombre"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Tus apellidos"
                />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Teléfono
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-20 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="+34"
                />
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="123 456 789"
                />
              </div>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Número de colegiado"
              />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Tu especialidad profesional"
              />
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
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mt-6"
            >
              Enviar
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
            <div className="w-11/12 h-[400px] lg:h-[600px] relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
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
