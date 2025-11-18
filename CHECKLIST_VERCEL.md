# Checklist de Despliegue en Vercel

## ✅ Estado del Proyecto

El proyecto está **listo para desplegar en Vercel** después de los siguientes ajustes realizados:

### Cambios Realizados

1. ✅ **next.config.ts**: Se removió `output: "standalone"` que es específico para Docker. Vercel maneja el build automáticamente.

## 📋 Checklist Pre-Despliegue

### 1. Variables de Entorno en Vercel

Configura las siguientes variables de entorno en el panel de Vercel (Settings → Environment Variables):

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.naxine.com/api
NEXT_PUBLIC_API_TIMEOUT=15000

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=https://naxine.com

# Backend URL (sin /api)
NEXT_PUBLIC_BACKEND_URL=https://api.naxine.com
```

**Importante**: 
- Reemplaza `https://api.naxine.com` con tu URL real del backend
- Reemplaza `https://naxine.com` con tu dominio de Vercel o dominio personalizado
- Usa la clave pública de Stripe de producción (`pk_live_...`)

### 2. Configuración del Proyecto en Vercel

1. **Framework Preset**: Next.js (se detecta automáticamente)
2. **Root Directory**: `naxine-front` (si el proyecto está en un monorepo)
3. **Build Command**: `npm run build` (por defecto)
4. **Output Directory**: `.next` (por defecto)
5. **Install Command**: `npm install` (por defecto)

### 3. Verificaciones Adicionales

- ✅ **package.json**: Scripts de build configurados correctamente
- ✅ **tsconfig.json**: Configuración TypeScript válida
- ✅ **middleware.ts**: Middleware de autenticación configurado
- ✅ **next.config.ts**: Configuración compatible con Vercel
- ✅ **.gitignore**: Incluye `.vercel` y archivos de entorno

### 4. Dominio y SSL

- Vercel proporciona SSL automático
- Puedes configurar un dominio personalizado en Settings → Domains
- Asegúrate de que el dominio apunte correctamente a Vercel

### 5. CORS y Backend

- Verifica que tu backend permita requests desde el dominio de Vercel
- Si usas un dominio personalizado, agrégalo a la lista de orígenes permitidos en el backend

## 🚀 Pasos para Desplegar

1. **Conectar el repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub/GitLab/Bitbucket
   - Selecciona el directorio `naxine-front` si está en un monorepo

2. **Configurar variables de entorno**:
   - En el panel de Vercel, ve a Settings → Environment Variables
   - Agrega todas las variables listadas arriba
   - Asegúrate de configurarlas para Production, Preview y Development según corresponda

3. **Desplegar**:
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará automáticamente
   - Revisa los logs de build para verificar que no hay errores

4. **Verificar el despliegue**:
   - Prueba las rutas principales
   - Verifica que las llamadas a la API funcionen
   - Prueba el flujo de autenticación
   - Verifica que las imágenes se carguen correctamente

## 🔍 Troubleshooting

### Error: "Module not found"
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `node_modules` no esté en el repositorio

### Error: "Environment variable not found"
- Verifica que todas las variables `NEXT_PUBLIC_*` estén configuradas en Vercel
- Reinicia el deployment después de agregar variables de entorno

### Error: "Build failed"
- Revisa los logs de build en Vercel
- Verifica que no haya errores de TypeScript
- Asegúrate de que el Node.js version sea compatible (Vercel usa Node 20 por defecto)

### Problemas con imágenes
- Verifica que los dominios remotos estén configurados en `next.config.ts`
- Asegúrate de que las URLs de imágenes sean HTTPS

## 📝 Notas Importantes

1. **Docker vs Vercel**: El proyecto tiene un `Dockerfile` para despliegues en Docker, pero para Vercel no es necesario. Vercel maneja el build y deployment automáticamente.

2. **Variables de Entorno**: Solo las variables que empiezan con `NEXT_PUBLIC_` están disponibles en el navegador. Las demás solo están disponibles en el servidor.

3. **Middleware**: El middleware de autenticación funciona correctamente en Vercel. Las cookies se manejan automáticamente.

4. **Build Time**: El primer build puede tardar varios minutos. Los builds subsecuentes son más rápidos gracias al caché de Vercel.

## ✅ Verificación Final

Antes de considerar el despliegue completo, verifica:

- [ ] El build se completa sin errores
- [ ] La página principal carga correctamente
- [ ] El login funciona
- [ ] Las llamadas a la API funcionan
- [ ] Las imágenes se cargan correctamente
- [ ] El middleware protege las rutas del dashboard
- [ ] Stripe está configurado correctamente (si aplica)
- [ ] Los enlaces y redirecciones funcionan

---

**Última actualización**: Después de remover `output: "standalone"` del `next.config.ts`

