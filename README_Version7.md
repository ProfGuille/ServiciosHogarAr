# Proyecto: Plataforma de Vinculación de Clientes y Proveedores

# Proyecto: Plataforma de Vinculación de Clientes y Proveedores

## 🚀 Nueva Arquitectura (2025)

✅ **Frontend**: Vercel (vercel.com)  
✅ **Backend**: Render (https://servicioshogar-backend-uje1.onrender.com)  
✅ **Base de Datos**: Neon PostgreSQL  
✅ **Email**: Zoho Mail  
✅ **DNS/CDN**: Cloudflare  

> **Migración completada**: Hostinger → Vercel + Cloudflare + Zoho

## 📦 Despliegue

### Frontend (Vercel)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Configuración Completa
Ver [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

### Configuración Legacy (Hostinger)
Ver [HOSTINGER_DEPLOYMENT_GUIDE.md](HOSTINGER_DEPLOYMENT_GUIDE.md) para referencia histórica.

## 🔧 Configuración Técnica

### Frontend
- **Framework**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: TanStack Query
- **Routing**: Wouter
- **Deploy**: Vercel (Serverless)
- **CDN**: Cloudflare

### Backend
- **Runtime**: Node.js + Express + TypeScript (ES Modules)
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Deploy**: Render
- **Email**: Zoho SMTP
- **Build**: Automatizado con corrección de imports ES Module

## IDs y relaciones

- Actualmente, todos los identificadores (`id`, `userId`, etc.) son **numéricos** (`serial`/`integer` en PostgreSQL).
- Esto simplifica la gestión de relaciones y queries.
- La migración a UUID/string está prevista si el proyecto escala a millones de usuarios, pero no es necesaria ahora.

## Migración a UUID

- Si el crecimiento lo requiere, se puede migrar el tipo de los campos de `integer` a `uuid` o `varchar`.
- Los servicios y rutas deben actualizarse para aceptar strings en vez de números en ese caso.

## Configuración del Build

### Comandos de Build
```bash
# Build completo desde la raíz
npm run build

# Build solo del backend (incluye corrección de imports)
cd backend && npm run build

# Start en producción
npm start
```

### ES Module Fix
El backend utiliza ES modules (`"type": "module"`) y cuenta con un sistema automatizado que:
- Corrige automáticamente las extensiones de imports antes de compilar
- Ejecuta `fix-import-extensions.mjs` como parte del proceso de build
- Garantiza compatibilidad con Node.js ES modules en producción

Ver [ES_MODULE_FIX.md](ES_MODULE_FIX.md) para detalles técnicos.

## Buenas prácticas

- Mantener consistencia de tipos en todas las claves primarias y foráneas.
- Documentar los cambios de tipo en migraciones importantes.
- Usar imports relativos con extensión `.js` en archivos TypeScript para compatibilidad ES module.
