
Markdown
# Guía de Despliegue para Hostinger - serviciosHogar.com.ar

## Resumen del Estado Actual

✅ **Backend**: Desplegado en Render  
✅ **Base de Datos**: Desplegada en Neon  
🔄 **Frontend**: Listo para despliegue en Hostinger

## Instrucciones de Despliegue del Frontend

### 1. Construcción del Frontend

```bash
cd frontend
npm install
npm run build
2. Preparación de Archivos para Hostinger
Los archivos generados se encuentran en la carpeta frontend/dist/:

index.html - Archivo principal
assets/ - CSS, JavaScript y otros recursos
.htaccess - Configuración de Apache para SPA
3. Subir Archivos a Hostinger
Acceder al Panel de Control de Hostinger

Ir a hPanel → Administrador de Archivos
Navegar a public_html/
Subir los Archivos

Eliminar cualquier contenido existente en public_html/
Subir todo el contenido de la carpeta frontend/dist/
Subir también el archivo frontend/.htaccess
4. Configuración del Dominio
Asegurar que serviciosHogar.com.ar esté correctamente configurado:

DNS apuntando a Hostinger
Certificado SSL habilitado
WWW redirect configurado (opcional)
5. Variables de Entorno
El frontend está configurado para usar automáticamente:

Producción: https://servicioshogar-backend.onrender.com (Render)
Desarrollo: http://localhost:5000
6. Verificación Post-Despliegue
Verificar Funcionalidad Básica:

✅ Página principal carga correctamente
✅ Navegación entre páginas funciona
✅ Búsqueda de servicios responde
✅ Conexión con backend API funciona
Verificar APIs:

✅ /api/services - Lista de servicios
✅ /api/auth/user - Autenticación
✅ /api/search - Búsqueda
Estructura de URLs de la Aplicación
Backend (Render)
URL: https://servicioshogar-backend.onrender.com
API Base: https://servicioshogar-backend.onrender.com/api
Frontend (Hostinger)
URL Principal: https://serviciosHogar.com.ar
Páginas:
/ - Landing page
/services - Lista de servicios
/search - Búsqueda avanzada
/profile - Perfil de usuario
/dashboard - Panel de proveedor
Base de Datos (Neon)
Conexión: Configurada en backend a través de variables de entorno
Archivos Importantes Creados/Modificados
frontend/package.json - Dependencias y scripts del frontend
frontend/.env.production - Variables de producción
frontend/.env.development - Variables de desarrollo
frontend/.htaccess - Configuración de Apache para SPA
frontend/src/lib/queryClient.ts - Cliente API configurado para URLs dinámicas
frontend/src/hooks/useAnalytics.ts - Analytics configurado para producción
Comandos de Desarrollo
bash
# Desarrollo local
cd frontend
npm run dev

# Construcción para producción
npm run build

# Previsualización del build
npm run preview

# Verificación de tipos
npm run typecheck
Solución de Problemas
Si la aplicación no carga:
Verificar que .htaccess esté en la raíz del dominio
Comprobar que el certificado SSL esté activo
Revisar los logs de error de Hostinger
Si las APIs no funcionan:
Verificar que el backend en Render esté activo
Comprobar CORS en el backend para permitir el dominio
Verificar variables de entorno en .env.production
Si hay errores 404:
Confirmar que .htaccess incluye reglas de reescritura
Verificar que mod_rewrite esté habilitado en Hostinger
Contacto y Soporte
Backend URL: https://servicioshogar-backend.onrender.com
Database: Neon (configurado)
Frontend URL: https://serviciosHogar.com.ar (pendiente de subida)
Checklist Final de Despliegue
 Build del frontend completado sin errores
 Archivos subidos a Hostinger public_html/
 .htaccess configurado correctamente
 DNS y SSL configurados para serviciosHogar.com.ar
 Verificación de conectividad con backend
 Pruebas de funcionalidad principales
 Verificación de analytics y tracking
¡El frontend está listo para despliegue en Hostinger!

Code

**FIN DEL ARCHIVO**
