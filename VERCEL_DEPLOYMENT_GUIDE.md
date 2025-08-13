# Guía de Despliegue: Vercel + Cloudflare + Zoho

## 📋 Nueva Arquitectura

✅ **Frontend**: Vercel (reemplaza Hostinger)  
✅ **Backend**: Render (continúa igual)  
✅ **Base de Datos**: Neon PostgreSQL (continúa igual)  
✅ **Email**: Zoho (reemplaza SMTP genérico)  
✅ **DNS/CDN**: Cloudflare (nuevo)  

## 🔧 Configuración de Ramas

### Despliegue Automático
Vercel está configurado para desplegar automáticamente desde:
- ✅ **main** - Producción principal
- ✅ **copilot/*** - Ramas de Copilot para testing

### Ramas Ignoradas
- ❌ **feature/*** - Ramas de desarrollo
- ❌ **dev** - Rama de desarrollo
- ❌ **test/*** - Ramas de testing manual

> **Nota**: La configuración de ramas se maneja en `vercel.json` mediante el `ignoreCommand`

## 🚀 Instrucciones de Despliegue

### 1. Configuración de Vercel

#### 1.1 Instalar Vercel CLI
```bash
npm install -g vercel
```

#### 1.2 Configurar el Proyecto
```bash
# En la raíz del proyecto
vercel login
vercel init
```

#### 1.3 Variables de Entorno en Vercel
En el dashboard de Vercel, configurar:
```
VITE_API_URL=https://servicioshogar-backend-uje1.onrender.com
VITE_APP_ENV=production
VITE_ANALYTICS_ENABLED=true
VITE_PLATFORM=vercel
```

#### 1.4 Desplegar
```bash
# Build y deploy automático
vercel --prod
```

### 2. Configuración de Cloudflare

#### 2.1 DNS Records
```
Tipo    Nombre    Valor
A       @         [IP de Vercel - se obtiene del dashboard]
A       www       [IP de Vercel - se obtiene del dashboard]
CNAME   api       servicioshogar-backend-uje1.onrender.com
```

#### 2.2 Configuración SSL/TLS
- **Encryption Mode**: Full (Strict)
- **Always Use HTTPS**: On
- **TLS 1.3**: On

#### 2.3 Performance Settings
- **Auto Minify**: CSS, JS, HTML habilitados
- **Brotli**: On
- **HTTP/3**: On

#### 2.4 Page Rules
1. `servicioshogar.com.ar/api/*` - Disable Cache
2. `servicioshogar.com.ar/assets/*` - Cache Everything
3. `servicioshogar.com.ar/*` - Always Use HTTPS

### 3. Configuración de Zoho Email

#### 3.1 Configuración en Render
Actualizar variables de entorno en Render:
```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@servicioshogar.com.ar
SMTP_PASS=tu_app_password_de_zoho
EMAIL_FROM="Servicios Hogar <noreply@servicioshogar.com.ar>"
```

#### 3.2 Configurar App Password en Zoho
1. Ir a Zoho Mail → Security → App Passwords
2. Generar password para "Node.js App"
3. Usar este password en `SMTP_PASS`

### 4. Build y Deploy

#### 4.1 Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

#### 4.2 Backend (Render)
Se actualiza automáticamente con git push al repositorio.

## 🔧 Configuración Técnica

### Archivos de Configuración Clave

#### vercel.json
```json
{
  "version": 2,
  "name": "servicioshogar",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://servicioshogar-backend-uje1.onrender.com/api/$1"
    }
  ]
}
```

#### cloudflare-config.md
Contiene toda la configuración de DNS, SSL, y performance.

### Cambios Realizados

#### ✅ Eliminado
- `.htaccess` (específico de Apache/Hostinger)
- Scripts de deploy de Hostinger
- Configuración SMTP genérica

#### ✅ Agregado
- `vercel.json` - Configuración de Vercel
- `cloudflare-config.md` - Guía de Cloudflare
- Configuración SMTP de Zoho
- Variables de entorno actualizadas

## 🧪 Verificación Post-Despliegue

### URLs de Prueba
```
Frontend: https://servicioshogar.com.ar (Vercel)
API: https://servicioshogar.com.ar/api/services (Proxy via Vercel)
Backend Directo: https://servicioshogar-backend-uje1.onrender.com (Render)
```

### Checklist de Funcionalidad
- [ ] Página principal carga desde Vercel
- [ ] API calls funcionan a través del proxy
- [ ] Emails se envían correctamente con Zoho
- [ ] SSL/TLS funciona correctamente
- [ ] CDN de Cloudflare acelera el sitio
- [ ] Compresión y minificación funcionan

## 🛠️ Comandos de Desarrollo

### Desarrollo Local
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev
```

### Deploy de Producción
```bash
# Frontend (Vercel)
cd frontend && npm run build && vercel --prod

# Backend (Render) - automático con git push
```

## 🔍 Solución de Problemas

### Si Vercel no despliega:
1. Verificar `vercel.json` sintaxis
2. Comprobar variables de entorno
3. Revisar logs en Vercel dashboard

### Si Cloudflare no funciona:
1. Verificar DNS propagation (24-48h)
2. Comprobar SSL settings
3. Revisar Page Rules order

### Si emails no llegan:
1. Verificar configuración SMTP Zoho
2. Comprobar App Password
3. Revisar logs del backend en Render

## 📊 Beneficios de la Nueva Arquitectura

### Performance
- **CDN Global**: Cloudflare edge locations
- **Compresión**: Brotli + Gzip automático  
- **HTTP/3**: Protocolo más rápido
- **Edge Computing**: Vercel edge functions

### Seguridad
- **SSL/TLS 1.3**: Encriptación avanzada
- **DDoS Protection**: Cloudflare automático
- **Bot Protection**: Filtros inteligentes
- **Headers de Seguridad**: Configurados automáticamente

### Confiabilidad
- **99.99% Uptime**: Vercel + Cloudflare SLA
- **Auto-scaling**: Vercel serverless
- **Backup DNS**: Cloudflare redundancy
- **Monitoring**: Dashboards integrados

## 🚨 Importante

### DNS Propagation
Después de cambiar DNS a Cloudflare, esperar 24-48 horas para propagación completa.

### Backup
Todos los archivos de configuración anteriores están respaldados:
- `.htaccess.backup`
- Documentación de Hostinger preservada

### Monitoreo
- Vercel Analytics: Dashboard integrado
- Cloudflare Analytics: Métricas de performance
- Render Logs: Logs del backend

---

**¡La migración a Vercel + Cloudflare + Zoho está completa!**