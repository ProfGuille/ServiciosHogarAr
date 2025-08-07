# Guía Completa de Despliegue en Hostinger

## 📋 Resumen del Estado Actual

✅ **Backend**: Desplegado en Render (https://servicioshogar-backend.onrender.com)  
✅ **Base de Datos**: Desplegada en Neon PostgreSQL  
✅ **Frontend**: Listo para despliegue en Hostinger

## 🚀 Instrucciones de Despliegue Paso a Paso

### 1. Preparación Local

#### 1.1 Instalar Dependencias del Frontend
```bash
cd frontend
npm install
```

#### 1.2 Construir el Frontend para Producción
```bash
npm run build
```

Este comando creará la carpeta `dist/` con todos los archivos optimizados para producción.

### 2. Configuración de Hostinger

#### 2.1 Acceso al Panel de Control
1. Ingresa a tu panel de Hostinger (hPanel)
2. Ve a **Administrador de Archivos**
3. Navega a la carpeta `public_html/`

#### 2.2 Limpiar Contenido Existente
- Elimina todo el contenido actual de `public_html/`
- Esto asegura una instalación limpia

#### 2.3 Subir Archivos
Sube **todo el contenido** de la carpeta `frontend/dist/` a `public_html/`:
- `index.html` (archivo principal)
- Carpeta `assets/` (CSS, JavaScript y recursos)
- `.htaccess` (configuración de Apache)

### 3. Configuración del Dominio

#### 3.1 DNS y SSL
- Asegúrate de que `servicioshogar.com.ar` apunte a Hostinger
- Verifica que el certificado SSL esté activo
- Configura redirection WWW si es necesario

#### 3.2 Variables de Entorno
El frontend está configurado automáticamente para usar:
- **Producción**: `https://servicioshogar-backend.onrender.com`
- **Desarrollo**: `http://localhost:5000`

## 🔧 Configuración Técnica

### Archivos Importantes Creados

#### `.htaccess` - Configuración de Apache
```apache
RewriteEngine On
RewriteBase /

# Proxy para rutas de API
RewriteCond %{REQUEST_URI} ^/api/(.*)$ [NC]
RewriteRule ^api/(.*)$ https://servicioshogar-backend.onrender.com/api/$1 [P,L]

# Manejo de routing para SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Compresión y headers de seguridad incluidos
```

#### `package.json` - Dependencias y Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

#### Variables de Entorno
- `.env.production`: Configuración para Hostinger
- `.env.development`: Configuración para desarrollo local

### Configuración de Vite
- **Alias de imports**: Configurados para `@/`, `@shared/`, `@assets/`
- **Build output**: Optimizado para Apache
- **Proxy de desarrollo**: Configurado para backend local

## 🧪 Verificación Post-Despliegue

### Checklist de Funcionalidad
- [ ] Página principal carga correctamente
- [ ] Navegación entre páginas funciona (SPA routing)
- [ ] Conexión con backend API responde
- [ ] Búsqueda de servicios funciona
- [ ] Autenticación de usuarios opera
- [ ] Formularios envían datos correctamente

### URLs de Prueba
```
Frontend: https://servicioshogar.com.ar
API Test: https://servicioshogar.com.ar/api/services
Backend Direct: https://servicioshogar-backend.onrender.com/api/services
```

## 🛠️ Comandos de Desarrollo

### Desarrollo Local
```bash
# Ejecutar frontend en modo desarrollo
cd frontend
npm run dev

# Construir para producción
npm run build

# Previsualizar build
npm run preview

# Verificar tipos TypeScript
npm run typecheck
```

### Actualizar Deployment
```bash
# 1. Hacer cambios en el código
# 2. Construir nueva versión
npm run build

# 3. Subir contenido de dist/ a public_html/
```

## 🔍 Solución de Problemas

### Si la aplicación no carga:
1. Verificar que `.htaccess` esté en la raíz de `public_html/`
2. Comprobar que el certificado SSL esté activo
3. Revisar logs de error de Hostinger
4. Verificar que `index.html` esté en la raíz

### Si las APIs no funcionan:
1. Verificar que el backend en Render esté activo
2. Comprobar CORS en el backend para permitir el dominio
3. Verificar variables de entorno en el backend
4. Probar endpoints directamente: `https://servicioshogar-backend.onrender.com/api/services`

### Si hay errores 404:
1. Confirmar que `.htaccess` incluye reglas de reescritura
2. Verificar que `mod_rewrite` esté habilitado en Hostinger
3. Comprobar permisos de archivos (644 para archivos, 755 para carpetas)

### Si el sitio carga lento:
1. Verificar que la compresión esté activada (configurada en `.htaccess`)
2. Comprobar que los headers de cache estén funcionando
3. Considerar usar CDN si es necesario

## 📊 Información Técnica

### Arquitectura de la Aplicación
```
Frontend (Hostinger) → Backend (Render) → Database (Neon)
     ↓                        ↓               ↓
Apache/PHP Server    Node.js/Express    PostgreSQL
```

### Tecnologías Utilizadas
- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Estado**: TanStack Query
- **Routing**: Wouter
- **Build**: Vite + Rollup

### Archivos de Configuración
- `vite.config.ts` - Configuración de build
- `tailwind.config.ts` - Configuración de estilos
- `tsconfig.json` - Configuración de TypeScript
- `.htaccess` - Configuración de Apache

## 📞 Soporte y Contacto

### URLs de Servicios
- **Frontend**: https://servicioshogar.com.ar
- **Backend**: https://servicioshogar-backend.onrender.com
- **Database**: Neon PostgreSQL (configurado en backend)

### Monitoreo
- Backend status: Render dashboard
- Frontend status: Hostinger uptime
- Database status: Neon console

---

## ✅ Checklist Final de Despliegue

- [ ] Frontend construido sin errores
- [ ] Archivos subidos a Hostinger `public_html/`
- [ ] `.htaccess` configurado correctamente
- [ ] DNS y SSL configurados para `servicioshogar.com.ar`
- [ ] Verificación de conectividad con backend
- [ ] Pruebas de funcionalidad principales
- [ ] Verificación de analytics y tracking

**¡El sistema está listo para producción en Hostinger!**