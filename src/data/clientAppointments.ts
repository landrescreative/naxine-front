// Datos centralizados para las citas del cliente
// En el futuro, estos datos vendrán de una API

// ====== INTERFACES ======

// Interfaz principal para las citas (fuente única de datos)
export interface ClientAppointment {
  id: string;
  orderNumber: string;
  dateTime: Date; // Fecha y hora completa
  status: "confirmed" | "pending" | "cancelled" | "completed";
  product: {
    name: string;
    price: number;
    description: string;
    category: string;
  };
  professional: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
  };
  payment: {
    method: string;
    cardNumber: string;
    expiryDate: string;
    cardholderName: string;
    subtotal: number;
    taxes: number;
    total: number;
  };
  modality: string;
}

// Interfaces para las diferentes vistas (generadas a partir de ClientAppointment)
export interface UpcomingSession {
  id: string;
  time: string;
  professional: string;
  specialty: string;
  description: string;
  isToday: boolean;
}

export interface CalendarAppointment {
  id: string;
  date: number;
  professional: string;
  specialty: string;
  time: string;
}

export interface PendingSession {
  id: string;
  professional: {
    name: string;
    avatar?: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed";
  date: string;
  time: string;
  category: string;
  modality: string;
  product: string;
}

// ====== DATOS CENTRALIZADOS ======
// Esta sería la respuesta de la API - una sola fuente de verdad

export const clientAppointments: ClientAppointment[] = [
  {
    id: "1",
    orderNumber: "#10421",
    dateTime: new Date(2025, 8, 15, 20, 0), // Hoy 15 Septiembre 2025, 8:00 PM (futuro)
    status: "confirmed",
    product: {
      name: "Primera Sesión",
      price: 100,
      description: "Dieta para diabetes",
      category: "Nutriología",
    },
    professional: {
      name: "Dr. Pramod Mehta",
      email: "drpramodmehta@gmail.com",
      phone: "+52 55 31 953 893",
      specialty: "Nutriología",
    },
    payment: {
      method: "Mastercard",
      cardNumber: "Master 1234 **** 58745",
      expiryDate: "12/23",
      cardholderName: "Juan Perez",
      subtotal: 100,
      taxes: 20,
      total: 120,
    },
    modality: "En línea",
  },
  {
    id: "2",
    orderNumber: "#10422",
    dateTime: new Date(2025, 8, 16, 9, 0), // Mañana 16 Septiembre 2025, 9:00 AM
    status: "confirmed",
    product: {
      name: "Primera Sesión",
      price: 100,
      description: "Fisioterapia de rehabilitación",
      category: "Fisioterapia",
    },
    professional: {
      name: "Amanda Bryan",
      email: "amanda.bryan@gmail.com",
      phone: "+52 55 31 953 894",
      specialty: "Fisioterapia",
    },
    payment: {
      method: "Mastercard",
      cardNumber: "Master 1234 **** 58745",
      expiryDate: "12/23",
      cardholderName: "Juan Perez",
      subtotal: 100,
      taxes: 20,
      total: 120,
    },
    modality: "En línea",
  },
  {
    id: "3",
    orderNumber: "#10423",
    dateTime: new Date(2025, 8, 17, 14, 30), // 17 Septiembre 2025, 2:30 PM
    status: "confirmed",
    product: {
      name: "Primera Sesión",
      price: 100,
      description: "Asesoría legal",
      category: "Derecho",
    },
    professional: {
      name: "Janie Wells",
      email: "janie.wells@gmail.com",
      phone: "+52 55 31 953 895",
      specialty: "Derecho",
    },
    payment: {
      method: "Mastercard",
      cardNumber: "Master 1234 **** 58745",
      expiryDate: "12/23",
      cardholderName: "Juan Perez",
      subtotal: 100,
      taxes: 20,
      total: 120,
    },
    modality: "En línea",
  },
  {
    id: "4",
    orderNumber: "#10424",
    dateTime: new Date(2025, 8, 18, 16, 0), // 18 Septiembre 2025, 4:00 PM
    status: "pending",
    product: {
      name: "Consulta de Seguimiento",
      price: 80,
      description: "Seguimiento nutricional",
      category: "Nutriología",
    },
    professional: {
      name: "Dr. Pramod Mehta",
      email: "drpramodmehta@gmail.com",
      phone: "+52 55 31 953 893",
      specialty: "Nutriología",
    },
    payment: {
      method: "Mastercard",
      cardNumber: "Master 1234 **** 58745",
      expiryDate: "12/23",
      cardholderName: "Juan Perez",
      subtotal: 80,
      taxes: 16,
      total: 96,
    },
    modality: "En línea",
  },
];

// ====== FUNCIONES PARA GENERAR VISTAS ======
// Estas funciones transforman los datos centralizados en las diferentes vistas

// Función para obtener todas las citas (simulando llamada a API)
export const getAllAppointments = (): ClientAppointment[] => {
  return clientAppointments;
};

// Función para generar upcoming sessions (próximas citas ordenadas por fecha)
export const getUpcomingSessions = (): UpcomingSession[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return clientAppointments
    .filter(
      (appointment) =>
        appointment.status === "confirmed" && appointment.dateTime >= now
    )
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    .slice(0, 5) // Máximo 5 próximas citas
    .map((appointment) => {
      const appointmentDate = new Date(
        appointment.dateTime.getFullYear(),
        appointment.dateTime.getMonth(),
        appointment.dateTime.getDate()
      );

      const isToday = appointmentDate.getTime() === today.getTime();
      const isTomorrow = appointmentDate.getTime() === tomorrow.getTime();

      let timeDisplay = "";
      if (isToday) {
        timeDisplay = `Hoy ${appointment.dateTime.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`;
      } else if (isTomorrow) {
        timeDisplay = `Mañana ${appointment.dateTime.toLocaleTimeString(
          "es-ES",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        )}`;
      } else {
        timeDisplay =
          appointment.dateTime.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
          }) +
          ` ${appointment.dateTime.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}`;
      }

      return {
        id: appointment.id,
        time: timeDisplay,
        professional: appointment.professional.name,
        specialty: appointment.professional.specialty,
        description: `Tienes una videollamada con ${
          appointment.professional.name
        } ${isToday ? "hoy" : isTomorrow ? "mañana" : "próximamente"}.`,
        isToday,
      };
    });
};

// Función para generar calendar appointments (citas para mostrar en calendario)
export const getCalendarAppointments = (): CalendarAppointment[] => {
  return clientAppointments
    .filter(
      (appointment) =>
        appointment.status === "confirmed" || appointment.status === "pending"
    )
    .map((appointment) => ({
      id: appointment.id,
      date: appointment.dateTime.getDate(),
      professional: appointment.professional.name,
      specialty: appointment.professional.specialty,
      time: appointment.dateTime.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }));
};

// Función para generar pending sessions (todas las citas con diferentes estados)
export const getPendingSessions = (): PendingSession[] => {
  return clientAppointments.map((appointment) => ({
    id: appointment.id,
    professional: {
      name: appointment.professional.name,
      avatar: undefined,
    },
    status: appointment.status,
    date: appointment.dateTime.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
    }),
    time: appointment.dateTime.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    category: appointment.professional.specialty,
    modality: appointment.modality,
    product: appointment.product.name,
  }));
};

// Función para obtener detalles completos de una cita por ID
export const getSessionDetailsById = (
  id: string
): ClientAppointment | undefined => {
  return clientAppointments.find((appointment) => appointment.id === id);
};

// Función para obtener citas por fecha específica
export const getAppointmentsByDate = (date: number): CalendarAppointment[] => {
  return getCalendarAppointments().filter(
    (appointment) => appointment.date === date
  );
};

// Función para obtener citas por estado
export const getAppointmentsByStatus = (
  status: ClientAppointment["status"]
): ClientAppointment[] => {
  return clientAppointments.filter(
    (appointment) => appointment.status === status
  );
};

// Función para obtener citas por profesional
export const getAppointmentsByProfessional = (
  professionalName: string
): ClientAppointment[] => {
  return clientAppointments.filter((appointment) =>
    appointment.professional.name
      .toLowerCase()
      .includes(professionalName.toLowerCase())
  );
};

// ====== FUNCIONES DE UTILIDAD ======

// Función para simular la carga de datos desde API
export const fetchClientAppointments = async (): Promise<
  ClientAppointment[]
> => {
  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return getAllAppointments();
};

// Función para obtener estadísticas rápidas
export const getAppointmentStats = () => {
  const all = clientAppointments;
  return {
    total: all.length,
    confirmed: all.filter((a) => a.status === "confirmed").length,
    pending: all.filter((a) => a.status === "pending").length,
    cancelled: all.filter((a) => a.status === "cancelled").length,
    completed: all.filter((a) => a.status === "completed").length,
  };
};
