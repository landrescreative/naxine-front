"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ShoppingCart,
  Users,
  Folder,
  Download,
  Upload,
  TrendingUp,
  X,
  ImageIcon,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPagosPage() {
  const [selectedTimeFilter, setSelectedTimeFilter] =
    useState("Todo el tiempo");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: number]: { name: string; url: string };
  }>({});
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  const timeFilters = [
    "Todo el tiempo",
    "12 meses",
    "30 días",
    "7 días",
    "24 horas",
  ];

  // Chart data
  const chartData = {
    labels: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    datasets: [
      {
        label: "Ingresos",
        data: [
          800, 950, 1100, 1200, 1000, 1150, 1300, 1250, 1400, 1350, 1500, 1600,
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Ingresos Netos",
        data: [
          600, 750, 900, 1000, 800, 950, 1100, 1050, 1200, 1150, 1300, 1400,
        ],
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1600,
        ticks: {
          callback: function (value) {
            return "$" + value + "k";
          },
        },
      },
    },
  };

  // File upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log("File dropped:", e.dataTransfer.files[0].name);
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log("File selected:", e.target.files[0].name);
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    console.log("handleUpload called - selectedFile:", selectedFile);
    console.log("handleUpload called - currentSessionId:", currentSessionId);

    if (selectedFile && currentSessionId) {
      // Simulate file upload by creating a URL
      const fileUrl = URL.createObjectURL(selectedFile);

      // Update the uploaded files state
      setUploadedFiles((prev) => ({
        ...prev,
        [currentSessionId]: {
          name: selectedFile.name,
          url: fileUrl,
        },
      }));

      console.log(
        "Uploading file:",
        selectedFile.name,
        "for session:",
        currentSessionId
      );
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setCurrentSessionId(null);
    } else {
      console.log("Upload failed - missing selectedFile or currentSessionId");
    }
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setCurrentSessionId(null);
  };

  const handleViewFile = (sessionId: number) => {
    const file = uploadedFiles[sessionId];
    if (file) {
      setViewingFile(file);
      setIsViewModalOpen(true);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingFile(null);
  };

  const handleOpenUploadModal = (sessionId: number) => {
    setCurrentSessionId(sessionId);
    setIsUploadModalOpen(true);
  };

  // Mock data for recent sessions
  const recentSessions = [
    {
      id: 1,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionId: "00000001",
      price: "$150 USD",
      commission: "$15 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 2,
      session: "Primera Sesión",
      specialty: "Psicología",
      date: "04-12-2025",
      time: "14:30 AM",
      sessionId: "00000002",
      price: "$120 USD",
      commission: "$12 USD",
      professional: "Dr. María González",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 3,
      session: "Primera Sesión",
      specialty: "Fisioterapia",
      date: "03-12-2025",
      time: "16:00 AM",
      sessionId: "00000003",
      price: "$100 USD",
      commission: "$10 USD",
      professional: "Dr. Carlos López",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 4,
      session: "Primera Sesión",
      specialty: "Medicina General",
      date: "02-12-2025",
      time: "10:00 AM",
      sessionId: "00000004",
      price: "$200 USD",
      commission: "$20 USD",
      professional: "Dr. Ana Martínez",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 5,
      session: "Primera Sesión",
      specialty: "Dermatología",
      date: "01-12-2025",
      time: "11:30 AM",
      sessionId: "00000005",
      price: "$180 USD",
      commission: "$18 USD",
      professional: "Dr. Roberto Silva",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 6,
      session: "Primera Sesión",
      specialty: "Cardiología",
      date: "30-11-2025",
      time: "09:00 AM",
      sessionId: "00000006",
      price: "$250 USD",
      commission: "$25 USD",
      professional: "Dr. Laura Fernández",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 7,
      session: "Primera Sesión",
      specialty: "Oftalmología",
      date: "29-11-2025",
      time: "13:15 AM",
      sessionId: "00000007",
      price: "$160 USD",
      commission: "$16 USD",
      professional: "Dr. Miguel Torres",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 8,
      session: "Primera Sesión",
      specialty: "Pediatría",
      date: "28-11-2025",
      time: "14:45 AM",
      sessionId: "00000008",
      price: "$130 USD",
      commission: "$13 USD",
      professional: "Dr. Carmen Ruiz",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 9,
      session: "Primera Sesión",
      specialty: "Ginecología",
      date: "27-11-2025",
      time: "12:00 AM",
      sessionId: "00000009",
      price: "$170 USD",
      commission: "$17 USD",
      professional: "Dr. Patricia Vega",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 10,
      session: "Primera Sesión",
      specialty: "Neurología",
      date: "26-11-2025",
      time: "15:30 AM",
      sessionId: "00000010",
      price: "$220 USD",
      commission: "$22 USD",
      professional: "Dr. Javier Morales",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel De Pagos
        </h1>
        <div className="flex items-center gap-2 text-sm mb-6">
          <span className="text-primary font-medium">
            Administración de Pagos
          </span>
          <span className="text-gray-400">{">"}</span>
          <span className="text-gray-500">Dashboard de Pagos</span>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-2">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Balance General */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Balance General
              </p>
              <p className="text-2xl font-bold text-gray-900">$75,500</p>
            </div>
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Ventas (Sesiones) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Ventas (Sesiones)
              </p>
              <p className="text-2xl font-bold text-gray-900">31,500</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Profesionales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Profesionales
              </p>
              <p className="text-2xl font-bold text-gray-900">32</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Folder className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Ingresos Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Estadísticas Ingresos
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Ingresos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Ingresos Netos</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Sesiones Recientes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sesiones Recientes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-48">
                  Sesión / Especialidad
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-32">
                  Fecha y Hora
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-24">
                  ID Sesión
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-20">
                  Precio
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-20">
                  Comision
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-40">
                  Profesional
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-24">
                  Estado
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-32">
                  Acción
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-32">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {session.session}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.specialty}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-sm text-gray-900">
                        {session.date}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.time}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      {session.sessionId}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {session.price}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {session.commission}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-primary">
                      {session.professional}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.statusColor}`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">
                      Descargar Factura
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    {uploadedFiles[session.id] ? (
                      <button
                        onClick={() => handleViewFile(session.id)}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        Ver Factura
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenUploadModal(session.id)}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        Subir Factura
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Invoice Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Factura de Nexine
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Sube la factura de Nexine para hacerla visible en el panel
                      de profesional.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Upload Area */}
              <div className="p-6">
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Instructions */}
                  <p className="text-gray-600 mb-4">
                    Arrastra una imagen/PDF, o haz click para agregar uno.
                  </p>

                  {/* Selected File */}
                  {selectedFile && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900 font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Outside the drag area */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      selectedFile
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {selectedFile
                      ? "Confirmar Subida"
                      : "Selecciona un archivo"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View File Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Visualizar Factura
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingFile.name}
                  </p>
                </div>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* File Content */}
              <div className="p-6 max-h-[70vh] overflow-auto">
                {viewingFile.name.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={viewingFile.url}
                    className="w-full h-96 border border-gray-200 rounded-lg"
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="flex justify-center">
                    <img
                      src={viewingFile.url}
                      alt={viewingFile.name}
                      className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <a
                  href={viewingFile.url}
                  download={viewingFile.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Descargar
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
