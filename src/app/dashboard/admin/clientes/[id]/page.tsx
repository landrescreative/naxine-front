"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronRight, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getClientById,
  updateClient,
  type AdminClient,
} from "@/data/adminClients";
import PasswordResetModal from "@/components/dashboard/PasswordResetModal";
import SaveChangesModal from "@/components/dashboard/SaveChangesModal";
import DeactivateUserModal from "@/components/dashboard/DeactivateUserModal";

export default function AdminClienteEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Array.isArray(params?.id)
    ? params?.id[0]
    : (params?.id as string);

  // Get client data
  const client = getClientById(userId);

  // Local form state
  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    telefono: "",
    nombreUsuario: "",
    ciudad: "",
    codigoPostal: "",
  });

  // Modal states
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [isSaveChangesOpen, setIsSaveChangesOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Load client data into form
  useEffect(() => {
    if (client) {
      setForm({
        nombreCompleto: client.fullName,
        email: client.email,
        telefono: client.phone,
        nombreUsuario: client.username,
        ciudad: client.city,
        codigoPostal: client.postalCode,
      });
    }
  }, [client]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setIsSaveChangesOpen(true);
  };

  const confirmSave = () => {
    if (client) {
      updateClient(client.id, {
        fullName: form.nombreCompleto,
        email: form.email,
        phone: form.telefono,
        username: form.nombreUsuario,
        city: form.ciudad,
        postalCode: form.codigoPostal,
      });
      setIsSaveChangesOpen(false);
      router.push("/dashboard/admin/clientes");
    }
  };

  const handlePasswordReset = () => {
    setIsPasswordResetOpen(true);
  };

  const handleResendCode = () => {
    // In real app, trigger resend email API call
    console.log("Resending password reset code to:", client?.email);
  };

  const handleDeactivate = () => {
    setIsDeactivateOpen(true);
  };

  const confirmDeactivate = () => {
    if (client) {
      updateClient(client.id, { status: "Inactivo" });
      setIsDeactivateOpen(false);
      router.push("/dashboard/admin/clientes");
    }
  };

  // Show loading or not found if client doesn't exist
  if (!client) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Cliente no encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            El cliente con ID {userId} no existe.
          </p>
          <button
            onClick={() => router.push("/dashboard/admin/clientes")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Volver a Clientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Editar Perfil
          </h1>
          <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
            <span className="text-gray-600">Administración de usuarios</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-600">Clientes</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">
              Editar {client?.name || userId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            style={{ color: "white" }}
          >
            <Plus className="h-4 w-4" />
            Confirmar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información General
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                value={form.nombreCompleto}
                onChange={(e) => update("nombreCompleto", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                value={form.telefono}
                onChange={(e) => update("telefono", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Nombre de Usuario
              </label>
              <input
                value={form.nombreUsuario}
                onChange={(e) => update("nombreUsuario", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Ciudad</label>
              <input
                value={form.ciudad}
                onChange={(e) => update("ciudad", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Código Postal
              </label>
              <input
                value={form.codigoPostal}
                onChange={(e) => update("codigoPostal", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 h-fit">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Acciones
          </h3>
          <div className="space-y-3">
            <button
              onClick={handlePasswordReset}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              style={{ color: "white" }}
            >
              Restablecer Contraseña
            </button>
            <button
              onClick={handleDeactivate}
              className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Desactivar Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PasswordResetModal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
        onResend={handleResendCode}
        userEmail={client?.email || ""}
      />

      <SaveChangesModal
        isOpen={isSaveChangesOpen}
        onClose={() => setIsSaveChangesOpen(false)}
        onConfirm={confirmSave}
      />

      <DeactivateUserModal
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={confirmDeactivate}
        userName={client?.name || ""}
      />
    </div>
  );
}
