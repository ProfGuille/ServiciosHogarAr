# CONTEXTO COMPLETO PROYECTO SERVICIOSHOGAR.COM.AR

## INFRAESTRUCTURA DESPLEGADA
- **Frontend:** Vercel (servicioshogar.com.ar)
- **Backend:** Render (https://dashboard.render.com/web/srv-d262g5e3jp1c73cdis90)
- **Base Datos:** Neon PostgreSQL
- **DNS:** Cloudflare
- **Email:** Zoho (administrador@servicioshogar.com.ar)
- **Pagos:** MercadoPago (token configurado en backend/.env)

## STACK TÉCNICO
- Frontend: React 18 + Vite + TailwindCSS + Wouter + Radix UI
- Backend: Express + TypeScript + Drizzle ORM
- BD: PostgreSQL (Neon)

## ESTADO ACTUAL
✅ Landing page funciona
✅ 20 servicios con imágenes
✅ Formulario register-provider arreglado (sin loops infinitos)
✅ MercadoPago SDK instalado (backend/src/services/mercadoPagoService.ts)
✅ Backend con auth básico (login, register, logout)

❌ Falta endpoint /api/auth/register-provider en PRODUCCIÓN (agregado local pero Render no redployó)
❌ No hay sistema de créditos implementado
❌ No hay endpoints /api/credits/*

## MODELO DE NEGOCIO
- Proveedores compran CRÉDITOS
- 1 crédito = ver 1 contacto de cliente
- Sin comisiones (0% vs 10-15% competencia)
- Paquetes: Básico (10 créditos $5000), Popular (50/$20000), Premium (100/$35000)

## PRÓXIMOS PASOS CRÍTICOS
1. Hacer que Render deploye el endpoint register-provider
2. Crear tablas: credit_packages, provider_credits, credit_transactions
3. Crear endpoints: /api/credits/balance, /packages, /purchase, /spend, /webhook
4. Frontend: página comprar-creditos
5. Integrar MercadoPago Checkout Pro

## ARCHIVOS CLAVE
- backend/src/routes/auth.ts - tiene register, login (falta register-provider en prod)
- backend/src/routes/index.ts - registra todas las rutas
- backend/src/services/mercadoPagoService.ts - integración MP
- frontend/src/pages/register-provider.tsx - form simplificado funcionando
- backend/.env - tiene MP_ACCESS_TOKEN configurado

## REPOSITORIO
github.com/ProfGuille/ServiciosHogarAr (público)

## PROBLEMA ACTUAL
Agregué endpoint register-provider a auth.ts localmente pero Render no lo deployó.
Necesito forzar redeploy de Render o verificar por qué no detecta cambios.

## PROBLEMA CONOCIDO
Backend necesita archivo backend/src/shared/schema/payments.ts (aunque esté vacío)
Si falta, Render crashea con ERR_MODULE_NOT_FOUND

## IMPORTANTE: Schema BD
- users.id es VARCHAR (no INTEGER)
- Todas las FK a users deben ser VARCHAR, no INTEGER
