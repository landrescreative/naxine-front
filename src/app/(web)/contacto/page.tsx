"use client";

import { useState } from "react";
import Image from "next/image";
import logo from "@/assets/PNG-01.png";
import { ticketsService } from "@/services/api/tickets";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error cuando el usuario empieza a escribir
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // Validar campos requeridos
      if (!formData.name.trim()) {
        setErrorMessage("El nombre es requerido");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.email.trim()) {
        setErrorMessage("El correo electrónico es requerido");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.message.trim() || formData.message.trim().length < 10) {
        setErrorMessage("El mensaje debe tener al menos 10 caracteres");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      // Enviar ticket público
      const response = await ticketsService.createPublicTicket({
        nombre: formData.name.trim(),
        asunto: formData.subject.trim() || undefined,
        mensaje: formData.message.trim(),
        correo_electronico: formData.email.trim(),
      });

      if (response.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setErrorMessage(
          response.error || "Error al enviar el mensaje. Por favor, inténtalo de nuevo."
        );
        setSubmitStatus("error");
      }
    } catch (error: any) {
      console.error("Error al enviar formulario de contacto:", error);
      setErrorMessage(
        error?.message || "Error al enviar el mensaje. Por favor, inténtalo de nuevo."
      );
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-56 h-56 ">
            <Image
              src={logo}
              alt="NAXINE Logo"
              width={200}
              height={200}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Hola, ¿En qué podemos ayudarte?
          </h2>
          <p className="text-gray-600 text-lg">
            No dudes en contactarnos. ¡Estamos aquí para escucharte!
          </p>
        </div>

        {/* Contact Form */}
        <div className="w-full max-w-md">
          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm text-center">
                ¡Mensaje enviado correctamente! Te responderemos pronto.
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">
                {errorMessage || "Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Ingresa tu nombre"
              />
            </div>

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
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Ingresa tu email"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Asunto
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Ingresa el asunto"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Ingresa tu mensaje"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
