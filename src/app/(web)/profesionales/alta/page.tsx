"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import logo from "@/assets/PNG-01.png";

export default function AltaProfesionalPage() {
  const [formData, setFormData] = useState({
    correo: "",
    consentimiento: false,
    nombreApellidos: "",
    titulacion: "",
    numeroColegiado: "",
    correoProfesionalPublico: "",
    descripcion: "",
    videoPresentacion: "",
    modalidades: [] as string[],
    direccionConsulta: "",
    zonasDomicilio: "",
    accesibleMovilidad: "",
    horarios: "",
    calendario: [] as string[],
    servicios: "",
    tarifas: "",
    observaciones: "",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      const checkboxName = name;
      if (checkboxName === "consentimiento") {
        setFormData((prev) => ({
          ...prev,
          consentimiento: checked,
        }));
      } else if (checkboxName === "modalidad") {
        const modalidadValue = (e.target as HTMLInputElement).value;
        setFormData((prev) => ({
          ...prev,
          modalidades: checked
            ? [...prev.modalidades, modalidadValue]
            : prev.modalidades.filter((m) => m !== modalidadValue),
        }));
      } else if (checkboxName === "calendario") {
        const calendarioValue = (e.target as HTMLInputElement).value;
        setFormData((prev) => ({
          ...prev,
          calendario: checked
            ? [...prev.calendario, calendarioValue]
            : prev.calendario.filter((c) => c !== calendarioValue),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error cuando el usuario empieza a escribir
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Por favor, selecciona un archivo de imagen válido");
        setSubmitStatus("error");
        return;
      }

      // Validar tamaño (máx. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("La imagen no debe superar los 5MB");
        setSubmitStatus("error");
        return;
      }

      setFoto(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateVideoUrl = (url: string): boolean => {
    if (!url) return true; // Opcional
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
    return youtubeRegex.test(url) || vimeoRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // Validar campos requeridos
      if (!formData.correo.trim()) {
        setErrorMessage("El correo es requerido");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.consentimiento) {
        setErrorMessage("Debes aceptar el consentimiento de tratamiento de datos");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.nombreApellidos.trim()) {
        setErrorMessage("El nombre y apellidos son requeridos");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.titulacion.trim()) {
        setErrorMessage("La titulación profesional es requerida");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.numeroColegiado.trim()) {
        setErrorMessage("El número de colegiado/a es requerido");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.correoProfesionalPublico.trim()) {
        setErrorMessage("El correo electrónico profesional es requerido");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.descripcion.trim()) {
        setErrorMessage("La descripción general del perfil profesional es requerida");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (formData.descripcion.length > 1500) {
        setErrorMessage("La descripción no debe superar los 1.500 caracteres");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!foto) {
        setErrorMessage("La foto del perfil profesional es requerida");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (formData.modalidades.length === 0) {
        setErrorMessage("Debes seleccionar al menos una modalidad de atención");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      // Validar dirección si ofrece presencial
      if (formData.modalidades.includes("presencial") && !formData.direccionConsulta.trim()) {
        setErrorMessage("La dirección de consulta es requerida si ofreces atención presencial");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.accesibleMovilidad) {
        setErrorMessage("Debes indicar si tu consulta es accesible para personas con movilidad reducida");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.horarios.trim()) {
        setErrorMessage("Los horarios disponibles son requeridos");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (formData.calendario.length === 0) {
        setErrorMessage("Debes seleccionar al menos un calendario");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.servicios.trim()) {
        setErrorMessage("Los servicios ofrecidos son requeridos");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.tarifas.trim()) {
        setErrorMessage("Las tarifas son requeridas");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      // Validar formato de emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        setErrorMessage("El formato del correo no es válido");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (!emailRegex.test(formData.correoProfesionalPublico)) {
        setErrorMessage("El formato del correo electrónico profesional no es válido");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      // Validar URL de video si se proporciona
      if (formData.videoPresentacion && !validateVideoUrl(formData.videoPresentacion)) {
        setErrorMessage("El enlace al vídeo debe ser de YouTube o Vimeo");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value as string);
        }
      });

      if (foto) {
        formDataToSend.append("foto", foto);
      }

      // Enviar formulario
      const response = await fetch("/api/profesionales/alta", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus("success");
        // Resetear formulario
        setFormData({
          correo: "",
          consentimiento: false,
          nombreApellidos: "",
          titulacion: "",
          numeroColegiado: "",
          correoProfesionalPublico: "",
          descripcion: "",
          videoPresentacion: "",
          modalidades: [],
          direccionConsulta: "",
          zonasDomicilio: "",
          accesibleMovilidad: "",
          horarios: "",
          calendario: [],
          servicios: "",
          tarifas: "",
          observaciones: "",
        });
        setFoto(null);
        setFotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setErrorMessage(
          data.error || "Error al enviar el formulario. Por favor, inténtalo de nuevo."
        );
        setSubmitStatus("error");
      }
    } catch (error: any) {
      console.error("Error al enviar formulario de alta:", error);
      setErrorMessage(
        error?.message || "Error al enviar el formulario. Por favor, inténtalo de nuevo."
      );
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusMessageId = "alta-profesional-form-status";
  const caracteresRestantes = 1500 - formData.descripcion.length;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-48 h-48">
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
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Formulario de Alta Especialista en NAXINE
          </h1>
          <p className="text-gray-600 text-lg">
            Bienvenido/a al proceso de alta de especialista de NAXINE. Completa este formulario
            para validar tu perfil y preparar tu futura ficha pública en la plataforma.
          </p>
        </div>

        {/* Form */}
        <div className="w-full">
          {submitStatus === "success" && (
            <div
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              role="status"
              aria-live="polite"
              id={statusMessageId}
            >
              <p className="text-green-800 text-sm text-center">
                ¡Formulario enviado correctamente! Hemos recibido tu solicitud
                y te contactaremos pronto por email.
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
              aria-live="assertive"
              id={statusMessageId}
            >
              <p className="text-red-800 text-sm text-center">
                {errorMessage ||
                  "Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo."}
              </p>
            </div>
          )}

          {submitStatus === "idle" && (
            <div id={statusMessageId} aria-live="polite" className="sr-only">
              Estado del formulario sin cambios.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-describedby={
              submitStatus !== "idle" ? statusMessageId : undefined
            }
            aria-busy={isSubmitting}
          >
            {/* 1. Correo */}
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* 2. Consentimiento */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consentimiento"
                  checked={formData.consentimiento}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  Declaro haber leído la información anterior y consiento el tratamiento de mis
                  datos personales para la finalidad de validación profesional y gestión de mi
                  solicitud de alta en NAXINE. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* 3. Nombre y Apellidos */}
            <div>
              <label
                htmlFor="nombreApellidos"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre y apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombreApellidos"
                name="nombreApellidos"
                value={formData.nombreApellidos}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Nombre y apellidos completos"
              />
            </div>

            {/* 4. Titulación profesional */}
            <div>
              <label
                htmlFor="titulacion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Titulación profesional <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Será visible en tu futura ficha pública)</span>
              </label>
              <input
                type="text"
                id="titulacion"
                name="titulacion"
                value={formData.titulacion}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Ej: Grado en Psicología"
              />
            </div>

            {/* 5. Número de colegiado/a */}
            <div>
              <label
                htmlFor="numeroColegiado"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de colegiado/a <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Será visible en tu futura ficha pública)</span>
              </label>
              <input
                type="text"
                id="numeroColegiado"
                name="numeroColegiado"
                value={formData.numeroColegiado}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Número de colegiado/a"
              />
            </div>

            {/* 6. Correo electrónico profesional */}
            <div>
              <label
                htmlFor="correoProfesionalPublico"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo electrónico profesional <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Será visible en tu futura ficha pública)</span>
              </label>
              <input
                type="email"
                id="correoProfesionalPublico"
                name="correoProfesionalPublico"
                value={formData.correoProfesionalPublico}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="profesional@email.com"
              />
            </div>

            {/* 8. Descripción general del perfil profesional */}
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descripción general del perfil profesional <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Máximo 1.500 caracteres. Será visible en tu futura ficha pública)
                </span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                maxLength={1500}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Describe tu perfil profesional, experiencia y especialidades..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {caracteresRestantes} caracteres restantes
              </p>
            </div>

            {/* 9. Foto del perfil profesional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto del perfil profesional <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Será visible en tu futura ficha pública)</span>
              </label>
              {fotoPreview ? (
                <div className="relative">
                  <div className="w-48 h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar foto
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
                  </p>
                </div>
              )}
            </div>

            {/* 10. Enlace al vídeo de presentación */}
            <div>
              <label
                htmlFor="videoPresentacion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enlace al vídeo de presentación
                <span className="text-xs text-gray-500 ml-2">
                  (Opcional, solo YouTube o Vimeo. Será visible en tu futura ficha pública)
                </span>
              </label>
              <input
                type="url"
                id="videoPresentacion"
                name="videoPresentacion"
                value={formData.videoPresentacion}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
              />
            </div>

            {/* 11. Modalidades de atención */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalidades de atención que ofreces <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {["online", "presencial", "domicilio"].map((modalidad) => (
                  <label key={modalidad} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="modalidad"
                      value={modalidad}
                      checked={formData.modalidades.includes(modalidad)}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {modalidad === "domicilio" ? "A domicilio" : modalidad}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 12. Dirección de consulta */}
            {formData.modalidades.includes("presencial") && (
              <div>
                <label
                  htmlFor="direccionConsulta"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Dirección de consulta <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Solo si ofreces atención presencial)</span>
                </label>
                <textarea
                  id="direccionConsulta"
                  name="direccionConsulta"
                  value={formData.direccionConsulta}
                  onChange={handleInputChange}
                  required={formData.modalidades.includes("presencial")}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Dirección completa de la consulta"
                />
              </div>
            )}

            {/* 13. Zonas donde atiendes a domicilio */}
            {formData.modalidades.includes("domicilio") && (
              <div>
                <label
                  htmlFor="zonasDomicilio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Zonas donde atiendes a domicilio
                  <span className="text-xs text-gray-500 ml-2">(Si aplica)</span>
                </label>
                <textarea
                  id="zonasDomicilio"
                  name="zonasDomicilio"
                  value={formData.zonasDomicilio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Indica las zonas donde ofreces atención a domicilio"
                />
              </div>
            )}

            {/* 14. Accesible para movilidad reducida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Tu consulta es accesible para personas con movilidad reducida?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {["Sí", "No"].map((opcion) => (
                  <label key={opcion} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="accesibleMovilidad"
                      value={opcion}
                      checked={formData.accesibleMovilidad === opcion}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{opcion}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 15. Horarios disponibles */}
            <div>
              <label
                htmlFor="horarios"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Horarios disponibles <span className="text-red-500">*</span>
              </label>
              <textarea
                id="horarios"
                name="horarios"
                value={formData.horarios}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Ej: Lunes a Viernes: 9:00-14:00 y 16:00-20:00"
              />
            </div>

            {/* 16. Calendario utilizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué calendario utilizas habitualmente? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {["Google Calendar", "Outlook"].map((calendario) => (
                  <label key={calendario} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="calendario"
                      value={calendario}
                      checked={formData.calendario.includes(calendario)}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{calendario}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 17. Servicios ofrecidos */}
            <div>
              <label
                htmlFor="servicios"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Servicios ofrecidos <span className="text-red-500">*</span>
              </label>
              <textarea
                id="servicios"
                name="servicios"
                value={formData.servicios}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Describe los servicios que ofreces..."
              />
            </div>

            {/* 18. Tarifas */}
            <div>
              <label
                htmlFor="tarifas"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tarifas <span className="text-red-500">*</span>
              </label>
              <textarea
                id="tarifas"
                name="tarifas"
                value={formData.tarifas}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Indica tus tarifas por sesión o servicio..."
              />
            </div>

            {/* 19. Observaciones */}
            <div>
              <label
                htmlFor="observaciones"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Observaciones
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Cualquier información adicional que consideres relevante..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando solicitud..." : "Enviar solicitud"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
