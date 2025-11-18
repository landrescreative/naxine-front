// src/services/examples/usage-examples.ts
// Ejemplos de cómo usar los servicios de API

import {
  authService,
  appointmentsService,
  usersService,
  professionalsService,
  categoriesService,
} from "../index";

// Ejemplo de uso de autenticación
export const authExamples = {
  async loginExample() {
    try {
      const response = await authService.login({
        email: "user@example.com",
        password: "password123",
      });

      if (response.success) {
        console.log("Login successful:", response.data);
        return response.data;
      } else {
        console.error("Login failed:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },

  async registerExample() {
    try {
      const response = await authService.register({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        role: "client",
      });

      if (response.success) {
        console.log("Registration successful:", response.data);
        return response.data;
      } else {
        console.error("Registration failed:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  },
};

// Ejemplo de uso de citas
export const appointmentsExamples = {
  async getAppointmentsExample() {
    try {
      const response = await appointmentsService.getAppointments({
        page: 1,
        limit: 10,
        status: "confirmed",
      });

      if (response.success) {
        console.log("Appointments:", response.data);
        return response.data;
      } else {
        console.error("Failed to get appointments:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Appointments error:", error);
      return null;
    }
  },

  async createAppointmentExample() {
    try {
      const response = await appointmentsService.createAppointment({
        professionalId: "prof-001",
        productId: "service-001",
        dateTime: "2024-02-15T10:00:00Z",
        modality: "online",
        notes: "First consultation",
        payment: {
          method: "Mastercard",
          cardNumber: "1234****5678",
          expiryDate: "12/25",
          cardholderName: "John Doe",
        },
      });

      if (response.success) {
        console.log("Appointment created:", response.data);
        return response.data;
      } else {
        console.error("Failed to create appointment:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Create appointment error:", error);
      return null;
    }
  },
};

// Ejemplo de uso de usuarios
export const usersExamples = {
  async getUsersExample() {
    try {
      const response = await usersService.getUsers({
        page: 1,
        limit: 20,
        search: "john",
      });

      if (response.success) {
        console.log("Users:", response.data);
        return response.data;
      } else {
        console.error("Failed to get users:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Users error:", error);
      return null;
    }
  },

  async getClientStatsExample() {
    try {
      const response = await usersService.getClientStats();

      if (response.success) {
        console.log("Client stats:", response.data);
        return response.data;
      } else {
        console.error("Failed to get client stats:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Client stats error:", error);
      return null;
    }
  },
};

// Ejemplo de uso de profesionales
export const professionalsExamples = {
  async getProfessionalsExample() {
    try {
      const response = await professionalsService.getProfessionals({
        page: 1,
        limit: 10,
        specialty: "Psicología",
      });

      if (response.success) {
        console.log("Professionals:", response.data);
        return response.data;
      } else {
        console.error("Failed to get professionals:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Professionals error:", error);
      return null;
    }
  },

  async searchProfessionalsExample() {
    try {
      const response = await professionalsService.searchProfessionals(
        "psicólogo",
        {
          page: 1,
          limit: 5,
        }
      );

      if (response.success) {
        console.log("Search results:", response.data);
        return response.data;
      } else {
        console.error("Search failed:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Search error:", error);
      return null;
    }
  },
};

// Ejemplo de uso de categorías
export const categoriesExamples = {
  async getCategoriesExample() {
    try {
      const response = await categoriesService.getCategories({
        page: 1,
        limit: 10,
      });

      if (response.success) {
        console.log("Categories:", response.data);
        return response.data;
      } else {
        console.error("Failed to get categories:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Categories error:", error);
      return null;
    }
  },

  async getCategoryWithServicesExample() {
    try {
      const response = await categoriesService.getCategoryById("terapias");

      if (response.success) {
        console.log("Category with services:", response.data);
        return response.data;
      } else {
        console.error("Failed to get category:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Category error:", error);
      return null;
    }
  },
};

// Ejemplo completo de flujo de trabajo
export const completeWorkflowExample = async () => {
  try {
    // 1. Login
    const loginResult = await authExamples.loginExample();
    if (!loginResult) return;

    // 2. Obtener categorías
    const categoriesResult = await categoriesExamples.getCategoriesExample();
    if (!categoriesResult) return;

    // 3. Buscar profesionales
    const professionalsResult =
      await professionalsExamples.searchProfessionalsExample();
    if (!professionalsResult) return;

    // 4. Crear cita
    const appointmentResult =
      await appointmentsExamples.createAppointmentExample();
    if (!appointmentResult) return;

    // 5. Obtener citas del usuario
    const appointmentsResult =
      await appointmentsExamples.getAppointmentsExample();

    console.log("Complete workflow executed successfully");
    return {
      login: loginResult,
      categories: categoriesResult,
      professionals: professionalsResult,
      appointment: appointmentResult,
      appointments: appointmentsResult,
    };
  } catch (error) {
    console.error("Complete workflow error:", error);
    return null;
  }
};
