# Middleware - Control de Acceso y Autenticación

## 📋 Descripción General

El middleware de Next.js controla el acceso a las diferentes rutas de la aplicación según:

1. El entorno de la aplicación (`NEXT_PUBLIC_APP_ENV`)
2. El estado de autenticación del usuario

## 🎯 Funcionalidades

### 1. Control de Acceso por Entorno

El comportamiento se controla con la variable `NEXT_PUBLIC_APP_ENV`:

#### En PRODUCCIÓN (`APP_ENV=production`) - naxine.com

El middleware activa el **modo "Próximamente"** para limitar el acceso público:

- ✅ **SOLO 2 rutas visibles:**

  - `/proximamente` - Página de "Próximamente disponible"
  - `/registro-profesional` - Formulario de registro para profesionales

- 🔄 **Redireccionamiento automático:**
  - `/` (raíz) → `/proximamente`
  - `/iniciar-sesion` → `/proximamente`
  - `/dashboard/*` → `/proximamente`
  - Cualquier otra ruta → `/proximamente`

#### En STAGING (`APP_ENV=staging`) - prueba.naxine.com

Funcionalidad completa para pruebas:

- ✅ Todas las páginas públicas son accesibles
- ✅ Todas las rutas funcionan normalmente (servicios, contacto, etc.)
- ✅ `/proximamente` existe pero no tiene comportamiento especial
- 🔒 Dashboard protegido con autenticación
- 🎯 Perfecto para probar antes de desplegar a producción

#### En DESARROLLO (`APP_ENV=development` o sin definir) - localhost

Todas las funcionalidades están disponibles:

- ✅ Todas las páginas públicas son accesibles
- ✅ `/proximamente` existe pero no tiene comportamiento especial
- 🔒 Dashboard protegido con autenticación

### 2. Protección de Rutas del Dashboard

Independientemente del entorno, todas las rutas que empiezan con `/dashboard` están protegidas:

1. El middleware busca el token `auth-token` en las cookies
2. Si no hay token: redirige a `/iniciar-sesion?redirect=/dashboard/...`
3. Si hay token: permite el acceso (la validación real se hace en el backend)

## 🔧 Configuración

### Variables de Entorno

El middleware usa la variable `NEXT_PUBLIC_APP_ENV`:

```bash
# Desarrollo local
NEXT_PUBLIC_APP_ENV=development  # (o sin definir, valor por defecto)

# Staging/Pruebas (prueba.naxine.com)
NEXT_PUBLIC_APP_ENV=staging

# Producción (naxine.com)
NEXT_PUBLIC_APP_ENV=production
```

**⚠️ Importante**: Esta variable debe configurarse en Vercel para cada entorno:

- **Production environment** → `production`
- **Preview environment** → `staging`
- **Local** → `development` (o sin definir)

### Rutas de Sistema Excluidas

Estas rutas siempre están permitidas (no pasan por el middleware de producción):

- `/_next/*` - Archivos estáticos de Next.js
- `/api/*` - API routes
- `/favicon.ico` - Favicon
- `/public/*` - Archivos públicos

## 🧪 Pruebas

### Probar en Modo Desarrollo

```bash
# No necesitas configurar nada, por defecto es development
npm run dev
```

- Todas las páginas funcionan normalmente
- Navega a cualquier ruta: `/`, `/servicios`, `/contacto`, etc.

### Probar en Modo Staging (localmente)

```bash
# 1. Crear archivo .env.local y agregar:
echo "NEXT_PUBLIC_APP_ENV=staging" > .env.local

# 2. Iniciar servidor
npm run dev

# 3. Visitar http://localhost:3001
# - Todas las páginas funcionan (igual que development)
```

### Probar en Modo Producción (localmente)

```bash
# 1. Crear archivo .env.local y agregar:
echo "NEXT_PUBLIC_APP_ENV=production" > .env.local

# 2. Construir e iniciar
npm run build
npm start

# 3. Visitar http://localhost:3001
# - Deberías ser redirigido a /proximamente
# - Solo /proximamente y /registro-profesional funcionan
# - Otras rutas redirigen a /proximamente
```

### Volver a Modo Desarrollo

```bash
# Elimina la variable o cámbiala
echo "NEXT_PUBLIC_APP_ENV=development" > .env.local
npm run dev
```

## 📝 Ejemplos de Flujo

### Flujo en Producción

#### Usuario visita la raíz

```
Usuario → http://tudominio.com/
         ↓ (middleware detecta producción)
         ↓ (redirige a /proximamente)
Usuario → http://tudominio.com/proximamente
```

#### Usuario intenta visitar servicios

```
Usuario → http://tudominio.com/servicios
         ↓ (middleware detecta producción)
         ↓ (no está en rutas permitidas)
         ↓ (redirige a /proximamente)
Usuario → http://tudominio.com/proximamente
```

#### Usuario visita registro profesional

```
Usuario → http://tudominio.com/registro-profesional
         ↓ (middleware detecta producción)
         ↓ (está en rutas permitidas)
         ↓ (permite acceso)
Usuario → http://tudominio.com/registro-profesional ✅
```

#### Usuario intenta acceder al dashboard

```
Usuario → http://tudominio.com/dashboard/cliente
         ↓ (middleware detecta producción)
         ↓ (no está en rutas permitidas)
         ↓ (redirige a /proximamente)
Usuario → http://tudominio.com/proximamente
```

#### Usuario intenta iniciar sesión

```
Usuario → http://tudominio.com/iniciar-sesion
         ↓ (middleware detecta producción)
         ↓ (no está en rutas permitidas)
         ↓ (redirige a /proximamente)
Usuario → http://tudominio.com/proximamente
```

### Flujo en Desarrollo

#### Usuario visita cualquier ruta

```
Usuario → http://localhost:3001/servicios
         ↓ (middleware detecta desarrollo)
         ↓ (permite acceso)
Usuario → http://localhost:3001/servicios ✅
```

## 🛠️ Modificar el Middleware

### Agregar Rutas Permitidas en Producción

Si necesitas agregar más rutas públicas en producción, edita `middleware.ts`:

```typescript
// Lista de rutas permitidas en producción
const allowedRoutes = [
  "/proximamente",
  "/registro-profesional",
  "/tu-nueva-ruta", // ← Agregar aquí si es necesario
];
```

### Cambiar Comportamiento

El middleware está en: `naxine-front/middleware.ts`

Estructura:

```typescript
export function middleware(request: NextRequest) {
  // 1. Control de acceso en producción
  if (isProduction) {
    // ... lógica de redirección
  }

  // 2. Protección de dashboard
  if (pathname.startsWith("/dashboard")) {
    // ... verificación de autenticación
  }

  return NextResponse.next();
}
```

## ⚠️ Consideraciones Importantes

1. **APP_ENV controla todo**: La variable `NEXT_PUBLIC_APP_ENV` determina el comportamiento completo:

   - `production` → Solo 2 rutas visibles
   - `staging` → Funcionalidad completa
   - `development` (o sin definir) → Funcionalidad completa

2. **Configuración en Vercel**: Debes configurar `NEXT_PUBLIC_APP_ENV` correctamente:

   - **naxine.com** → Environment: `Production` → Value: `production`
   - **prueba.naxine.com** → Environment: `Preview` → Value: `staging`
   - Ver guía completa en `VERCEL_SETUP.md`

3. **⚠️ Dashboard en Producción**: Con `APP_ENV=production`, el dashboard NO es accesible porque:

   - Solo `/proximamente` y `/registro-profesional` son visibles
   - Las rutas de login redirigen a `/proximamente`
   - Las rutas de dashboard redirigen a `/proximamente`
   - Usa `staging` (prueba.naxine.com) para acceder al dashboard

4. **Token de autenticación**: En desarrollo y staging, el middleware verifica que exista el token en cookies para proteger el dashboard. La validación real (expiración, permisos, roles) se hace en el backend.

5. **Rutas de API**: Las rutas `/api/*` no pasan por este middleware, tienen su propia lógica de autenticación.

6. **Orden de evaluación**:

   - Primero: Control de entorno (si `APP_ENV=production`)
   - Segundo: Protección de dashboard (si aplica)
   - Finalmente: Permite acceso

7. **Caché**: Si cambias el middleware o variables de entorno:
   - Local: Reinicia el servidor (`npm run dev`)
   - Vercel: Haz redeploy del proyecto

## 🚀 Despliegue

### Vercel (Recomendado)

**⚠️ IMPORTANTE**: Debes configurar `NEXT_PUBLIC_APP_ENV` para cada entorno:

#### Setup Completo:

Ver la guía detallada en **`VERCEL_SETUP.md`** para configurar:

- Dominios (naxine.com y prueba.naxine.com)
- Variables de entorno por ambiente
- Git branches
- Verificación de deployment

#### Resumen Rápido:

1. **Configurar variables en Vercel**:

   - Production (naxine.com): `NEXT_PUBLIC_APP_ENV=production`
   - Preview (prueba.naxine.com): `NEXT_PUBLIC_APP_ENV=staging`

2. **Hacer push**:

```bash
# Para staging/pruebas
git push origin staging

# Para producción
git push origin main
```

Vercel desplegará automáticamente con las variables correctas.

### Otros Proveedores

Asegúrate de configurar:

1. `NEXT_PUBLIC_APP_ENV=production` (o `staging` según el entorno)
2. Ejecutar `npm run build`
3. Iniciar con `npm start`

## 📚 Referencias

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Cookies in Middleware](https://nextjs.org/docs/app/api-reference/functions/cookies)
