# Estructura del Proyecto Naxine

Esta es la estructura de carpetas organizada para el proyecto Naxine, una plataforma de gestión profesional.

## 📁 Estructura de Carpetas

```
src/
├── app/                          # App Router de Next.js 15
│   ├── (web)/                   # Páginas públicas
│   │   └── page.tsx
│   ├── (auth)/                  # Autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (dashboards)/            # Área privada
│   │   ├── (administracion)/    # Dashboard de administración
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   └── settings/
│   │   ├── (cliente)/           # Dashboard del cliente
│   │   │   ├── dashboard/
│   │   │   └── profile/
│   │   └── (profesional)/       # Dashboard del profesional
│   │       ├── dashboard/
│   │       └── projects/
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   └── projects/
│   ├── globals.css
│   └── layout.tsx
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes base (botones, inputs, etc.)
│   ├── forms/                   # Formularios específicos
│   ├── layout/                  # Componentes de layout
│   └── dashboard/               # Componentes específicos de dashboard
│       ├── charts/
│       ├── tables/
│       └── cards/
├── lib/                         # Utilidades y configuración
│   ├── utils.ts
│   ├── validations.ts
│   ├── constants.ts
│   └── auth.ts
├── hooks/                       # Custom hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useApi.ts
├── types/                       # Definiciones de TypeScript
│   ├── auth.ts
│   ├── user.ts
│   ├── api.ts
│   └── project.ts
├── services/                    # Lógica de negocio y API calls
│   ├── api.ts
│   ├── authService.ts
│   └── userService.ts
└── styles/                      # Estilos adicionales
    ├── components.css
    └── utilities.css
```

## 🎯 Propósito de cada Carpeta

### **`src/app/`** - App Router de Next.js

- **`(web)/`**: Páginas públicas del sitio web
- **`(auth)/`**: Páginas de autenticación (login, registro)
- **`(dashboards)/`**: Área privada con diferentes roles
  - **`(administracion)/`**: Panel de administración
  - **`(cliente)/`**: Panel del cliente
  - **`(profesional)/`**: Panel del profesional
- **`api/`**: Rutas de API REST

### **`src/components/`** - Componentes Reutilizables

- **`ui/`**: Componentes base del sistema de diseño
- **`forms/`**: Formularios específicos de la aplicación
- **`layout/`**: Componentes de layout (header, sidebar, footer)
- **`dashboard/`**: Componentes específicos para dashboards

### **`src/lib/`** - Utilidades y Configuración

- **`utils.ts`**: Funciones de utilidad generales
- **`validations.ts`**: Esquemas de validación (Zod)
- **`constants.ts`**: Constantes de la aplicación
- **`auth.ts`**: Lógica de autenticación y autorización

### **`src/hooks/`** - Custom Hooks

- **`useAuth.ts`**: Hook de autenticación
- **`useLocalStorage.ts`**: Hook para localStorage
- **`useApi.ts`**: Hook para llamadas a API

### **`src/types/`** - Definiciones TypeScript

- **`auth.ts`**: Tipos de autenticación
- **`user.ts`**: Tipos de usuario y perfil
- **`api.ts`**: Tipos para respuestas de API
- **`project.ts`**: Tipos de proyectos

### **`src/services/`** - Lógica de Negocio

- **`api.ts`**: Cliente API configurable
- **`authService.ts`**: Servicios de autenticación
- **`userService.ts`**: Servicios de usuario

### **`src/styles/`** - Estilos Adicionales

- **`components.css`**: Estilos para componentes
- **`utilities.css`**: Utilidades CSS adicionales

## 🚀 Ventajas de esta Estructura

1. **Escalabilidad**: Fácil agregar nuevas funcionalidades
2. **Mantenibilidad**: Código organizado por responsabilidades
3. **Reutilización**: Componentes y hooks reutilizables
4. **Tipado Fuerte**: TypeScript en toda la aplicación
5. **Separación de Roles**: Dashboards específicos por tipo de usuario
6. **API Organizada**: Rutas REST bien estructuradas

## 📝 Notas

- Las carpetas están vacías y listas para ser desarrolladas
- La estructura sigue las mejores prácticas de Next.js 15
- Compatible con TypeScript y Tailwind CSS
- Preparada para escalar a medida que el proyecto crezca

## 🔄 Próximos Pasos

1. Implementar componentes básicos en `src/components/ui/`
2. Crear páginas específicas en cada dashboard
3. Configurar autenticación real
4. Conectar con base de datos
5. Implementar API routes funcionales
