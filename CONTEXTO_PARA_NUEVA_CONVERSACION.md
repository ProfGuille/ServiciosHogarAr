# CONTEXTO COMPLETO - ServiciosHogar.com.ar
## Sesión: 2026-01-09 (8+ horas de trabajo)

---

## ESTADO ACTUAL - TODO FUNCIONANDO

### Backend (100% operativo)
- ✅ Registro de proveedores: `POST /api/auth/register-provider`
- ✅ Login: `POST /api/auth/login` - Devuelve JWT válido
- ✅ Créditos balance: `GET /api/credits/balance` (requiere auth)
- ✅ Créditos paquetes: `GET /api/credits/packages`
- ✅ Crear orden MP: `POST /api/payments/mp/create` (requiere auth)
- ✅ Webhook MP: `POST /api/payments/mp/webhook`

### MercadoPago Configurado
- ✅ Token `MP_ACCESS_TOKEN` en Render
- ✅ Webhook configurado en MP Dashboard
- ✅ Aplicación: ServiciosHogar Pruebas (App ID: 8191206908497846)
- ✅ Modo: SANDBOX (testing)
- ✅ Orden de prueba creada exitosamente

### Frontend
- ✅ Registro funcionando (5 seg mensaje éxito)
- ✅ Página `/comprar-creditos` creada y con ruta agregada
- ❌ Login NO guarda token en localStorage (problema actual)

---

## PROBLEMA ACTUAL A RESOLVER

**Login no funciona correctamente:**
- Usuario hace login con credenciales correctas
- Backend devuelve token JWT válido
- Pero frontend NO guarda el token en localStorage
- Usuario no aparece como autenticado

**Archivo a revisar:** `frontend/src/pages/login.tsx`

**Usuario de prueba:**
- Email: circaireargentino+login@gmail.com  
- Password: Password123
- Token JWT válido (expira 2026-01-10):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZGViYjU1NC1mNjZiLTQxMTgtYmU0YS1lOTgzMjViYzQ3ZTIiLCJlbWFpbCI6ImNpcmNhaXJlYXJnZW50aW5vK2xvZ2luQGdtYWlsLmNvbSIsInJvbGUiOiJwcm92aWRlciIsImlhdCI6MTc2Nzk4ODcwOSwiZXhwIjoxNzY4MDc1MTA5fQ.ixcKuRR3xMYEOif5bKRM52wsKcfjWWE411bbD1ehbxA
```

---

## PRÓXIMOS PASOS

1. ✅ Arreglar `login.tsx` para que guarde token en localStorage
2. ✅ Probar flujo completo: Login → `/comprar-creditos` → Comprar → MercadoPago
3. ✅ Crear páginas de callback (compra-exitosa, compra-fallida, compra-pendiente)
4. ✅ Testing en sandbox
5. ✅ Activar producción en MercadoPago

---

## URLs Importantes
- Frontend: https://servicioshogar.com.ar
- Backend: https://api.servicioshogar.com.ar  
- Repo: https://github.com/ProfGuille/ServiciosHogarAr
- Neon DB: https://console.neon.tech
- Render: https://dashboard.render.com/web/srv-d262g5e3jp1c73cdis90
- Vercel: https://vercel.com/guilles-projects-df372bce/servicios-hogar-ar
- MercadoPago: https://www.mercadopago.com.ar/developers/panel

---

## Variables de Entorno Configuradas
**Render:**
- `MP_ACCESS_TOKEN`: APP_USR-8191206908497846-071520-... ✅
- `DATABASE_URL`: postgresql://neondb_owner:...@neon.tech ✅

**Vercel:**
- `VITE_API_URL`: https://api.servicioshogar.com.ar ✅

---

## Stack Técnico
- Frontend: React 18 + Vite + Wouter + Radix UI + TailwindCSS
- Backend: Express + TypeScript + Drizzle ORM
- BD: PostgreSQL (Neon) - sa-east-1
- Pagos: MercadoPago Checkout Pro
- Auth: JWT + bcrypt

---

## Archivos Críticos Modificados Hoy
- `backend/src/routes/auth.ts` - Login arreglado
- `backend/src/routes/credits.ts` - Nuevo
- `backend/src/routes/payments-mp.ts` - Arreglado
- `backend/src/routes/index.ts` - Rutas registradas
- `backend/src/services/mercadoPagoService.ts` - Arreglado
- `backend/src/services/paymentsService.ts` - Arreglado
- `backend/src/services/providerCreditsService.ts` - Arreglado
- `backend/src/shared/schema/users.ts` - Schema corregido
- `backend/src/shared/schema/serviceProviders.ts` - Schema corregido
- `backend/src/shared/schema/providerCredits.ts` - Schema corregido
- `backend/src/shared/schema/creditPurchases.ts` - Schema corregido
- `frontend/src/pages/register-provider.tsx` - Arreglado (sin loops)
- `frontend/src/pages/comprar-creditos.tsx` - Nuevo (creado hoy)
- `frontend/src/App.tsx` - Ruta agregada
- `frontend/src/lib/api.ts` - Helper getApiUrl
- `frontend/.env.production` - API URL configurada

---

## Schemas BD Correctos
```sql
-- users
id VARCHAR PK, email, first_name, last_name, password, user_type, created_at, updated_at

-- service_providers  
id SERIAL PK, user_id VARCHAR FK, business_name, city, phone_number, created_at, updated_at

-- provider_credits
id SERIAL PK, provider_id INT FK, current_credits, total_purchased, total_used, last_purchase_at, updated_at

-- credit_purchases
id SERIAL PK, provider_id INT FK, credits, amount DECIMAL, payment_method, mercadopago_payment_id, status, created_at
```

---

## Testing Realizado Hoy
✅ Registro proveedor → Funciona
✅ Login → Devuelve token (pero frontend no lo guarda)
✅ GET /api/credits/packages → Funciona
✅ GET /api/credits/balance → Funciona con token
✅ POST /api/payments/mp/create → Funciona, devuelve init_point
✅ Webhook configurado en MP Dashboard

---

## Datos de Prueba
- 6 usuarios registrados (todos con 10 créditos)
- 1 orden de pago creada (purchaseId: 3)
- Paquetes: Básico ($5000), Popular ($20000), Premium ($35000)

---

_Continuar desde aquí en nueva conversación_
