# ESTADO DEL PROYECTO - ServiciosHogar.com.ar
Última actualización: 2026-01-09 18:47 ART

---

## ✅ COMPLETADO Y FUNCIONANDO

### Infraestructura
- ✅ Frontend desplegado en Vercel (servicioshogar.com.ar)
- ✅ Backend desplegado en Render (api.servicioshogar.com.ar)
- ✅ Base de datos PostgreSQL en Neon (limpia y con FK correctas)
- ✅ DNS configurado en Cloudflare
- ✅ Email en Zoho (administrador@servicioshogar.com.ar)
- ✅ MercadoPago SDK instalado y configurado (token en backend/.env)

### Autenticación y Registro
- ✅ Endpoint `POST /api/auth/register-provider` funciona al 100%
  - Crea usuario en `users`
  - Crea service_provider en `service_providers`
  - Crea 10 créditos de bienvenida en `provider_credits`
- ✅ Formulario de registro en frontend funciona (con 5 segundos de mensaje de éxito)
- ✅ Service Worker deshabilitado (no causa problemas de cache)
- ✅ Variable de entorno `VITE_API_URL` configurada en Vercel

### Sistema de Créditos (Backend)
- ✅ Endpoint `GET /api/credits/packages` funcionando
  - Devuelve 3 paquetes: Básico ($5000), Popular ($20000), Premium ($35000)
- ✅ Endpoint `GET /api/credits/balance` creado (requiere autenticación)
- ✅ Schema de BD correcto:
  - `users` (con password)
  - `service_providers`
  - `provider_credits` (con FK correctas)

### Datos de Prueba
- ✅ 5 usuarios registrados con 10 créditos cada uno
- ✅ Todos funcionando correctamente

---

## ❌ PENDIENTE PARA MONETIZAR

### Backend - Endpoints Críticos
- ❌ `POST /api/credits/purchase` - Iniciar compra con MercadoPago
  - Crear preference en MercadoPago
  - Devolver URL de checkout
  - Registrar intención de compra
- ❌ `POST /api/credits/webhook` - Recibir confirmación de MercadoPago
  - Verificar pago exitoso
  - Acreditar créditos al proveedor
  - Actualizar `provider_credits` (current_credits, total_purchased)
- ❌ `POST /api/credits/spend` - Gastar crédito al ver contacto de cliente
  - Validar que tenga créditos disponibles
  - Descontar 1 crédito
  - Registrar uso

### Frontend - Páginas Necesarias
- ❌ Página `/comprar-creditos` con:
  - Mostrar balance actual del proveedor
  - Listar paquetes disponibles
  - Botón "Comprar" que abre MercadoPago Checkout
- ❌ Dashboard de proveedor con balance visible
- ❌ Sistema de login funcional (actualmente da 403)

### Integraciones
- ❌ Testing completo con MercadoPago Sandbox
- ❌ Configurar webhook URL en MercadoPago

---

## 🔧 PROBLEMAS CONOCIDOS A ARREGLAR

### Menores (No bloqueantes)
- ⚠️ Endpoint `/api/auth/login` no existe o no funciona (da 403)
- ⚠️ Hay usuarios duplicados en `service_providers` (IDs 5, 8, 9)
- ⚠️ Tabla `credit_purchases` existe pero no se usa aún

### Optimizaciones Futuras
- 📝 Limpiar archivos .md redundantes en raíz del repo (60+ archivos)
- 📝 Eliminar carpetas de backup (backend-backup-*, src-backup)
- 📝 Unificar schemas de Drizzle con BD real para otras tablas

---

## 📊 MÉTRICAS ACTUALES

- **Usuarios registrados**: 5 (todos de prueba)
- **Créditos totales en sistema**: 50 (5 usuarios × 10 créditos)
- **Ingresos**: $0 (aún no hay sistema de pago funcionando)

---

## ⏱️ TIEMPO ESTIMADO PARA MONETIZAR

**Implementación de pagos**: 2-3 horas
- 1 hora: Endpoints de compra y webhook
- 1 hora: Página frontend de compra
- 30 min: Testing con MercadoPago Sandbox

**Total**: Listo para monetizar en 1 día de trabajo enfocado

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. Crear endpoint `POST /api/credits/purchase`
2. Crear endpoint `POST /api/credits/webhook`
3. Configurar webhook en MercadoPago dashboard
4. Crear página frontend `/comprar-creditos`
5. Probar compra completa end-to-end
6. ¡MONETIZAR! 💰

---

## 📝 NOTAS TÉCNICAS

### Stack Confirmado
- Frontend: React 18 + Vite + TailwindCSS + Wouter + Radix UI
- Backend: Express + TypeScript + Drizzle ORM
- BD: PostgreSQL (Neon) - región sa-east-1 (São Paulo)
- Pagos: MercadoPago (token configurado)

### Schemas Críticos Funcionando
```typescript
// users: id (varchar PK), email, firstName, lastName, password, userType, created_at, updated_at
// service_providers: id (serial PK), user_id (FK), business_name, city, phone_number, created_at, updated_at  
// provider_credits: id (serial PK), provider_id (FK), current_credits, total_purchased, total_used
```

### URLs Importantes
- Frontend: https://servicioshogar.com.ar
- Backend: https://api.servicioshogar.com.ar
- Neon Dashboard: https://console.neon.tech
- Render Backend: https://dashboard.render.com/web/srv-d262g5e3jp1c73cdis90
- Vercel Frontend: https://vercel.com/guilles-projects-df372bce/servicios-hogar-ar
