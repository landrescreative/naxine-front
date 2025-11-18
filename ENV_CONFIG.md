# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno para el frontend de Naxine.

## Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# API Configuration
# URL base de la API backend (DEBE incluir /api al final)
# En desarrollo local: http://localhost:3000/api
# En producción: https://api.naxine.com/api
NEXT_PUBLIC_API_URL=https://api.naxine.com/api

# Timeout para peticiones a la API (en milisegundos)
NEXT_PUBLIC_API_TIMEOUT=15000

# Stripe Configuration
# Clave pública de Stripe (obtener desde Stripe Dashboard)
# Modo producción: pk_live_xxxxxxxxxxxxx
# Modo prueba: pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Frontend URL (para redirecciones y enlaces)
NEXT_PUBLIC_FRONTEND_URL=https://naxine.com

# Backend URL (para casos especiales, sin /api al final)
# Normalmente igual a NEXT_PUBLIC_API_URL pero sin /api
NEXT_PUBLIC_BACKEND_URL=https://api.naxine.com
```

## Configuración por Entorno

### Desarrollo Local

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### Producción

```env
NEXT_PUBLIC_API_URL=https://api.naxine.com/api
NEXT_PUBLIC_FRONTEND_URL=https://naxine.com
NEXT_PUBLIC_BACKEND_URL=https://api.naxine.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

## Notas Importantes

1. **NEXT_PUBLIC_API_URL**: Esta variable DEBE incluir `/api` al final. El código asume que esta URL ya incluye el prefijo `/api`.

2. **Variables NEXT_PUBLIC_**: En Next.js, solo las variables que empiezan con `NEXT_PUBLIC_` están disponibles en el navegador. Las variables sin este prefijo solo están disponibles en el servidor.

3. **Archivo .env.local**: Este archivo está en `.gitignore` y no se commitea al repositorio. Cada desarrollador debe crear su propio archivo.

4. **Despliegue**: En producción (Vercel, AWS, etc.), configura estas variables en el panel de configuración de tu plataforma de despliegue.

## Verificación

Después de configurar las variables, reinicia el servidor de desarrollo:

```bash
npm run dev
```

Puedes verificar que las variables se están cargando correctamente revisando la consola del navegador en modo desarrollo.

