"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/api/auth";
import { apiClient } from "@/services/api/client";
import { Check } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  address: string;
  postalCode: string;
}

interface NotificationSettings {
  appointmentReminders: boolean;
  transactionUpdates: boolean;
}

export default function ProfileSettings() {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    address: "",
    postalCode: "",
  });

  const [originalProfileData, setOriginalProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    address: "",
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Función para cargar el perfil desde el backend
  const loadProfile = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      // No necesitamos verificar user aquí porque el token está en localStorage
      // y el backend validará el token

      if (process.env.NODE_ENV === "development") {
        console.log("[ProfileSettings] Solicitando perfil del backend...");
      }

      const response = await authService.getProfile();

      if (process.env.NODE_ENV === "development") {
        console.log("[ProfileSettings] Respuesta del backend:", response);
      }

      if (response.success && response.data) {
        // apiClient.get devuelve: { success: true, data: <respuesta_completa_del_backend> }
        // Backend devuelve: { success: true, data: { usuario: { nombre: "Alex test", email: "...", ... } } }
        // Entonces response.data es: { success: true, data: { usuario: {...} } }
        const backendResponse = response.data as any;
        
        // Extraer el objeto usuario - puede estar en diferentes niveles
        let usuario = null;
        if (backendResponse?.data?.usuario) {
          // Caso: response.data = { success: true, data: { usuario: {...} } }
          usuario = backendResponse.data.usuario;
        } else if (backendResponse?.usuario) {
          // Caso: response.data = { usuario: {...} }
          usuario = backendResponse.usuario;
        } else if (backendResponse?.nombre || backendResponse?.email) {
          // Caso: response.data = { nombre: "...", email: "...", ... } (objeto usuario directo)
          usuario = backendResponse;
        }
        
        if (process.env.NODE_ENV === "development") {
          console.log("[ProfileSettings] response.data completo:", backendResponse);
          console.log("[ProfileSettings] Usuario extraído del backend:", usuario);
        }
        
        if (!usuario) {
          console.error("[ProfileSettings] No se pudo extraer el objeto usuario de la respuesta");
          console.error("[ProfileSettings] Estructura recibida:", JSON.stringify(backendResponse, null, 2));
          throw new Error("Formato de respuesta del backend no reconocido");
        }
        
        // Usar el backend como fuente de verdad
        // El backend puede devolver nombre_completo o nombre
        const userName = usuario.nombre_completo || usuario.nombre || usuario.name || "";
        const userEmail = usuario.email || "";
        
        if (process.env.NODE_ENV === "development") {
          console.log("[ProfileSettings] Nombre completo del backend:", userName);
          console.log("[ProfileSettings] Email del backend:", userEmail);
        }

        const profileDataToSet: ProfileData = {
          name: userName,
          email: userEmail,
          address: usuario.direccion || usuario.address || usuario.ciudad || usuario.city || "",
          postalCode: usuario.codigo_postal || usuario.postalCode || usuario.codigoPostal || "",
        };

        setProfileData(profileDataToSet);
        setOriginalProfileData(profileDataToSet);

        if (process.env.NODE_ENV === "development") {
          console.log("[ProfileSettings] Perfil cargado exitosamente desde backend:", profileDataToSet);
        }
      } else {
        // Solo usar datos del usuario cacheado como último recurso si el backend falla
        if (process.env.NODE_ENV === "development") {
          console.warn("[ProfileSettings] No se obtuvieron datos del backend, usando datos del usuario autenticado como fallback");
        }
        
        if (user) {
          const fallbackData: ProfileData = {
            name: user.name || "",
            email: user.email || "",
            address: "",
            postalCode: "",
          };
          setProfileData(fallbackData);
          setOriginalProfileData(fallbackData);
        }
      }
    } catch (err: any) {
      console.error("[ProfileSettings] Error al cargar perfil:", err);
      setError("No se pudieron cargar los datos completos del perfil. Se muestran los datos básicos.");
      
      // Fallback a datos del usuario cacheado solo si el backend falla completamente
      if (user) {
        const fallbackData: ProfileData = {
          name: user.name || "",
          email: user.email || "",
          address: "",
          postalCode: "",
        };
        setProfileData(fallbackData);
        setOriginalProfileData(fallbackData);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [user]);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    // Esperar a que el usuario esté disponible antes de cargar
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user, loadProfile]);

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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                className="px-3 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg transition-colors"
              >
                Editar
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setPasswordError(null);

    try {
      // Actualizar perfil si hay cambios
      const hasProfileChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
      
      if (hasProfileChanges) {
        // Validar que el email no esté vacío
        if (!profileData.email || !profileData.email.trim()) {
          setError("El correo electrónico es requerido");
          setSaving(false);
          return;
        }

        // Validar formato de email básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email.trim())) {
          setError("Debe ser un email válido");
          setSaving(false);
          return;
        }

        // Validar que el nombre no esté vacío
        if (!profileData.name || !profileData.name.trim()) {
          setError("El nombre es requerido");
          setSaving(false);
          return;
        }

        // Formato según las instrucciones del backend
        // El endpoint /clientes/me/perfil espera 'nombre' (no nombre_completo)
        const updateData: any = {
          nombre: profileData.name.trim(),
          email: profileData.email.trim(),
        };

        // Agregar campos adicionales si existen
        if (profileData.address) {
          updateData.direccion = profileData.address;
        }
        if (profileData.postalCode) {
          updateData.codigo_postal = profileData.postalCode;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("[ProfileSettings] Actualizando perfil con datos:", updateData);
        }

        // Usar la ruta específica de clientes
        const profileResponse = await apiClient.put<any>("/clientes/me/perfil", updateData);

        if (!profileResponse.success) {
          throw new Error(profileResponse.error || "Error al actualizar el perfil");
        }

        if (process.env.NODE_ENV === "development") {
          console.log("[ProfileSettings] Respuesta del backend después de actualizar:", profileResponse);
        }

        // Actualizar el usuario en localStorage y contexto con los datos del backend
        if (profileResponse.data?.usuario) {
          const updatedUsuario = profileResponse.data.usuario;
          
          // Obtener el usuario actual del localStorage
          const currentUserData = localStorage.getItem("user");
          if (currentUserData) {
            try {
              const currentUser = JSON.parse(currentUserData);
              
              // Actualizar con los datos del backend - usar nombre_completo o nombre
              const updatedName = updatedUsuario.nombre_completo || updatedUsuario.nombre || currentUser.name;
              
              const updatedUser = {
                ...currentUser,
                name: updatedName,
                email: updatedUsuario.email || currentUser.email,
              };
              
              // Guardar en localStorage
              localStorage.setItem("user", JSON.stringify(updatedUser));
              
              // Disparar evento para que useAuth actualice el contexto
              window.dispatchEvent(new CustomEvent("userLogin"));
              
              if (process.env.NODE_ENV === "development") {
                console.log("[ProfileSettings] Usuario actualizado en localStorage:", updatedUser);
              }
            } catch (error) {
              console.error("[ProfileSettings] Error actualizando usuario en localStorage:", error);
            }
          }
        }

        // Recargar el perfil desde el backend para reflejar los cambios actualizados
        await loadProfile(false);
      }

      // Cambiar contraseña si se proporcionó
      if (passwordData.newPassword && passwordData.currentPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setPasswordError("Las contraseñas no coinciden");
          setSaving(false);
          return;
        }

        if (passwordData.newPassword.length < 8) {
          setPasswordError("La contraseña debe tener al menos 8 caracteres");
          setSaving(false);
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("[ProfileSettings] Cambiando contraseña...");
        }

        // Usar la ruta específica de clientes
        const passwordResponse = await apiClient.put<{ message: string }>(
          "/clientes/me/cambiar-password",
          {
            password_actual: passwordData.currentPassword,
            password_nueva: passwordData.newPassword,
          }
        );

        if (!passwordResponse.success) {
          setPasswordError(passwordResponse.error || "Error al cambiar la contraseña");
          setSaving(false);
          return;
        }

        // Limpiar campos de contraseña después de éxito
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        if (process.env.NODE_ENV === "development") {
          console.log("[ProfileSettings] Contraseña cambiada exitosamente");
        }
      }

      // Mostrar notificación de éxito solo si hubo cambios
      if (hasProfileChanges || (passwordData.newPassword && passwordData.currentPassword)) {
        setShowSuccessNotification(true);

        // Ocultar notificación después de 3 segundos
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 3000);
      }
    } catch (err: any) {
      console.error("[ProfileSettings] Error al guardar perfil:", err);
      setError(err.message || "Ocurrió un error al guardar los cambios. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Resetear formulario a valores originales
    setProfileData({ ...originalProfileData });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError(null);
    setPasswordError(null);
    setEditingField(null);
    setTempValue("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

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
            disabled={saving}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Personal Information Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Informacion Personal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderEditableField("name", "Nombre Completo")}
          {renderEditableField("email", "Correo Electrónico", "email")}
          {renderEditableField("address", "Dirección")}
          {renderEditableField("postalCode", "Código Postal")}
        </div>
      </div>

      {/* Password Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Contraseña</h2>

        {passwordError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {passwordError}
          </div>
        )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
          <div className="bg-primary text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-primary" />
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
