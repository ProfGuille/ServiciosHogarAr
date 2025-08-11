# CHECKLIST DE DESPLIEGUE - servicioshogar.com.ar

## 📋 Verificación Paso a Paso para Resolver el Problema

### ✅ PASO 1: VERIFICAR CÓDIGO LOCAL (COMPLETADO)
- [x] Frontend construye sin errores
- [x] Backend construye sin errores
- [x] Configuración presente
- [x] Scripts de diagnóstico creados

### 🔍 PASO 2: VERIFICAR HOSTINGER (CRÍTICO)

**Accede al panel de Hostinger:**
```
Panel de Control > Administrador de Archivos > public_html/
```

**Verificar archivos requeridos:**
- [ ] `index.html` (archivo principal)
- [ ] `.htaccess` (configuración de Apache)
- [ ] Carpeta `assets/` (contiene CSS, JS, imágenes)
- [ ] Los archivos tienen tamaños normales (no 0 bytes)

**Si FALTAN archivos:**
1. Ir a `frontend/` en el proyecto local
2. Ejecutar `npm run build`
3. Subir TODO el contenido de `frontend/dist/` a `public_html/`

### 🚀 PASO 3: VERIFICAR RENDER (CRÍTICO)

**Accede al dashboard de Render:**
```
render.com > Dashboard > servicioshogar-backend
```

**Verificar estado del servicio:**
- [ ] Estado: "Live" (verde)
- [ ] Último deployment: Exitoso
- [ ] No hay errores en logs recientes

**Si HAY problemas:**
1. Revisar logs de deployment
2. Verificar variables de entorno
3. Re-deployar si es necesario

### 🗄️ PASO 4: VERIFICAR NEON (IMPORTANTE)

**Accede al dashboard de Neon:**
```
console.neon.tech > tu proyecto
```

**Verificar estado de la base de datos:**
- [ ] Estado: "Active"
- [ ] Conexiones disponibles
- [ ] No hay errores en logs

### 🌍 PASO 5: VERIFICAR ACCESO PÚBLICO

**Probar URLs principales:**
- [ ] https://servicioshogar.com.ar (debe cargar el frontend)
- [ ] https://servicioshogar-backend.onrender.com/api/health (debe devolver JSON)

## 🚨 DIAGNÓSTICO RÁPIDO POR TIPO DE ERROR

### Error A: "Este sitio no puede proporcionar una conexión segura"
**Causa:** Problema de DNS/Certificado SSL  
**Verificar:**
- [ ] Configuración DNS del dominio
- [ ] Certificado SSL activo en Hostinger
- [ ] Dominio apuntando a Hostinger

### Error B: "No se puede acceder a este sitio web"
**Causa:** DNS no resuelve  
**Verificar:**
- [ ] Dominio renovado y activo
- [ ] Nameservers configurados correctamente
- [ ] Propagación DNS completada (24-48 horas)

### Error C: Página en blanco o Error 404
**Causa:** Archivos no subidos o mal ubicados  
**Verificar:**
- [ ] Archivos en `public_html/` (no en subcarpetas)
- [ ] `index.html` en la raíz de `public_html/`
- [ ] Permisos de archivos correctos (644)

### Error D: Frontend carga pero APIs no funcionan
**Causa:** Backend en Render con problemas  
**Verificar:**
- [ ] Servicio Render activo
- [ ] Variables de entorno configuradas
- [ ] Base de datos Neon conectada

## 🛠️ HERRAMIENTAS DE DIAGNÓSTICO

### Script Rápido Local
```bash
./quick-check.sh
```

### Diagnóstico Completo
```bash
node diagnostic-script.js
```

### Tests Manuales URLs
```bash
# Frontend
curl -I https://servicioshogar.com.ar

# Backend Health
curl https://servicioshogar-backend.onrender.com/api/health

# Backend Ping  
curl https://servicioshogar-backend.onrender.com/api/ping
```

## 📞 INFORMACIÓN PARA SOPORTE

**Si necesitas ayuda adicional, proporciona:**

1. **Screenshot del panel de Hostinger** (archivos en public_html/)
2. **Screenshot del dashboard de Render** (estado del servicio)
3. **Mensaje de error exacto** al acceder a servicioshogar.com.ar
4. **Resultado del script** `./quick-check.sh`

## ⚡ SOLUCIONES RÁPIDAS MÁS COMUNES

### Problema 1: Archivos no subidos a Hostinger
```bash
# En tu computadora local:
cd frontend
npm run build

# Subir TODO el contenido de dist/ a public_html/ en Hostinger
```

### Problema 2: Render backend dormido
```bash
# Acceder a cualquier URL del backend para "despertarlo":
https://servicioshogar-backend.onrender.com/api/ping
```

### Problema 3: Variables de entorno faltantes
```bash
# En Render dashboard > Environment > agregar:
DATABASE_URL=tu_url_de_neon
SESSION_SECRET=cualquier_string_aleatorio
```

### Problema 4: DNS no configurado
```bash
# En el registrar del dominio, configurar DNS:
Nameserver 1: ns1.dns-parking.com
Nameserver 2: ns2.dns-parking.com
# (O los nameservers específicos de Hostinger)
```

---

**🎯 Con este checklist, el 95% de problemas de despliegue se resuelven en menos de 30 minutos.**