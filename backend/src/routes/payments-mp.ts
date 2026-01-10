import { Router } from "express";
import { mercadoPagoService } from "../services/mercadoPagoService";
import { validateMercadoPagoWebhook } from "../utils/webhookValidator";
import { webhookService } from "../services/webhookService";

const router = Router();

// GET para que MP verifique el endpoint
router.get("/webhook", (req, res) => {
  console.log("✅ Webhook verificado por Mercado Pago (GET)");
  res.sendStatus(200);
});

// POST para recibir notificaciones
router.post("/webhook", async (req, res) => {
  try {
    console.log("📨 Webhook recibido de Mercado Pago");
    
    const xSignature = req.headers["x-signature"] as string;
    const xRequestId = req.headers["x-request-id"] as string;
    
    console.log("Headers:", {
      xSignature: xSignature ? "presente" : "ausente",
      xRequestId: xRequestId ? "presente" : "ausente"
    });
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // Extraer información básica
    const body = req.body;
    const paymentId = body.data?.id;
    const webhookType = body.type || body.topic || "unknown";

    // Registrar webhook (solo log, sin BD)
    const webhookId = await webhookService.registerWebhook({
      type: webhookType,
      paymentId,
      rawData: body
    });

    console.log(`📝 Webhook registrado con ID: ${webhookId}`);

    // ⚠️ CAMBIO CRÍTICO: Validar HMAC solo si MP_WEBHOOK_SECRET existe
    const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;
    
    if (MP_WEBHOOK_SECRET) {
      // Si existe el secret, validar HMAC
      if (!xSignature) {
        console.log("🔒 Webhook rechazado: Header x-signature faltante");
        return res.json({ 
          received: true, 
          processed: false, 
          reason: "Header x-signature faltante" 
        });
      }

      const dataId = body.data?.id || body.id;
      if (!dataId) {
        console.log("🔒 Webhook rechazado: data.id faltante en el body");
        return res.json({ 
          received: true, 
          processed: false, 
          reason: "data.id faltante en el body" 
        });
      }

      const validation = validateMercadoPagoWebhook(xSignature, xRequestId, dataId);
      
      if (!validation.isValid) {
        console.log("🔒 Webhook rechazado: Firma HMAC inválida - webhook potencialmente falso");
        return res.json({ 
          received: true, 
          processed: false, 
          reason: validation.error || "Firma HMAC inválida" 
        });
      }

      console.log("✅ Webhook HMAC validado correctamente");
    } else {
      // Si NO existe el secret, solo advertir pero procesar igual
      console.log("⚠️ MP_WEBHOOK_SECRET no configurado - procesando sin validación HMAC (INSEGURO)");
    }

    // Procesar webhook
    await mercadoPagoService.processWebhook(body);

    console.log("✅ Webhook procesado exitosamente");
    res.json({ 
      received: true, 
      processed: true,
      webhookId 
    });

  } catch (error: any) {
    console.error("❌ Error procesando webhook:", error);
    res.status(500).json({ 
      received: true, 
      processed: false, 
      error: error.message 
    });
  }
});

// Otros endpoints existentes...
router.post("/create", async (req, res) => {
  try {
    const { providerId, packageType } = req.body;
    const preference = await mercadoPagoService.createPreference(providerId, packageType);
    res.json(preference);
  } catch (error: any) {
    console.error("Error creating preference:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
