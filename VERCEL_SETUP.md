# 🚀 Configuración de Vercel - Dos Entornos

Esta guía te ayudará a configurar dos entornos en Vercel:
- **naxine.com** (Producción) - Modo "Próximamente"
- **prueba.naxine.com** (Staging) - Funcionalidad completa

## 📋 Prerequisitos

- Proyecto ya conectado a Vercel
- Dominios configurados en tu proveedor DNS
- Acceso al panel de Vercel

## 🔧 Paso 1: Configurar Dominios en Vercel

### 1.1 Dominio de Producción (naxine.com)

1. Ve a tu proyecto en Vercel
2. Click en **Settings** → **Domains**
3. Click en **Add Domain**
4. Ingresa: `naxine.com`
5. Click en **Add**
6. Sigue las instrucciones para configurar los DNS records
7. Repite para `www.naxine.com` (opcional)

### 1.2 Dominio de Staging (prueba.naxine.com)

1. En **Settings** → **Domains**
2. Click en **Add Domain**
3. Ingresa: `prueba.naxine.com`
4. Click en **Add**
5. Configura el **Git Branch** al que estará asociado:
   - Click en el dominio recién agregado
   - Selecciona el branch: `staging` (o el nombre de tu branch de pruebas)
6. Configura los DNS records

## ⚙️ Paso 2: Configurar Variables de Entorno

### 2.1 Variables para Producción (naxine.com)

1. Ve a **Settings** → **Environment Variables**
2. Para cada variable, selecciona **Environment**: `Production`

#### Variables Requeridas para Producción:

```env
# ⚠️ CRÍTICO: Activa el modo "Próximamente"
NEXT_PUBLIC_APP_ENV=production

# URLs
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
NEXT_PUBLIC_FRONTEND_URL=https://naxine.com
NEXT_PUBLIC_BACKEND_URL=https://api.tudominio.com
NEXT_PUBLIC_SITE_URL=https://naxine.com
NEXT_PUBLIC_API_TIMEOUT=15000

# Stripe (LIVE keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@naxine.com
SENDGRID_TO_EMAIL=admin@naxine.com
```

**Cómo agregar:**
1. Click en **Add New**
2. **Name**: `NEXT_PUBLIC_APP_ENV`
3. **Value**: `production`
4. **Environments**: Selecciona SOLO `Production` ✅
5. Click en **Save**
6. Repite para cada variable

### 2.2 Variables para Staging (prueba.naxine.com)

1. Ve a **Settings** → **Environment Variables**
2. Para cada variable, selecciona **Environment**: `Preview` (y opcionalmente específico para el branch `staging`)

#### Variables Requeridas para Staging:

```env
# ⚠️ CRÍTICO: Activa funcionalidad completa
NEXT_PUBLIC_APP_ENV=staging

# URLs (apuntando a API de pruebas)
NEXT_PUBLIC_API_URL=https://api-staging.tudominio.com/api
NEXT_PUBLIC_FRONTEND_URL=https://prueba.naxine.com
NEXT_PUBLIC_BACKEND_URL=https://api-staging.tudominio.com
NEXT_PUBLIC_SITE_URL=https://prueba.naxine.com
NEXT_PUBLIC_API_TIMEOUT=15000

# Stripe (TEST keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@naxine.com
SENDGRID_TO_EMAIL=admin@naxine.com
```

**Cómo agregar:**
1. Click en **Add New** (o edita la variable existente)
2. **Name**: `NEXT_PUBLIC_APP_ENV`
3. **Value**: `staging`
4. **Environments**: Selecciona `Preview` ✅ (y opcionalmente marca el branch específico)
5. Click en **Save**
6. Repite para cada variable

## 🌿 Paso 3: Configurar Git Branches

### Estructura Recomendada:

```
main (o master)
  └─ Despliega a: naxine.com
  └─ APP_ENV: production
  └─ Comportamiento: Solo /proximamente y /registro-profesional

staging (o develop)
  └─ Despliega a: prueba.naxine.com
  └─ APP_ENV: staging
  └─ Comportamiento: Funcionalidad completa
```

### Crear Branch de Staging:

```bash
# Crear branch de staging desde main
git checkout main
git pull origin main
git checkout -b staging
git push origin staging
```

### Conectar Branch a Dominio en Vercel:

1. Ve a **Settings** → **Domains**
2. Busca `prueba.naxine.com`
3. Click en el menú de tres puntos (⋯)
4. Selecciona **Edit**
5. En **Git Branch**, selecciona: `staging`
6. Click en **Save**

## 🧪 Paso 4: Probar la Configuración

### Probar Staging (prueba.naxine.com):

```bash
# 1. Hacer un cambio en el branch staging
git checkout staging
echo "test" >> test.txt
git add test.txt
git commit -m "Test staging deployment"
git push origin staging

# 2. Vercel desplegará automáticamente
# 3. Espera 1-2 minutos

# 4. Visita https://prueba.naxine.com
# ✅ Deberías ver todas las páginas funcionando
# ✅ Puedes navegar a /servicios, /contacto, etc.
```

### Probar Producción (naxine.com):

```bash
# 1. Hacer un cambio en el branch main
git checkout main
git merge staging
git push origin main

# 2. Vercel desplegará automáticamente
# 3. Espera 1-2 minutos

# 4. Visita https://naxine.com
# ✅ Deberías ser redirigido a /proximamente
# ✅ Solo /proximamente y /registro-profesional accesibles
# ❌ Otras rutas redirigen a /proximamente
```

## 🔍 Paso 5: Verificar Variables de Entorno

### En Vercel Dashboard:

1. Ve a **Deployments**
2. Click en el último deployment de cada entorno
3. Click en los tres puntos (⋯) → **View Function Logs**
4. Busca logs que muestren `NEXT_PUBLIC_APP_ENV`

### Verificar desde el Navegador:

Puedes agregar temporalmente esto a una página para verificar:

```typescript
// En cualquier página o componente
console.log('APP_ENV:', process.env.NEXT_PUBLIC_APP_ENV);
```

Luego abre la consola del navegador (F12) y verifica el valor.

## 📊 Resumen de Configuración

| Aspecto | Producción (naxine.com) | Staging (prueba.naxine.com) |
|---------|-------------------------|----------------------------|
| **Dominio** | `naxine.com` | `prueba.naxine.com` |
| **Branch Git** | `main` | `staging` |
| **APP_ENV** | `production` | `staging` |
| **Vercel Environment** | Production | Preview |
| **Stripe Keys** | Live (`pk_live_...`) | Test (`pk_test_...`) |
| **Páginas Visibles** | Solo 2 rutas | Todas las páginas |
| **API** | Producción | Staging/Pruebas |

## ⚠️ Notas Importantes

1. **APP_ENV es crítico**: Esta variable controla todo el comportamiento. Asegúrate de configurarla correctamente.

2. **Environments en Vercel**:
   - `Production` = Branch `main` → naxine.com
   - `Preview` = Otros branches → prueba.naxine.com

3. **Redeploy después de cambiar variables**:
   - Si cambias variables de entorno en Vercel, necesitas hacer redeploy
   - Ve a **Deployments** → último deployment → tres puntos → **Redeploy**

4. **DNS propagation**: Los cambios de DNS pueden tardar hasta 24-48 horas

5. **HTTPS automático**: Vercel configura automáticamente SSL/TLS para tus dominios

## 🐛 Troubleshooting

### Problema: Staging muestra "Próximamente"
- **Causa**: `NEXT_PUBLIC_APP_ENV` está como `production` en Preview
- **Solución**: Verifica que en Variables de Entorno, `NEXT_PUBLIC_APP_ENV=staging` esté marcado para `Preview`

### Problema: Producción muestra todas las páginas
- **Causa**: `NEXT_PUBLIC_APP_ENV` no está configurado o está como `staging`
- **Solución**: Verifica que `NEXT_PUBLIC_APP_ENV=production` esté marcado para `Production`

### Problema: Variables no se actualizan
- **Causa**: Vercel necesita un nuevo deployment
- **Solución**: 
  1. Ve a **Deployments**
  2. Click en el último → tres puntos → **Redeploy**
  3. O haz un nuevo commit y push

### Problema: Dominio no funciona
- **Causa**: DNS no configurado correctamente
- **Solución**:
  1. Ve a **Settings** → **Domains**
  2. Click en el dominio
  3. Verifica que los DNS records estén configurados en tu proveedor

## 📚 Referencias

- [Vercel Domains](https://vercel.com/docs/concepts/projects/domains)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)

