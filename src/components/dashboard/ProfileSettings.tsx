"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Check } from "lucide-react";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  city: string;
  postalCode: string;
}

interface NotificationSettings {
  appointmentReminders: boolean;
  transactionUpdates: boolean;
}

export default function ProfileSettings() {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    city: "",
    postalCode: "",
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      appointmentReminders: true,
      transactionUpdates: true,
    });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        username: `@${user.email?.split("@")[0] || ""}`,
        phone: "+52 55 31 953 893", // Datos por defecto, se pueden obtener de la API
        city: "Madrid, España",
        postalCode: "03920",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (
    field: keyof typeof passwordData,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationToggle = (field: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleEditField = (field: keyof ProfileData) => {
    setEditingField(field);
    setTempValue(profileData[field]);
  };

  const handleSaveField = (field: keyof ProfileData) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: tempValue,
    }));
    setEditingField(null);
    setTempValue("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const renderEditableField = (
    field: keyof ProfileData,
    label: string,
    type: string = "text"
  ) => {
    const isEditing = editingField === field;
    const currentValue = profileData[field];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                autoFocus
              />
              <button
                onClick={() => handleSaveField(field)}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                ✓
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <input
                type={type}
                value={currentValue}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
              <button
                onClick={() => handleEditField(field)}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                Editar
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    // Simular guardado de datos
    console.log("Guardando datos:", {
      profileData,
      notificationSettings,
      passwordData,
    });

    // Mostrar notificación de éxito
    setShowSuccessNotification(true);

    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 3000);
  };

  const handleCancel = () => {
    // Resetear formulario a valores originales
    setProfileData({
      firstName: "Juan",
      lastName: "Pérez",
      email: "jp@gmail.com",
      username: "@jpnutriologo",
      phone: "+52 55 31 953 893",
      city: "Madrid, España",
      postalCode: "03920",
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ajustes de Perfil
          </h1>
          <p className="text-gray-600 mt-1">Edita tu perfil</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Informacion Personal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderEditableField("firstName", "Nombre")}
          {renderEditableField("lastName", "Apellido")}
          {renderEditableField("email", "Correo Electrónico", "email")}
          {renderEditableField("username", "Nombre de usuario")}
          {renderEditableField("phone", "Teléfono", "tel")}
          {renderEditableField("city", "Ciudad")}
          {renderEditableField("postalCode", "Código Postal")}
        </div>
      </div>

      {/* Password Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Contraseña</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña actual
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirma Contraseña
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Password Requirements */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Para crear una nueva contraseña, debes cumplir estos requisitos.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Al menos 8 carácteres</li>
            <li>• Al menos un caracter especial</li>
            <li>• Al menos un numero</li>
            <li>• No puede ser similar a alguna anterior</li>
          </ul>
        </div>
      </div>

      {/* Notification Settings Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Configuración de Notificaciones
        </h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNotificationToggle("appointmentReminders")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                notificationSettings.appointmentReminders
                  ? "bg-green-600"
                  : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notificationSettings.appointmentReminders
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              Recordatorios de citas vía correo electrónico
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNotificationToggle("transactionUpdates")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                notificationSettings.transactionUpdates
                  ? "bg-green-600"
                  : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notificationSettings.transactionUpdates
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              Actualizaciones de transacciones bancarias
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-purple-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Cambios aplicados</span>
              <span className="font-medium text-sm">correctamente.</span>
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className="ml-2 text-white hover:text-gray-200 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
