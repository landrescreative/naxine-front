# 🚀 Configuración Rápida para Desarrollo Local

Esta guía te ayudará a conectar el frontend a tu API local en minutos.

## 📋 Pasos Rápidos

### 1. Crear archivo de configuración local

```bash
# Desde la raíz del proyecto
cd naxine-front

# Copiar el archivo de ejemplo
cp env.example .env.local
```

### 2. Verificar que tu API local esté corriendo

Asegúrate de que tu API esté corriendo en el puerto 3000:

```bash
# Desde la raíz del proyecto
cd Api-Nexine-cal

# Si usas Node.js directamente
npm start
# O si usas Docker
docker-compose up
```

Verifica que la API responda:
```bash
curl http://localhost:3000/api/health
```

### 3. Configurar el frontend

El archivo `.env.local` ya debería estar configurado correctamente con:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Si necesitas editarlo, abre `naxine-front/.env.local` y verifica que tenga:
- `NEXT_PUBLIC_API_URL=http://localhost:3000/api` ✅
- `NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001` ✅
- `NEXT_PUBLIC_BACKEND_URL=http://localhost:3000` ✅

### 4. Iniciar el frontend

```bash
cd naxine-front
npm run dev
```

El frontend debería iniciarse en `http://localhost:3001` y conectarse automáticamente a tu API local en `http://localhost:3000/api`.

## ✅ Verificación

1. **API local funcionando:**
   - Abre `http://localhost:3000/api/health` en tu navegador
   - Deberías ver: `{"status":"ok",...}`

2. **Frontend conectado:**
   - Abre `http://localhost:3001` en tu navegador
   - Abre la consola del navegador (F12)
   - Verifica que las peticiones vayan a `http://localhost:3000/api`

## 🔄 Cambiar entre Desarrollo y Producción

- **Desarrollo local:** Usa `.env.local` (ya configurado para localhost)
- **Producción (Vercel):** Las variables se configuran en el panel de Vercel y apuntan automáticamente a AWS

**No necesitas cambiar nada manualmente al desplegar.** Vercel usará las variables de entorno que configuraste en su panel.

## 🐛 Troubleshooting

### El frontend no se conecta a la API local

1. **Verifica que la API esté corriendo:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Verifica el archivo `.env.local`:**
   ```bash
   cat naxine-front/.env.local
   ```
   Debe contener: `NEXT_PUBLIC_API_URL=http://localhost:3000/api`

3. **Reinicia el servidor de desarrollo:**
   ```bash
   # Detén el servidor (Ctrl+C) y vuelve a iniciarlo
   cd naxine-front
   npm run dev
   ```

4. **Verifica en el navegador:**
   - Abre la consola (F12)
   - Busca errores de CORS o conexión
   - Verifica en la pestaña "Network" que las peticiones vayan a `localhost:3000`

### La API está en otro puerto

Si tu API corre en un puerto diferente (por ejemplo, 3002), edita `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
```

### Problemas de CORS

Si ves errores de CORS, verifica que tu API tenga configurado:

```javascript
// En Api-Nexine-cal/server.js
const allowedOrigins = [
  "http://localhost:3001", // Frontend local
  // ... otros orígenes
];
```

## 📚 Más Información

- Ver [ENV_CONFIG.md](./ENV_CONFIG.md) para detalles completos sobre variables de entorno
- Ver [README.md](./README.md) para información general del proyecto

