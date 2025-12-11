# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno para el frontend de Naxine.

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
# API Configuration - CONECTA A TU API LOCAL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=15000

# Stripe (usar keys de prueba)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# SendGrid (para formulario de alta de profesionales)
# ⚠️ Estas variables son del servidor (NO NEXT_PUBLIC_) y solo están disponibles en API routes
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_TO_EMAIL=admin@tudominio.com  # Email donde se recibirán las solicitudes (opcional, por defecto usa SENDGRID_FROM_EMAIL)
```

**⚠️ Importante:** 
- Asegúrate de que tu API local esté corriendo en el puerto 3000
- Si cambias el puerto de la API, actualiza `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_BACKEND_URL`

### 🌐 Producción (Vercel)

**Configuración:** Panel de Vercel → Settings → Environment Variables

```env
# API Configuration - CONECTA A TU API EN AWS
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
NEXT_PUBLIC_FRONTEND_URL=https://tudominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.tudominio.com
NEXT_PUBLIC_API_TIMEOUT=15000

# Stripe (usar keys de producción)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# SendGrid (para formulario de alta de profesionales)
# ⚠️ Estas variables son del servidor (NO NEXT_PUBLIC_) y solo están disponibles en API routes
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_TO_EMAIL=admin@tudominio.com  # Email donde se recibirán las solicitudes (opcional, por defecto usa SENDGRID_FROM_EMAIL)
```

**⚠️ Importante:**
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

## 🔄 Cambiar entre Desarrollo y Producción

- **Desarrollo:** Usa `.env.local` con `http://localhost:3000/api`
- **Producción:** Vercel usa las variables configuradas en su panel (automáticamente usa la API de AWS)

No necesitas cambiar nada manualmente al desplegar. Vercel usará las variables de entorno que configuraste en su panel.

