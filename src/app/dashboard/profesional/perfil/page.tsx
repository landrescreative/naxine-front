"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Check } from "lucide-react";

export default function PerfilPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    firstName: "Juan",
    lastName: "Pérez",
    email: "jp@gmail.com",
    username: "@jnutriologo",
    phone: "+52 55 31 953 893",
    city: "Madrid, España",
    occupation: "Nutriologo",
    postalCode: "63929",
  });

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [notif, setNotif] = useState({
    bankUpdates: true,
    appointmentReminders: true,
  });

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      firstName: user.name?.split(" ")[0] || prev.firstName,
      lastName: user.name?.split(" ").slice(1).join(" ") || prev.lastName,
      email: user.email || prev.email,
    }));
  }, [user]);

  const toggle = (key: keyof typeof notif) =>
    setNotif((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancel = () => {
    setPassword({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="space-y-6">
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-purple-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Cambios aplicados</span>
              <span className="font-medium text-sm">correctamente.</span>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-2">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Ajustes de Perfil
          </h2>
          <p className="text-xs text-purple-600 mt-1">
            NOTA: La información personal no es editable por el usuario,
            contacta con soporte para cambiar tu información.
          </p>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Info + Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  disabled
                  value={profile.firstName}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  disabled
                  value={profile.lastName}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  disabled
                  value={profile.email}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de usuario
                </label>
                <input
                  disabled
                  value={profile.username}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  disabled
                  value={profile.phone}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ciudad
                </label>
                <input
                  disabled
                  value={profile.city}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ocupación
                </label>
                <input
                  disabled
                  value={profile.occupation}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código Postal
                </label>
                <input
                  disabled
                  value={profile.postalCode}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-primary rounded-lg p-4 text-white">
          <h4 className="font-semibold mb-2">NOTA:</h4>
          <p className="text-xs opacity-90 mb-4">
            La información personal no es editable por el usuario, contacta con
            soporte para cambiar tu información.
          </p>
          <label className="block text-sm font-medium mb-2">
            Deja tu mensaje:
          </label>
          <textarea
            className="w-full h-28 rounded-md bg-white/20 placeholder-white/70 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Escribe tu mensaje..."
          />
          <button className="mt-3 w-full bg-white text-gray-900 font-medium py-2 rounded-md hover:bg-gray-100 transition-colors">
            CONTACTAR A SOPORTE
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Contraseña
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña actual
              </label>
              <input
                type="password"
                value={password.current}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, current: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={password.next}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, next: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirma Contraseña
              </label>
              <input
                type="password"
                value={password.confirm}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, confirm: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Sugerencias de contraseña
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              Para crear una nueva contraseña, debes cumplir estos requisitos.
            </p>
            <ul className="text-xs text-gray-700 space-y-1 list-disc pl-5">
              <li>Al menos 8 caracteres</li>
              <li>Al menos un caracter especial</li>
              <li>Al menos un número</li>
              <li>No puede ser similar a alguna anterior</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Configuración de Notificaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggle("bankUpdates")}
                className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  notif.bankUpdates ? "bg-green-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    notif.bankUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                Actualizaciones de transacciones bancarias
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggle("appointmentReminders")}
                className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  notif.appointmentReminders ? "bg-green-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    notif.appointmentReminders
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                Recordatorios de citas vía correo electrónico
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Cancelación de cuenta
        </h4>
        <p className="text-xs text-gray-600 mb-3">
          Al pulsar el botón “Solicitar” confirmas el envío de una solicitud de
          baja de tu cuenta profesional.
        </p>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm">
          Solicitar
        </button>
      </div>
    </div>
  );
}
