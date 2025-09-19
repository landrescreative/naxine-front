"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  CheckCircle,
} from "lucide-react";

export default function AdminSoportePage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Mock data for support tickets
  const [supportTickets, setSupportTickets] = useState([
    {
      id: 1,
      professional: "Dr. Ernesto Almeida",
      title: "Nutriologo",
      message: "No puedo acceder a mi perfil profesional..",
      fullMessage:
        "Hola, tengo un problema con el acceso a mi perfil profesional. Cuando intento iniciar sesión, me aparece un error y no puedo ver mis citas pendientes. Necesito ayuda urgente porque tengo pacientes esperando.",
      client: "Juan Perez",
      phone: "+32 55 1049 2408",
      email: "juanperez@gmail.com",
      date: "2025-10-12",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 2,
      professional: "Dr. María González",
      title: "Psicóloga",
      message: "Problema con el sistema de pagos..",
      fullMessage:
        "Buenos días, he tenido problemas con el sistema de pagos. Los pagos de mis clientes no se están reflejando en mi cuenta y ya han pasado varios días. ¿Podrían revisar esto?",
      client: "Ana Martínez",
      phone: "+32 55 1234 5678",
      email: "anamartinez@gmail.com",
      date: "2025-10-11",
      status: "Resuelto",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 3,
      professional: "Dr. Carlos López",
      title: "Fisioterapeuta",
      message: "No recibo notificaciones de citas..",
      fullMessage:
        "Estimados, no estoy recibiendo las notificaciones de las citas programadas. Esto me está causando problemas porque no sé cuándo tengo pacientes. ¿Hay alguna configuración que deba cambiar?",
      client: "Pedro Silva",
      phone: "+32 55 9876 5432",
      email: "pedrosilva@gmail.com",
      date: "2025-10-10",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 4,
      professional: "Dr. Laura Fernández",
      title: "Cardióloga",
      message: "Error al subir documentos..",
      fullMessage:
        "Tengo problemas para subir los certificados médicos de mis pacientes. El sistema me dice que el archivo es muy grande, pero es un PDF normal. ¿Cuál es el límite de tamaño?",
      client: "Carmen Ruiz",
      phone: "+32 55 2468 1357",
      email: "carmenruiz@gmail.com",
      date: "2025-10-09",
      status: "Resuelto",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 5,
      professional: "Dr. Miguel Torres",
      title: "Dermatólogo",
      message: "No puedo cancelar una cita..",
      fullMessage:
        "Necesito cancelar una cita de emergencia pero no encuentro la opción en la plataforma. El paciente canceló y necesito liberar el horario para otro paciente urgente.",
      client: "Roberto Vega",
      phone: "+32 55 3691 2580",
      email: "robertovega@gmail.com",
      date: "2025-10-08",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 6,
      professional: "Dr. Patricia Herrera",
      title: "Ginecóloga",
      message: "Problema con la videollamada..",
      fullMessage:
        "Las videollamadas se cortan constantemente durante las consultas. Esto es muy frustrante tanto para mí como para mis pacientes. ¿Hay alguna solución?",
      client: "Isabel Morales",
      phone: "+32 55 7410 8520",
      email: "isabelmorales@gmail.com",
      date: "2025-10-07",
      status: "Resuelto",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 7,
      professional: "Dr. Javier Ramos",
      title: "Pediatra",
      message: "No puedo ver el historial de pacientes..",
      fullMessage:
        "El historial médico de mis pacientes no se está cargando correctamente. Solo veo información parcial y esto es crítico para dar un buen diagnóstico.",
      client: "Sofia Castro",
      phone: "+32 55 8520 7410",
      email: "sofiacastro@gmail.com",
      date: "2025-10-06",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 8,
      professional: "Dr. Elena Vargas",
      title: "Oftalmóloga",
      message: "Error en la facturación..",
      fullMessage:
        "Las facturas que estoy generando tienen precios incorrectos. Los montos no coinciden con los que acordé con mis pacientes. Esto es muy serio.",
      client: "Diego Herrera",
      phone: "+32 55 9630 1470",
      email: "diegoherrera@gmail.com",
      date: "2025-10-05",
      status: "Resuelto",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 9,
      professional: "Dr. Fernando Jiménez",
      title: "Neurólogo",
      message: "No puedo programar citas..",
      fullMessage:
        "El calendario no me permite programar citas para la próxima semana. Me dice que no hay horarios disponibles, pero mi agenda está libre.",
      client: "Valentina López",
      phone: "+32 55 1470 9630",
      email: "valentinalopez@gmail.com",
      date: "2025-10-04",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 10,
      professional: "Dr. Gabriela Santos",
      title: "Endocrinóloga",
      message: "Problema con los recordatorios..",
      fullMessage:
        "Los recordatorios automáticos no se están enviando a mis pacientes. Varios han llegado sin cita porque no recibieron la confirmación.",
      client: "Andrés Moreno",
      phone: "+32 55 2580 3691",
      email: "andresmoreno@gmail.com",
      date: "2025-10-03",
      status: "Resuelto",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 11,
      professional: "Dr. Ricardo Peña",
      title: "Urología",
      message: "Error al actualizar perfil..",
      fullMessage:
        "Estoy intentando actualizar mi información profesional pero los cambios no se guardan. He intentado varias veces y siempre vuelve a la información anterior.",
      client: "Natalia Díaz",
      phone: "+32 55 3691 2580",
      email: "nataliadiaz@gmail.com",
      date: "2025-10-02",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 12,
      professional: "Dr. Claudia Rojas",
      title: "Reumatóloga",
      message: "Problema con la app móvil..",
      fullMessage:
        "La aplicación móvil se cierra inesperadamente cuando estoy en una consulta. Esto es muy molesto y me hace perder tiempo valioso con mis pacientes.",
      client: "Hugo Mendoza",
      phone: "+32 55 4701 8520",
      email: "hugomendoza@gmail.com",
      date: "2025-10-01",
      status: "Resuelto",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 13,
      professional: "Dr. Alejandro Cruz",
      title: "Gastroenterólogo",
      message: "No puedo descargar reportes..",
      fullMessage:
        "Necesito descargar el reporte mensual de mis consultas pero el botón no funciona. He probado en diferentes navegadores y el problema persiste.",
      client: "María Elena",
      phone: "+32 55 5810 9630",
      email: "mariaelena@gmail.com",
      date: "2025-09-30",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 14,
      professional: "Dr. Beatriz Ortega",
      title: "Neumóloga",
      message: "Problema con la sincronización..",
      fullMessage:
        "Los datos de mis pacientes no se sincronizan correctamente entre la web y la app móvil. Veo información diferente en cada plataforma.",
      client: "Carlos Alberto",
      phone: "+32 55 6920 1470",
      email: "carlosalberto@gmail.com",
      date: "2025-09-29",
      status: "Resuelto",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 15,
      professional: "Dr. Manuel Delgado",
      title: "Hematólogo",
      message: "Error en la configuración de horarios..",
      fullMessage:
        "Configuré mis horarios de atención pero el sistema no los está respetando. Me están asignando citas fuera de mi horario laboral.",
      client: "Patricia Solís",
      phone: "+32 55 7030 2580",
      email: "patriciasolis@gmail.com",
      date: "2025-09-28",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
  ]);

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === supportTickets.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(supportTickets.map((ticket) => ticket.id));
    }
  };

  const handleViewTicket = (id: number) => {
    const ticket = supportTickets.find((t) => t.id === id);
    if (ticket) {
      setSelectedTicket(ticket);
      setIsTicketModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleSendEmail = () => {
    console.log("Sending email to:", selectedTicket?.professional);
    // Add email functionality here
  };

  const handleMarkResolved = () => {
    if (selectedTicket) {
      setSupportTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === selectedTicket.id
            ? {
                ...ticket,
                status: "Resuelto",
                statusColor: "bg-green-100 text-green-800",
              }
            : ticket
        )
      );
      console.log("Marking ticket as resolved:", selectedTicket.id);
    }
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tickets de Soporte
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-primary font-medium">
            Administración de Soporte
          </span>
          <span className="text-gray-400">{">"}</span>
          <span className="text-gray-500">Tickets de Soporte</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === supportTickets.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Profesional
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Mensaje
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Fecha
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Estado
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {supportTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(ticket.id)}
                        onChange={() => handleSelectRow(ticket.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.professional}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.title}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {ticket.message}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{ticket.date}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ticket.statusColor}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewTicket(ticket.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">Mostrando 15 de 204</div>
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
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                4
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                5
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                ...
              </button>
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {isTicketModalOpen && selectedTicket && (
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Ticket de soporte
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Client Information */}
                <div className="flex items-start justify-between mb-6">
                  {/* Client Info */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedTicket.client}
                      </h3>
                      <p className="text-sm text-gray-500">Cliente</p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium">
                      Teléfono: {selectedTicket.phone}
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      Correo: {selectedTicket.email}
                    </p>
                  </div>
                </div>

                {/* Message Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">
                    Mensaje
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedTicket.fullMessage}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={handleSendEmail}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Enviar correo electrónico
                  </button>
                  <button
                    onClick={handleMarkResolved}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Marcar como resuelto
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
