# Guía de Uso de Componentes con API

## Ejemplos de Componentes Implementados

He creado varios ejemplos de componentes que muestran cómo consumir los datos de la API en diferentes escenarios:

### 1. **AuthExample.tsx** - Autenticación Completa

```typescript
import { useAuth } from "@/hooks/useAuth";

const { user, loading, error, login, register, logout } = useAuth();

// Login
await login({ email: "user@example.com", password: "password123" });

// Registro
await register({
  email: "new@example.com",
  password: "password123",
  name: "Usuario",
  role: "client",
});
```

### 2. **AppointmentsExample.tsx** - Gestión de Citas

```typescript
import { appointmentsService } from "@/services";

// Cargar citas
const response = await appointmentsService.getAppointments({
  page: 1,
  limit: 10,
  status: "confirmed",
});

// Crear cita
await appointmentsService.createAppointment({
  professionalId: "prof-001",
  productId: "service-001",
  dateTime: "2024-02-15T10:00:00Z",
  modality: "online",
  payment: {
    /* datos de pago */
  },
});

// Cancelar cita
await appointmentsService.cancelAppointment(appointmentId);
```

### 3. **ProfessionalsExample.tsx** - Directorio de Profesionales

```typescript
import { professionalsService } from "@/services";

// Buscar profesionales
const response = await professionalsService.searchProfessionals("psicólogo", {
  page: 1,
  limit: 10,
});

// Filtrar por especialidad
await professionalsService.getProfessionalsBySpecialty("Psicología");

// Obtener estadísticas
const stats = await professionalsService.getProfessionalStats();
```

### 4. **CategoriesExample.tsx** - Categorías y Servicios

```typescript
import { categoriesService } from "@/services";

// Cargar categorías
const categories = await categoriesService.getCategories();

// Obtener categoría con servicios
const categoryDetails = await categoriesService.getCategoryById("terapias");

// Buscar categorías
const searchResults = await categoriesService.searchCategories("psicología");
```

### 5. **UsersAdminExample.tsx** - Administración de Usuarios

```typescript
import { usersService } from "@/services";

// Cargar usuarios con filtros
const users = await usersService.getClients({
  page: 1,
  limit: 20,
  search: "john",
  status: "Activo",
});

// Cambiar estado de usuario
await usersService.deactivateUser(userId);
await usersService.activateUser(userId);

// Obtener estadísticas
const stats = await usersService.getClientStats();
```

### 6. **HookUsageExample.tsx** - Uso Avanzado del Hook

```typescript
import { useAuth } from "@/hooks/useAuth";
import { createPaginationParams, createFilterParams } from "@/services";

const { user, isAuthenticated, loading } = useAuth();

// Cargar datos en paralelo
const [appointmentsRes, professionalsRes] = await Promise.all([
  appointmentsService.getClientAppointments(),
  professionalsService.getProfessionals(createPaginationParams(1, 5)),
]);
```

## Patrones de Uso Comunes

### **1. Manejo de Estados**

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await service.getData();

    if (response.success) {
      setData(response.data);
    } else {
      setError(response.error);
    }
  } catch (err) {
    setError("Error de conexión");
  } finally {
    setLoading(false);
  }
};
```

### **2. Validación de Formularios**

```typescript
import { validateEmail, validatePassword } from "@/services/utils/api-helpers";

const handleSubmit = async (formData) => {
  const errors = {};

  if (!validateEmail(formData.email)) {
    errors.email = "Email inválido";
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors.join(", ");
  }

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  // Proceder con el envío
};
```

### **3. Búsqueda con Debounce**

```typescript
import { debounce } from "@/services/utils/api-helpers";

const debouncedSearch = debounce(async (query) => {
  if (query.trim()) {
    const response = await service.search(query);
    setResults(response.data);
  }
}, 500);

// En el componente
useEffect(() => {
  debouncedSearch(searchQuery);
}, [searchQuery]);
```

### **4. Manejo de Errores**

```typescript
import { getErrorMessage } from "@/services/utils/error-handling";

try {
  const response = await service.performAction();
  if (!response.success) {
    setError(response.error);
  }
} catch (err) {
  const errorMessage = getErrorMessage(err);
  setError(errorMessage);
}
```

### **5. Paginación y Filtros**

```typescript
import {
  createPaginationParams,
  createFilterParams,
} from "@/services/utils/api-helpers";

const loadData = async (page = 1, filters = {}) => {
  const params = {
    ...createPaginationParams(page, 10),
    ...createFilterParams(filters),
  };

  const response = await service.getData(params);
  return response;
};
```

## Integración en tu Proyecto

### **1. Reemplazar Datos Mock**

```typescript
// Antes (datos mock)
import { getAllAppointments } from "@/data/clientAppointments";

// Después (API real con fallback)
import { appointmentsService } from "@/services";
import { getAllAppointments as getMockAppointments } from "@/data/clientAppointments";

const loadAppointments = async () => {
  try {
    const response = await appointmentsService.getAppointments();
    if (response.success) {
      return response.data?.data || [];
    }
  } catch (error) {
    console.warn("API not available, using mock data:", error);
  }

  // Fallback a datos mock
  return getMockAppointments();
};
```

### **2. Usar en Páginas Existentes**

```typescript
// En src/app/dashboard/cliente/page.tsx
"use client";

import { AppointmentsExample } from "@/components/examples/AppointmentsExample";

export default function ClientDashboard() {
  return <AppointmentsExample />;
}
```

### **3. Crear Hooks Personalizados**

```typescript
// src/hooks/useAppointments.ts
import { useState, useEffect } from "react";
import { appointmentsService } from "@/services";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsService.getAppointments();
      if (response.success) {
        setAppointments(response.data?.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return { appointments, loading, error, refetch: loadAppointments };
};
```

## Próximos Pasos

1. **Configura tu API externa** con los endpoints especificados
2. **Crea un archivo `.env.local`** con la URL de tu API
3. **Reemplaza gradualmente** los datos mock en tus componentes existentes
4. **Usa los ejemplos** como base para tus componentes reales
5. **Implementa caché** para mejorar el rendimiento
6. **Agrega tests** para los servicios y componentes

Los ejemplos están listos para usar y muestran todas las funcionalidades implementadas. ¡Solo necesitas conectarlos a tu API externa!
