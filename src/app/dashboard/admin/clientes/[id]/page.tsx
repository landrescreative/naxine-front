"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronRight, X, Plus, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { type AdminClient } from "@/data/adminClients";
import { usersService } from "@/services/api/users";
import { lazyLoad } from "@/lib/lazy-loading";
import { Suspense } from "react";

// Lazy load de modales pesados - solo se cargan cuando se necesitan
const PasswordResetModal = lazyLoad(() => import("@/components/dashboard/PasswordResetModal"));
const SaveChangesModal = lazyLoad(() => import("@/components/dashboard/SaveChangesModal"));
const DeactivateUserModal = lazyLoad(() => import("@/components/dashboard/DeactivateUserModal"));

export default function AdminClienteEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Array.isArray(params?.id)
    ? params?.id[0]
    : (params?.id as string);

  const [client, setClient] = useState<AdminClient | null>(null);
  const [clientIdCliente, setClientIdCliente] = useState<string | null>(null); // Guardar id_cliente original
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Función para mapear los datos del backend al formato AdminClient
  const mapBackendClientToAdminClient = (backendClient: any): AdminClient => {
    return {
      id: String(
        backendClient.id_usuario ||
          backendClient.id_cliente ||
          backendClient.id ||
          ""
      ),
      name:
        backendClient.nombre_completo ||
        backendClient.nombre_usuario ||
        backendClient.nombre ||
        backendClient.name ||
        "",
      fullName:
        backendClient.nombre_completo ||
        backendClient.nombre_usuario ||
        backendClient.nombre ||
        backendClient.name ||
        "",
      email: backendClient.email || backendClient.email_usuario || "",
      phone: backendClient.telefono || backendClient.phone || "",
      customerNumber: String(
        backendClient.id_cliente ||
          backendClient.id_usuario ||
          backendClient.id ||
          ""
      ).padStart(8, "0"),
      incomeUsd: backendClient.ingreso || backendClient.incomeUsd || 0,
      status:
        backendClient.is_verified === 1 || backendClient.is_verified === true
          ? "Activo"
          : "Inactivo",
      username:
        (backendClient.email || backendClient.email_usuario || "")?.split(
          "@"
        )[0] || "",
      city: backendClient.direccion || backendClient.ciudad || backendClient.city || "",
      postalCode: backendClient.codigo_postal || backendClient.postalCode || "",
      createdAt:
        backendClient.created_at ||
        backendClient.createdAt ||
        new Date().toISOString(),
      lastLogin:
        backendClient.ultimo_acceso ||
        backendClient.lastLogin ||
        new Date().toISOString(),
      totalSessions:
        backendClient.total_sesiones || backendClient.totalSessions || 0,
      totalSpent: backendClient.total_gastado || backendClient.totalSpent || 0,
    };
  };

  // Función para cargar cliente desde la API (extraída para poder reutilizarla)
  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todos los clientes y buscar el que coincida con el ID
      const response = await usersService.getAdminClients();
      
      if (response.success && response.data) {
        let clientsData: any[] = [];
        
        if (Array.isArray(response.data)) {
          clientsData = response.data;
        } else if (
          response.data.data &&
          response.data.data.clientes &&
          Array.isArray(response.data.data.clientes)
        ) {
          clientsData = response.data.data.clientes;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          clientsData = response.data.data;
        } else if (
          response.data.clientes &&
          Array.isArray(response.data.clientes)
        ) {
          clientsData = response.data.clientes;
        }
        
        // Buscar el cliente por id_usuario o id_cliente
        const foundClient = clientsData.find(
          (c) =>
            String(c.id_usuario) === userId ||
            String(c.id_cliente) === userId ||
            String(c.id) === userId
        );
        
        if (foundClient) {
          const mappedClient = mapBackendClientToAdminClient(foundClient);
          setClient(mappedClient);
          // Guardar el id_cliente original para usar en la actualización
          setClientIdCliente(String(foundClient.id_cliente || foundClient.id || userId));
        } else {
          setError(`Cliente con ID ${userId} no encontrado`);
        }
      } else {
        setError(response.error || "Error al cargar el cliente");
      }
    } catch (err) {
      setError("Ocurrió un error al cargar el cliente");
      console.error("Error al cargar cliente:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Cargar cliente desde la API al montar el componente
  useEffect(() => {
    if (userId) {
      fetchClient();
    }
  }, [userId, fetchClient]);

  // Local form state
  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    telefono: "",
    nombreUsuario: "",
    direccion: "",
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
        direccion: client.city, // client.city ahora contiene direccion del backend
        codigoPostal: client.postalCode,
      });
    }
  }, [client]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setIsSaveChangesOpen(true);
  };

  const confirmSave = async () => {
    if (!client) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Preparar los datos para enviar al backend
      const updateData: {
        nombre_completo?: string;
        telefono?: string;
        email?: string;
        fecha_nacimiento?: string;
        historial_medico?: string;
        direccion?: string;
        codigo_postal?: string;
      } = {};

      // Incluir todos los campos modificables que tienen valor
      if (form.nombreCompleto && form.nombreCompleto.trim()) {
        updateData.nombre_completo = form.nombreCompleto.trim();
      }
      if (form.email && form.email.trim()) {
        updateData.email = form.email.trim();
      }
      // El teléfono puede ser null, así que siempre lo incluimos si está presente
      if (form.telefono !== undefined) {
        updateData.telefono = form.telefono.trim() || null;
      }
      // Dirección
      if (form.direccion !== undefined) {
        updateData.direccion = form.direccion.trim() || null;
      }
      // Código postal
      if (form.codigoPostal !== undefined) {
        updateData.codigo_postal = form.codigoPostal.trim() || null;
      }

      // Usar el id_cliente guardado, o intentar extraerlo del customerNumber
      const clientId = clientIdCliente || client.customerNumber.replace(/^0+/, '') || client.id;

      console.log('[AdminClienteEditPage] Actualizando cliente con ID:', clientId);
      console.log('[AdminClienteEditPage] clientIdCliente:', clientIdCliente);
      console.log('[AdminClienteEditPage] client.customerNumber:', client.customerNumber);
      console.log('[AdminClienteEditPage] Datos a actualizar:', JSON.stringify(updateData, null, 2));

      const response = await usersService.updateAdminClient(clientId, updateData);
      
      console.log('[AdminClienteEditPage] Respuesta del servidor:', response);

      if (response.success) {
        setIsSaveChangesOpen(false);
        setSaveSuccess(true);
        setSaving(false);
        // Recargar los datos del cliente para mostrar los cambios
        await fetchClient();
        // Ocultar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setSaveError(response.error || "Error al actualizar el cliente");
        console.error("Error al actualizar cliente:", response);
        setSaving(false);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al actualizar el cliente. Por favor, intenta de nuevo.";
      setSaveError(errorMessage);
      console.error("Error al guardar cambios:", err);
      setSaving(false);
    }
  };

  const handlePasswordReset = () => {
    setIsPasswordResetOpen(true);
    setPasswordResetError(null);
  };

  const handleResendCode = () => {
    // No se usa en este contexto, pero se mantiene para compatibilidad
    console.log("Resending password reset code to:", client?.email);
  };

  const confirmPasswordReset = async (password: string) => {
    if (!client) return;

    setResettingPassword(true);
    setPasswordResetError(null);

    try {
      // Usar id_usuario para el endpoint de restablecer contraseña
      const response = await usersService.resetUserPassword(client.id, password);

      if (response.success) {
        setIsPasswordResetOpen(false);
        // Opcional: mostrar mensaje de éxito
        router.push("/dashboard/admin/clientes");
      } else {
        setPasswordResetError(response.error || "Error al restablecer la contraseña");
        console.error("Error al restablecer contraseña:", response);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al restablecer la contraseña. Por favor, intenta de nuevo.";
      setPasswordResetError(errorMessage);
      console.error("Error al restablecer contraseña:", err);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDeactivate = () => {
    setIsDeactivateOpen(true);
    setStatusError(null);
  };

  const confirmDeactivate = async () => {
    if (!client) return;

    setChangingStatus(true);
    setStatusError(null);

    try {
      // Usar id_usuario para el endpoint de estado
      // Desactivar usuario (is_active: false)
      const response = await usersService.updateUserStatus(client.id, false);

      if (response.success) {
        setIsDeactivateOpen(false);
        router.push("/dashboard/admin/clientes");
      } else {
        setStatusError(response.error || "Error al desactivar el usuario");
        console.error("Error al desactivar usuario:", response);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al desactivar el usuario. Por favor, intenta de nuevo.";
      setStatusError(errorMessage);
      console.error("Error al desactivar usuario:", err);
    } finally {
      setChangingStatus(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando cliente...</div>
        </div>
      </div>
    );
  }

  // Show error or not found if client doesn't exist
  if (error || !client) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Cliente no encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            {error || `El cliente con ID ${userId} no existe.`}
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
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Dirección</label>
              <input
                value={form.direccion}
                onChange={(e) => update("direccion", e.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
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

      {/* Modals - Lazy loaded */}
      {isPasswordResetOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          }
        >
          <PasswordResetModal
            isOpen={isPasswordResetOpen}
            onClose={() => {
              setIsPasswordResetOpen(false);
              setPasswordResetError(null);
            }}
            onConfirm={confirmPasswordReset}
            userEmail={client?.email || ""}
            loading={resettingPassword}
            error={passwordResetError}
          />
        </Suspense>
      )}

      {isSaveChangesOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          }
        >
          <SaveChangesModal
            isOpen={isSaveChangesOpen}
            onClose={() => {
              setIsSaveChangesOpen(false);
              setSaveError(null);
              setSaveSuccess(false);
            }}
            onConfirm={confirmSave}
            isLoading={saving}
          />
        </Suspense>
      )}

      {/* Success message */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[280px]">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Cambios guardados exitosamente</p>
              <p className="text-xs text-green-100">Los datos se han actualizado correctamente</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {saveError}
        </div>
      )}

      {isDeactivateOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          }
        >
          <DeactivateUserModal
            isOpen={isDeactivateOpen}
            onClose={() => {
              setIsDeactivateOpen(false);
              setStatusError(null);
            }}
            onConfirm={confirmDeactivate}
            userName={client?.name || ""}
            loading={changingStatus}
            error={statusError}
          />
        </Suspense>
      )}
    </div>
  );
}
