# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno para el frontend de Naxine.

## 🎯 Comportamiento por Entorno

El comportamiento de la aplicación se controla con la variable `NEXT_PUBLIC_APP_ENV`:

### 🚀 PRODUCCIÓN (naxine.com)
**Configuración:** `NEXT_PUBLIC_APP_ENV=production`

El middleware activa el **modo "Próximamente"**:
- ✅ Página principal: `/proximamente`
- ✅ **SOLO 2 rutas visibles:**
  - `/proximamente` - Página de próximamente
  - `/registro-profesional` - Registro de profesionales
- ❌ **Todas las demás rutas redirigen a `/proximamente`** (incluyendo login, dashboard, servicios, etc.)

### 🧪 STAGING/PRUEBAS (prueba.naxine.com)
**Configuración:** `NEXT_PUBLIC_APP_ENV=staging`

Funcionalidad completa para pruebas:
- ✅ Todas las páginas son públicas y funcionan normalmente
- ✅ Todas las rutas accesibles (servicios, contacto, etc.)
- 🔒 Dashboard protegido con autenticación
- ✅ Perfecto para probar funcionalidades antes de desplegar a producción

### 💻 DESARROLLO LOCAL (localhost)
**Configuración:** `NEXT_PUBLIC_APP_ENV=development` (o sin configurar)

- ✅ Todas las páginas funcionan normalmente
- ✅ `/proximamente` existe pero no tiene funcionalidad especial
- 🔒 Dashboard protegido con autenticación

> **💡 Nota:** Si `NEXT_PUBLIC_APP_ENV` no está definido, se asume `development` (comportamiento completo).

## 🚀 Inicio Rápido

### Para Desarrollo Local

1. **Copia el archivo de ejemplo:**
   ```bash
   cd naxine-front
   cp env.example .env.local
   ```

2. **Edita `.env.local`** y asegúrate de que tenga:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

3. **Reinicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

### Para Producción (Vercel)

Las variables de entorno se configuran en el panel de Vercel:
- Ve a **Settings → Environment Variables**
- Agrega las variables con los valores de producción

## Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto (`naxine-front/`) con las siguientes variables:

> **💡 Tip:** Usa el archivo `env.example` como plantilla: `cp env.example .env.local`

## Configuración por Entorno

### 🔧 Desarrollo Local

**Archivo:** `.env.local` (en la raíz de `naxine-front/`)

```env
# Entorno de la aplicación (controla el comportamiento del middleware)
# development = funcionalidad completa (valor por defecto si no se define)
NEXT_PUBLIC_APP_ENV=development

# API Configuration - CONECTA A TU API LOCAL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Stripe (usar keys de prueba)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# SendGrid (para formulario de alta de profesionales)
# ⚠️ Estas variables son del servidor (NO NEXT_PUBLIC_) y solo están disponibles en API routes
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_TO_EMAIL=admin@tudominio.com  # Email donde se recibirán las solicitudes (opcional, por defecto usa SENDGRID_FROM_EMAIL)
```

**⚠️ Importante:** 
- `NEXT_PUBLIC_APP_ENV=development` activa la funcionalidad completa
- Todas las páginas funcionan normalmente en desarrollo
- Asegúrate de que tu API local esté corriendo en el puerto 3000
- Si cambias el puerto de la API, actualiza `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_BACKEND_URL`

### 🌐 Staging/Pruebas - prueba.naxine.com (Vercel)

**Configuración:** Panel de Vercel → Settings → Environment Variables → Preview/Development

```env
# Entorno de la aplicación - STAGING = funcionalidad completa para pruebas
NEXT_PUBLIC_APP_ENV=staging

# API Configuration - CONECTA A TU API DE PRUEBAS
NEXT_PUBLIC_API_URL=https://api-prueba.tudominio.com/api
NEXT_PUBLIC_FRONTEND_URL=https://prueba.naxine.com
NEXT_PUBLIC_BACKEND_URL=https://api-prueba.tudominio.com
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_SITE_URL=https://prueba.naxine.com

# Stripe (usar keys de prueba)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_TO_EMAIL=admin@tudominio.com
```

### 🚀 Producción - naxine.com (Vercel)

**Configuración:** Panel de Vercel → Settings → Environment Variables → Production

```env
# Entorno de la aplicación - PRODUCTION = modo "Próximamente"
NEXT_PUBLIC_APP_ENV=production

# API Configuration - CONECTA A TU API EN AWS
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
NEXT_PUBLIC_FRONTEND_URL=https://tudominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.tudominio.com
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_SITE_URL=https://tudominio.com

# Stripe (usar keys de producción)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# SendGrid (para formulario de alta de profesionales)
# ⚠️ Estas variables son del servidor (NO NEXT_PUBLIC_) y solo están disponibles en API routes
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_TO_EMAIL=admin@tudominio.com  # Email donde se recibirán las solicitudes (opcional, por defecto usa SENDGRID_FROM_EMAIL)
```

**⚠️ Importante:**
- `NEXT_PUBLIC_APP_ENV=production` activa el modo "Próximamente"
- Solo `/proximamente` y `/registro-profesional` serán accesibles
- Reemplaza `tudominio.com` con tu dominio real
- Estas variables se configuran en Vercel, NO en un archivo `.env.local`

## Notas Importantes

1. **NEXT_PUBLIC_API_URL**: Esta variable DEBE incluir `/api` al final. El código asume que esta URL ya incluye el prefijo `/api`.

2. **Variables NEXT_PUBLIC_**: En Next.js, solo las variables que empiezan con `NEXT_PUBLIC_` están disponibles en el navegador. Las variables sin este prefijo solo están disponibles en el servidor (API routes, Server Components, etc.).

3. **SendGrid**: Las variables `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` y `SENDGRID_TO_EMAIL` son necesarias para el formulario de alta de profesionales (`/profesionales/alta`). Estas variables solo están disponibles en el servidor por seguridad.

4. **Archivo .env.local**: Este archivo está en `.gitignore` y no se commitea al repositorio. Cada desarrollador debe crear su propio archivo.

5. **Despliegue**: En producción (Vercel, AWS, etc.), configura estas variables en el panel de configuración de tu plataforma de despliegue.

## ✅ Verificación

### 1. Verificar que la API local esté corriendo

```bash
# En otra terminal, verifica que la API responda
curl http://localhost:3000/api/health
```

Deberías recibir una respuesta JSON con `{"status":"ok",...}`

### 2. Verificar variables de entorno en el frontend

Después de configurar `.env.local`, reinicia el servidor de desarrollo:

```bash
cd naxine-front
npm run dev
```

### 3. Verificar en el navegador

1. Abre la consola del navegador (F12)
2. En la pestaña "Console", deberías ver logs que muestren la URL de la API
3. O puedes verificar en la pestaña "Network" que las peticiones vayan a `http://localhost:3000/api`

### 4. Debug rápido

Si quieres ver qué URL está usando el frontend, puedes agregar temporalmente esto en cualquier componente:

```typescript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

## 🌐 Configuración de Dominios en Vercel

### Configurar Dos Entornos en Vercel

Vercel permite tener múltiples entornos con diferentes dominios:

#### 1. **Entorno de Producción** (naxine.com)
1. Ve a tu proyecto en Vercel → **Settings** → **Domains**
2. Agrega el dominio: `naxine.com`
3. Ve a **Settings** → **Environment Variables**
4. Agrega las variables con el **Environment**: `Production`
5. **Importante:** Establece `NEXT_PUBLIC_APP_ENV=production`

#### 2. **Entorno de Staging/Pruebas** (prueba.naxine.com)
1. Ve a **Settings** → **Domains**
2. Agrega el dominio: `prueba.naxine.com`
3. Asigna este dominio al branch `staging` o `develop` (o crea un branch específico)
4. Ve a **Settings** → **Environment Variables**
5. Agrega las variables con el **Environment**: `Preview` (y opcionalmente específico para el branch)
6. **Importante:** Establece `NEXT_PUBLIC_APP_ENV=staging`

### Estructura de Branches Recomendada

```
main (o master)
  ↓ deploys to → naxine.com (APP_ENV=production)
  
staging (o develop)
  ↓ deploys to → prueba.naxine.com (APP_ENV=staging)
```

### Resumen de Variables por Entorno

| Variable | Production (naxine.com) | Preview/Staging (prueba.naxine.com) |
|----------|-------------------------|-------------------------------------|
| `NEXT_PUBLIC_APP_ENV` | `production` | `staging` |
| `NEXT_PUBLIC_API_URL` | API de producción | API de pruebas |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://naxine.com` | `https://prueba.naxine.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live key | Test key |

## 🔄 Flujo de Trabajo

### Desarrollo Local
```bash
npm run dev
# Todas las funcionalidades disponibles
```

### Desplegar a Pruebas (prueba.naxine.com)
```bash
git checkout staging
git merge develop
git push origin staging
# Vercel despliega automáticamente a prueba.naxine.com
# Todas las funcionalidades disponibles para probar
```

### Desplegar a Producción (naxine.com)
```bash
git checkout main
git merge staging
git push origin main
# Vercel despliega automáticamente a naxine.com
# Solo /proximamente y /registro-profesional visibles
```

## 🧪 Probar el Modo Producción Localmente

Si quieres probar cómo se verá la plataforma en producción (con el modo "Próximamente" activado):

```bash
# 1. Construir la aplicación en modo producción
npm run build

# 2. Iniciar el servidor en modo producción
npm start
```

Esto establecerá `NODE_ENV=production` y:
- La página principal (`/`) redirigirá a `/proximamente`
- Solo `/proximamente` y `/registro-profesional` serán accesibles
- Todas las demás rutas públicas redirigirán a `/proximamente`

Para volver al modo desarrollo:
```bash
npm run dev
```

