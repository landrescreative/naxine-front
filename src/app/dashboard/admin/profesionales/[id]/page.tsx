"use client";

import { useRouter, useParams } from "next/navigation";
import {
  ChevronRight,
  X,
  Save,
  Key,
  UserX,
  Lock,
  Mail,
  BookOpen,
  Star,
  Phone,
  MapPin,
  ShoppingCart,
  Eye,
  Edit,
  Filter,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getProfessionalById,
  updateProfessional,
  type AdminProfessional,
} from "@/data/adminProfessionals";
import PasswordResetModal from "@/components/dashboard/PasswordResetModal";
import SaveChangesModal from "@/components/dashboard/SaveChangesModal";
import DeactivateUserModal from "@/components/dashboard/DeactivateUserModal";

export default function AdminProfessionalEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Array.isArray(params?.id)
    ? params?.id[0]
    : (params?.id as string);

  // Get professional data
  const professional = getProfessionalById(userId);

  // Local form state
  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    telefono: "",
    nombreUsuario: "",
    ciudad: "",
    codigoPostal: "",
    especialidad: "",
    numeroLicencia: "",
    experiencia: "",
    biografia: "",
    educacion: "",
    certificaciones: "",
    idiomas: "",
  });

  // Modal states
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [isSaveChangesOpen, setIsSaveChangesOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: {
      cancelada: false,
      completada: false,
      pendiente: false,
    },
    sessionType: {
      primeraSesion: false,
      sesionSeguimiento: false,
      packX3: false,
    },
  });

  // Edit states for each field
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load professional data into form
  useEffect(() => {
    if (professional) {
      setForm({
        nombreCompleto: professional.fullName,
        email: professional.email,
        telefono: professional.phone,
        nombreUsuario: professional.username,
        ciudad: professional.city,
        codigoPostal: professional.postalCode,
        especialidad: professional.specialty,
        numeroLicencia: professional.licenseNumber,
        experiencia: professional.experience.toString(),
        biografia: professional.bio,
        educacion: professional.education.join("\n"),
        certificaciones: professional.certifications.join("\n"),
        idiomas: professional.languages.join(", "),
      });
    }
  }, [professional]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setIsSaveChangesOpen(true);
  };

  const confirmSave = () => {
    if (professional) {
      updateProfessional(professional.id, {
        fullName: form.nombreCompleto,
        email: form.email,
        phone: form.telefono,
        username: form.nombreUsuario,
        city: form.ciudad,
        postalCode: form.codigoPostal,
        specialty: form.especialidad,
        licenseNumber: form.numeroLicencia,
        experience: parseInt(form.experiencia) || 0,
        bio: form.biografia,
        education: form.educacion.split("\n").filter((line) => line.trim()),
        certifications: form.certificaciones
          .split("\n")
          .filter((line) => line.trim()),
        languages: form.idiomas
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang),
      });
    }
    setIsSaveChangesOpen(false);
  };

  const handlePasswordReset = () => {
    setIsPasswordResetOpen(true);
  };

  const handleResendCode = () => {
    console.log("Resending code...");
  };

  const handleDeactivate = () => {
    setIsDeactivateOpen(true);
  };

  const confirmDeactivate = () => {
    if (professional) {
      updateProfessional(professional.id, { status: "inactivo" });
    }
    setIsDeactivateOpen(false);
    router.push("/dashboard/admin/profesionales");
  };

  const handleFilterToggle = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (
    category: "status" | "sessionType",
    filter: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [filter]:
          !prev[category][filter as keyof (typeof prev)[typeof category]],
      },
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: {
        cancelada: false,
        completada: false,
        pendiente: false,
      },
      sessionType: {
        primeraSesion: false,
        sesionSeguimiento: false,
        packX3: false,
      },
    });
  };

  const handleApplyFilters = () => {
    // Filter logic will be implemented here
    setIsFilterOpen(false);
  };

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (field: string) => {
    // Update the form with the new value
    update(field as keyof typeof form, editValue);
    setEditingField(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  if (!professional) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Profesional no encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            El profesional con ID {userId} no existe.
          </p>
          <button
            onClick={() => router.push("/dashboard/admin/profesionales")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Volver a Profesionales
          </button>
        </div>
      </div>
    );
  }

  // Mock transaction data
  const transactions = [
    {
      id: "#302012",
      product: "Primera Sesión",
      total: "$121.00",
      status: "Procesando",
      date: "12 Dec 2023",
      statusColor: "bg-orange-100 text-orange-800",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=32&h=32&fit=crop&crop=center&auto=format&q=80",
    },
    {
      id: "#302011",
      product: "Primera Sesión",
      total: "$590.00",
      status: "Procesando",
      date: "1 Dec 2023",
      statusColor: "bg-orange-100 text-orange-800",
      image:
        "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=32&h=32&fit=crop&crop=center&auto=format&q=80",
    },
    {
      id: "#302006",
      product: "Sesión de Seguimiento",
      total: "$125.00",
      status: "Pendiente",
      date: "10 Nov 2023",
      statusColor: "bg-blue-100 text-blue-800",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=32&h=32&fit=crop&crop=center&auto=format&q=80",
    },
    {
      id: "#302001",
      product: "Primera Sesión",
      total: "$348.00",
      status: "Pendiente",
      date: "2 Nov 2023",
      statusColor: "bg-blue-100 text-blue-800",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=32&h=32&fit=crop&crop=center&auto=format&q=80",
    },
    {
      id: "#301998",
      product: "Primera Sesión",
      total: "$607.00",
      status: "Completada",
      date: "7 Sep 2023",
      statusColor: "bg-green-100 text-green-800",
      image:
        "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=32&h=32&fit=crop&crop=center&auto=format&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Detalles del Profesional
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => router.push("/dashboard/admin/usuarios")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Administración de Usuarios
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => router.push("/dashboard/admin/profesionales")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Profesionales
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Detalles de profesional</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeactivate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
            >
              Desactivar usuario
            </button>
            <button
              onClick={handlePasswordReset}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
            >
              Restablecer Contraseña
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 px-6 py-6">
        <div className="flex gap-6">
          {/* Left Column - Professional Details */}
          <div className="w-1/3 space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {/* Profile Header */}
              <div className="relative overflow-hidden">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                  style={{
                    backgroundImage: "url('/Background.png')",
                  }}
                ></div>

                {/* Content */}
                <div className="relative z-10 p-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-black mb-1">
                        Linda Blair
                      </h2>
                      <p className="text-gray-600 text-sm">@linda_blair321</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-4">
                {/* User ID */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Lock className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Número de Usuario
                    </span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "numeroUsuario" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("numeroUsuario")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">ID-011221</span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField("numeroUsuario", "ID-011221")
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Mail className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Correo Electrónico
                    </span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "email" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="email"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("email")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          lindablair@mail.com
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField("email", "lindablair@mail.com")
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Biografía</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "biografia" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1 min-h-[60px] resize-none"
                          autoFocus
                        />
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleSaveEdit("biografia")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          Lic. en Nutriología con experienci....
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField(
                              "biografia",
                              "Lic. en Nutriología con experienci...."
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Especialidad</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "especialidad" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("especialidad")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">Nutriologa</span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField("especialidad", "Nutriologa")
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Rating</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "rating" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("rating")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">4.7</span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() => handleEditField("rating", "4.7")}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Phone className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Número de Teléfono
                    </span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "telefono" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="tel"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("telefono")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          050 414 8778
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField("telefono", "050 414 8778")
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Dirección</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "direccion" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1 min-h-[60px] resize-none"
                          autoFocus
                        />
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleSaveEdit("direccion")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          1833 Bel Meadow Drive, Fontana, California 92335, USA
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField(
                              "direccion",
                              "1833 Bel Meadow Drive, Fontana, California 92335, USA"
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Packages */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Número de paquetes
                    </span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "paquetes" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("paquetes")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">3</span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() => handleEditField("paquetes", "3")}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Certificaciones
                    </span>
                  </div>
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">
                          Certificado 01
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">
                          Certificado 02
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">
                          Certificado 03
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary and Transactions */}
          <div className="w-2/3 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">$723.00</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Ordenes Totales</p>
                  <p className="text-2xl font-bold text-gray-900">1,296</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Tipo de Sesiones</p>
                  <p className="text-sm font-medium text-gray-900">
                    En línea + Presencial + A domicilio
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Historial de transacciones
                </h3>
                <button
                  onClick={handleFilterToggle}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </button>
              </div>

              {/* Transaction Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        # ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Producto
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                        Total
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                        Estado
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                          {transaction.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              <img
                                src={transaction.image}
                                alt="Product"
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                            <span className="text-sm text-gray-900">
                              {transaction.product}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                          {transaction.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.statusColor}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 text-right">
                          {transaction.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">Mostrando 5 de 258</p>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium">
                    1
                  </button>
                  <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                    3
                  </button>
                  <span className="px-2 text-sm text-gray-500">...</span>
                  <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetFilters}
                  className="text-gray-500 hover:text-gray-700 underline text-sm"
                >
                  Reiniciar
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-6">
              {/* Estado Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Estado</h3>
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.cancelada}
                      onChange={() => handleFilterChange("status", "cancelada")}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Cancelada</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.completada}
                      onChange={() =>
                        handleFilterChange("status", "completada")
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Completada</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.pendiente}
                      onChange={() => handleFilterChange("status", "pendiente")}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Pendiente</span>
                  </label>
                </div>
              </div>

              {/* Tipo de Sesión Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Tipo de Sesión
                  </h3>
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-3 max-h-32 overflow-y-auto">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sessionType.primeraSesion}
                      onChange={() =>
                        handleFilterChange("sessionType", "primeraSesion")
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Primera Sesión
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sessionType.sesionSeguimiento}
                      onChange={() =>
                        handleFilterChange("sessionType", "sesionSeguimiento")
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Sesión de Seguimiento
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sessionType.packX3}
                      onChange={() =>
                        handleFilterChange("sessionType", "packX3")
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Pack x3</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90"
              >
                Aplicar Filtro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PasswordResetModal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
        onResend={handleResendCode}
        userEmail={professional?.email || ""}
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
        userName={professional?.name || ""}
      />
    </div>
  );
}
