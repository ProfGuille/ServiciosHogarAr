# Configuración de Variables de Entorno en Render

Este documento describe cómo configurar las variables de entorno necesarias en Render para que la aplicación funcione con todas sus características.

## Variables Requeridas

Estas variables son esenciales para el funcionamiento básico:

### 1. DATABASE_URL
- **Descripción**: URL de conexión a la base de datos PostgreSQL/Neon
- **Ejemplo**: `postgresql://user:password@host:5432/database`
- **Configuración en Render**: Conectar con Neon u otra base de datos PostgreSQL

### 2. SESSION_SECRET
- **Descripción**: Clave secreta para firmar las sesiones de usuario
- **Valor recomendado**: String aleatorio de al menos 32 caracteres
- **Ejemplo**: `mi-clave-super-secreta-para-sesiones-12345`

## Variables Opcionales para Funcionalidad Completa

### Servicio de Email (SMTP)

#### 3. SMTP_HOST
- **Descripción**: Servidor SMTP para envío de emails
- **Ejemplo**: `smtp.gmail.com` o `smtp.mailgun.org`

#### 4. SMTP_USER
- **Descripción**: Usuario/email para autenticación SMTP
- **Ejemplo**: `tu-email@gmail.com`

#### 5. SMTP_PASS
- **Descripción**: Contraseña o app password para SMTP
- **Nota**: Para Gmail, usar "App Passwords"

#### 6. EMAIL_FROM
- **Descripción**: Email que aparece como remitente
- **Ejemplo**: `noreply@servicioshogar.com.ar`

### Push Notifications (Web Push)

#### 7. VAPID_PUBLIC_KEY
- **Descripción**: Clave pública VAPID para notificaciones push
- **Generación**: Usar web-push CLI o servicios online

#### 8. VAPID_PRIVATE_KEY
- **Descripción**: Clave privada VAPID para notificaciones push
- **Generación**: Usar web-push CLI o servicios online

#### 9. VAPID_EMAIL
- **Descripción**: Email de contacto para el servicio VAPID
- **Ejemplo**: `admin@servicioshogar.com.ar`

## Configuración en Render

1. Ve a tu servicio en Render Dashboard
2. Click en "Environment"
3. Agrega cada variable con su valor correspondiente
4. Redeploy el servicio

## Estados de la Aplicación

### ✅ Funcionalidad Completa
- Todas las variables configuradas
- Base de datos conectada
- Email y push notifications funcionando

### ⚠️ Modo Limitado
- Falta SESSION_SECRET o DATABASE_URL
- Funcionalidad básica disponible
- Sesiones en memoria (no persistentes)

### 📧 Email/Push Limitado
- Faltan variables SMTP o VAPID
- API funciona completamente
- Sin notificaciones por email/push

## Generación de Claves VAPID

Para generar las claves VAPID para push notifications:

```bash
npx web-push generate-vapid-keys
```

## Troubleshooting

### Error 42710 en PostgreSQL
- Este error aparece cuando las constraints ya existen
- Es normal en re-deployments
- La aplicación continúa funcionando correctamente

### "Variables de entorno faltantes"
- Verifica que todas las variables requeridas estén configuradas
- Redeploy después de agregar variables
- Consulta logs para ver qué específicamente falta

### "Modo limitado"
- Configura al menos DATABASE_URL y SESSION_SECRET
- Las variables opcionales pueden agregarse gradualmente