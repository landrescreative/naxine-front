# Guía de Migración a API Externa

## Resumen de Cambios

Se ha implementado una estructura completa de servicios para integrar con tu API externa de MySQL + Node.js + Express. La implementación incluye:

- ✅ Cliente HTTP base con manejo de errores
- ✅ Servicios organizados por dominio (auth, appointments, users, professionals, categories)
- ✅ Tipos TypeScript completos
- ✅ Utilidades para manejo de errores y helpers
- ✅ Hook useAuth actualizado
- ✅ Configuración centralizada
- ✅ Compatibilidad hacia atrás

## Estructura de Archivos Creados

```
src/services/
├── api/
│   ├── client.ts              # Cliente HTTP base
│   ├── auth.ts                # Servicios de autenticación
│   ├── appointments.ts        # Servicios de citas
│   ├── users.ts               # Servicios de usuarios
│   ├── professionals.ts       # Servicios de profesionales
│   └── categories.ts          # Servicios de categorías
├── types/
│   ├── api.ts                 # Tipos de API
│   ├── auth.ts                # Tipos de autenticación
│   └── common.ts              # Tipos comunes
├── utils/
│   ├── api-helpers.ts         # Utilidades para API
│   └── error-handling.ts     # Manejo de errores
├── config/
│   └── api-config.ts          # Configuración de API
├── examples/
│   └── usage-examples.ts      # Ejemplos de uso
└── index.ts                   # Exportaciones principales
```

## Configuración Requerida

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=https://tu-api-externa.com/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=10
NEXT_PUBLIC_MAX_PAGE_SIZE=100
NEXT_PUBLIC_CACHE_TTL=300000
NEXT_PUBLIC_ENABLE_CACHE=true
```

### 2. Endpoints de API Esperados

Tu API externa debe implementar estos endpoints:

#### Autenticación

- `POST /auth/login` - Login de usuario
- `POST /auth/register` - Registro de usuario
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refrescar token
- `GET /auth/verify` - Verificar token
- `POST /auth/forgot-password` - Recuperar contraseña
- `POST /auth/reset-password` - Resetear contraseña
- `POST /auth/change-password` - Cambiar contraseña

#### Usuarios

- `GET /users` - Listar usuarios (admin)
- `GET /users/:id` - Obtener usuario por ID
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario
- `GET /users/me` - Usuario actual
- `PUT /users/me` - Actualizar perfil actual

#### Citas

- `GET /appointments` - Listar citas
- `GET /appointments/:id` - Obtener cita por ID
- `POST /appointments` - Crear cita
- `PUT /appointments/:id` - Actualizar cita
- `DELETE /appointments/:id` - Eliminar cita
- `GET /appointments/upcoming` - Próximas citas
- `GET /appointments/stats` - Estadísticas de citas

#### Profesionales

- `GET /professionals` - Listar profesionales
- `GET /professionals/:id` - Obtener profesional por ID
- `POST /professionals` - Crear profesional
- `PUT /professionals/:id` - Actualizar profesional
- `GET /professionals/search` - Buscar profesionales
- `GET /professionals/stats` - Estadísticas de profesionales

#### Categorías y Servicios

- `GET /categories` - Listar categorías
- `GET /categories/:id` - Obtener categoría con servicios
- `GET /services` - Listar servicios
- `GET /services/:id` - Obtener servicio por ID
- `GET /search` - Búsqueda global

## Uso de los Servicios

### 1. Autenticación

```typescript
import { authService } from "@/services";

// Login
const response = await authService.login({
  email: "user@example.com",
  password: "password123",
});

// Registro
const response = await authService.register({
  email: "newuser@example.com",
  password: "password123",
  name: "New User",
  role: "client",
});
```

### 2. Citas

```typescript
import { appointmentsService } from "@/services";

// Obtener citas
const appointments = await appointmentsService.getAppointments({
  page: 1,
  limit: 10,
  status: "confirmed",
});

// Crear cita
const newAppointment = await appointmentsService.createAppointment({
  professionalId: "prof-001",
  productId: "service-001",
  dateTime: "2024-02-15T10:00:00Z",
  modality: "online",
  payment: {
    method: "Mastercard",
    cardNumber: "1234****5678",
    expiryDate: "12/25",
    cardholderName: "John Doe",
  },
});
```

### 3. Usuarios

```typescript
import { usersService } from "@/services";

// Obtener usuarios (admin)
const users = await usersService.getUsers({
  page: 1,
  limit: 20,
  search: "john",
});

// Obtener estadísticas
const stats = await usersService.getClientStats();
```

### 4. Profesionales

```typescript
import { professionalsService } from "@/services";

// Buscar profesionales
const professionals = await professionalsService.searchProfessionals(
  "psicólogo",
  {
    page: 1,
    limit: 10,
  }
);

// Obtener por especialidad
const psychologists = await professionalsService.getProfessionalsBySpecialty(
  "Psicología"
);
```

### 5. Categorías

```typescript
import { categoriesService } from "@/services";

// Obtener categorías
const categories = await categoriesService.getCategories();

// Obtener categoría con servicios
const categoryWithServices = await categoriesService.getCategoryById(
  "terapias"
);
```

## Migración de Datos Mock

### Estrategia Recomendada

1. **Mantener archivos mock** como fallback durante desarrollo
2. **Crear funciones adaptadoras** que usen la API cuando esté disponible
3. **Implementar caché** para mejorar rendimiento
4. **Migrar gradualmente** componente por componente

### Ejemplo de Adaptador

```typescript
// src/data/adapters/appointments-adapter.ts
import { appointmentsService } from "@/services";
import { getAllAppointments as getMockAppointments } from "./clientAppointments";

export const getAllAppointments = async () => {
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

## Manejo de Errores

Los servicios incluyen manejo robusto de errores:

```typescript
import { getErrorMessage, handleApiError } from "@/services";

try {
  const response = await appointmentsService.getAppointments();
  if (!response.success) {
    console.error("Error:", response.error);
  }
} catch (error) {
  const errorMessage = getErrorMessage(error);
  console.error("Error:", errorMessage);
}
```

## Próximos Pasos

1. **Configurar variables de entorno** con la URL de tu API
2. **Implementar endpoints** en tu API externa según la especificación
3. **Probar conexión** usando `testApiConnection()`
4. **Migrar componentes** uno por uno usando los nuevos servicios
5. **Implementar caché** para mejorar rendimiento
6. **Agregar tests** para los servicios

## Compatibilidad

- ✅ Mantiene compatibilidad con código existente
- ✅ Archivo `src/lib/api.ts` actualizado para compatibilidad hacia atrás
- ✅ Hook `useAuth` mejorado pero compatible
- ✅ Datos mock preservados como fallback

## Soporte

Para cualquier problema o pregunta sobre la implementación, revisa:

- `src/services/examples/usage-examples.ts` - Ejemplos de uso
- `src/services/config/api-config.ts` - Configuración de endpoints
- `src/services/utils/error-handling.ts` - Manejo de errores
