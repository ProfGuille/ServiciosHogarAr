import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { mercadoPagoService } from "../services/mercadoPagoService.js";
import { webhookService } from "../services/webhookService.js";
import { validateMercadoPagoWebhook, extractWebhookHeaders } from "../utils/webhookValidator.js";
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { eq } from "drizzle-orm";

const router = Router();

// Mapeo de packageId a créditos
const PACKAGE_TO_CREDITS: any = {
  "basico": 10,
  "popular": 50,
  "premium": 100,
  "1": 10,
  "2": 50,
  "3": 100
};

router.post("/create", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: "Falta packageId" });
    }

    const credits = PACKAGE_TO_CREDITS[packageId];
    
    if (!credits) {
      return res.status(400).json({ error: "Paquete no válido" });
    }

    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId))
      .limit(1);

    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const pref = await mercadoPagoService.createPreference(provider.id, credits);
    
    res.json(pref);
  } catch (err: any) {
    console.error("Error en /payments/mp/create:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /webhook - Mercado Pago hace un GET inicial para verificar
 * que el endpoint existe
 */
router.get("/webhook", (req, res) => {
  console.log("✅ Webhook verificado por Mercado Pago (GET)");
  res.sendStatus(200);
});

/**
 * POST /webhook - Endpoint que recibe notificaciones de Mercado Pago
 * 
 * SEGURIDAD:
 * - Valida firma HMAC con MP_WEBHOOK_SECRET
 * - Registra todos los webhooks en webhook_events
 * - Usa función atómica de BD para prevenir duplicados
 * - Idempotente: múltiples llamadas con mismo payment_id no duplican créditos
 */
router.post("/webhook", async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log("📨 Webhook recibido de Mercado Pago");
    console.log("Headers:", {
      xSignature: req.headers['x-signature'] ? 'presente' : 'ausente',
      xRequestId: req.headers['x-request-id'] ? 'presente' : 'ausente',
    });
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // 1. REGISTRAR webhook recibido (auditoría)
    const webhookRecord = await webhookService.registerWebhook(
      req.body.type || 'unknown',
      req.body
    );
    console.log(`📝 Webhook registrado con ID: ${webhookRecord.id}`);

    // 2. VALIDAR firma HMAC
    const { xSignature, xRequestId } = extractWebhookHeaders(req);
    const dataId = req.body.data?.id;

    const validation = validateMercadoPagoWebhook(xSignature, xRequestId, dataId);

    if (!validation.isValid) {
      console.error(`🔒 Webhook rechazado: ${validation.error}`);
      // IMPORTANTE: Respondemos 200 para que MP no reintente
      // pero NO procesamos el webhook
      return res.status(200).json({ 
        received: true, 
        processed: false, 
        reason: validation.error 
      });
    }

    console.log("✅ Firma HMAC validada correctamente");

    // 3. PROCESAR webhook con función atómica
    const result = await mercadoPagoService.processWebhook(req.body, dataId);

    const duration = Date.now() - startTime;
    console.log(`⏱️ Webhook procesado en ${duration}ms`);

    // 4. SIEMPRE responder 200 a Mercado Pago
    // Si respondemos error, MP reintentará y podríamos duplicar
    res.status(200).json({
      received: true,
      processed: result.processed,
      duplicate: result.duplicate,
      webhookId: webhookRecord.id,
      duration,
    });

  } catch (err) {
    console.error("❌ Error en webhook MP:", err);
    
    // IMPORTANTE: Incluso en error, responder 200
    // El webhook ya está registrado en webhook_events para debugging
    res.status(200).json({
      received: true,
      processed: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

export default router;
