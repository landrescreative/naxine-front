# NAXINE Frontend

Plataforma digital Next.js para NAXINE - marketplace de servicios profesionales.

## 🌐 Entornos

Este proyecto está configurado para funcionar en **dos entornos**:

| Entorno | URL | Comportamiento |
|---------|-----|----------------|
| **Producción** | [naxine.com](https://naxine.com) | Modo "Próximamente" - Solo `/proximamente` y `/registro-profesional` |
| **Staging/Pruebas** | [prueba.naxine.com](https://prueba.naxine.com) | Funcionalidad completa para testing |
| **Desarrollo Local** | localhost:3001 | Funcionalidad completa |

## 📚 Documentación

- 📖 **[ENV_CONFIG.md](./ENV_CONFIG.md)** - Configuración de variables de entorno
- 🚀 **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Guía paso a paso para configurar Vercel (DOS ENTORNOS)
- 🛡️ **[MIDDLEWARE_README.md](./MIDDLEWARE_README.md)** - Documentación del middleware y control de acceso

## ⚡ Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd naxine-front
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp env.example .env.local

# Edita .env.local con tus valores
```

**Variables mínimas requeridas para desarrollo local:**
```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

📖 Ver [ENV_CONFIG.md](./ENV_CONFIG.md) para configuración completa.

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001) en tu navegador.

**Nota**: El frontend corre en el puerto **3001**, el backend en el puerto **3000**.

## 🎯 Control de Entornos

El proyecto usa `NEXT_PUBLIC_APP_ENV` para controlar el comportamiento:

### Modo Producción (APP_ENV=production)
- ✅ Solo `/proximamente` y `/registro-profesional` visibles
- ❌ Todas las demás rutas redirigen a `/proximamente`
- 🎯 Usar en: **naxine.com**

### Modo Staging (APP_ENV=staging)
- ✅ Funcionalidad completa
- ✅ Todas las páginas accesibles
- 🎯 Usar en: **prueba.naxine.com**

### Modo Development (APP_ENV=development o sin definir)
- ✅ Funcionalidad completa
- ✅ Dashboard protegido con autenticación
- 🎯 Usar en: **localhost**

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en puerto 3001

# Producción
npm run build        # Construye la aplicación para producción
npm start            # Inicia servidor de producción

# Testing
npm test             # Ejecuta tests
npm run test:watch   # Ejecuta tests en modo watch
npm run test:coverage # Ejecuta tests con cobertura

# Linting
npm run lint         # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
naxine-front/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (web)/             # Rutas públicas
│   │   ├── dashboard/         # Dashboards (protegidos)
│   │   └── api/               # API routes
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes de UI
│   │   ├── layout/           # Componentes de layout
│   │   └── dashboard/        # Componentes del dashboard
│   ├── hooks/                # Custom hooks
│   ├── services/             # Servicios y API calls
│   ├── lib/                  # Utilidades y helpers
│   └── types/                # TypeScript types
├── public/                   # Archivos estáticos
├── middleware.ts             # Middleware de Next.js (control de acceso)
├── ENV_CONFIG.md            # Documentación de variables de entorno
├── VERCEL_SETUP.md          # Guía de setup de Vercel
└── MIDDLEWARE_README.md     # Documentación del middleware
```

## 🚀 Despliegue en Vercel

### Configuración de Dos Entornos

Este proyecto requiere configuración especial en Vercel para soportar dos entornos:

**📖 Ver guía completa: [VERCEL_SETUP.md](./VERCEL_SETUP.md)**

#### Resumen Rápido:

1. **Configurar dominios en Vercel**:
   - `naxine.com` → branch `main`
   - `prueba.naxine.com` → branch `staging`

2. **Configurar variables de entorno**:
   - **Production** (naxine.com): `NEXT_PUBLIC_APP_ENV=production`
   - **Preview** (prueba.naxine.com): `NEXT_PUBLIC_APP_ENV=staging`

3. **Desplegar**:
```bash
# Para staging/pruebas
git push origin staging

# Para producción
git push origin main
```

### Flujo de Trabajo Recomendado

```
Desarrollo Local (localhost)
  ↓ git push origin staging
Staging (prueba.naxine.com) - Probar funcionalidades
  ↓ git merge staging → main
Producción (naxine.com) - Modo "Próximamente"
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📚 Tecnologías

- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **TypeScript**: 5
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Payments**: Stripe
- **Forms**: React Hook Form (en componentes que lo usan)
- **Testing**: Jest + React Testing Library

## 🔒 Seguridad

- Middleware de Next.js para control de acceso
- Autenticación basada en tokens (cookies httpOnly)
- Validación en cliente y servidor
- Variables de entorno seguras (no expuestas al cliente excepto NEXT_PUBLIC_*)

## 📖 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Platform](https://vercel.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
