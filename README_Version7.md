# Proyecto: Plataforma de Vinculación de Clientes y Proveedores

## 🚀 Estado del Despliegue

✅ **Backend**: Desplegado en Render (https://servicioshogar-backend.onrender.com)  
✅ **Base de Datos**: Desplegada en Neon PostgreSQL  
✅ **Frontend**: Listo para despliegue en Hostinger

## 📦 Despliegue en Hostinger

### Comando Rápido
```bash
./deploy-hostinger.sh
```

### Verificación
```bash
./verify-deployment.sh
```

### Documentación Completa
Ver [HOSTINGER_DEPLOYMENT_GUIDE.md](HOSTINGER_DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

## 🔧 Configuración Técnica

### Frontend
- **Framework**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: TanStack Query
- **Routing**: Wouter
- **Build**: Optimizado para Apache/Hostinger

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Despliegue**: Render

## IDs y relaciones

- Actualmente, todos los identificadores (`id`, `userId`, etc.) son **numéricos** (`serial`/`integer` en PostgreSQL).
- Esto simplifica la gestión de relaciones y queries.
- La migración a UUID/string está prevista si el proyecto escala a millones de usuarios, pero no es necesaria ahora.

## Migración a UUID

- Si el crecimiento lo requiere, se puede migrar el tipo de los campos de `integer` a `uuid` o `varchar`.
- Los servicios y rutas deben actualizarse para aceptar strings en vez de números en ese caso.

## Buenas prácticas

- Mantener consistencia de tipos en todas las claves primarias y foráneas.
- Documentar los cambios de tipo en migraciones importantes.
