import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { mercadoPagoService } from "../services/mercadoPagoService.js";
import { validateMercadoPagoWebhook } from "../utils/webhookValidator";
import { webhookService } from "../services/webhookService";
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { eq } from "drizzle-orm";

const router = Router();

// Mapeo de packageId a créditos (RESTAURADO DEL ORIGINAL)
const PACKAGE_TO_CREDITS: any = {
  "basico": 10,
  "popular": 50,
  "premium": 100,
  "1": 10,
  "2": 50,
  "3": 100
};

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

    // ⚠️ CAMBIO: Validar HMAC solo si MP_WEBHOOK_SECRET existe
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

// ENDPOINT ORIGINAL RESTAURADO
router.post("/create", requireAuth, async (req: any, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.id;

    // Obtener proveedor
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId));

    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    // Convertir packageId a créditos
    const credits = PACKAGE_TO_CREDITS[packageId];
    
    if (!credits) {
      return res.status(400).json({ error: "Paquete inválido" });
    }

    // Crear preferencia
    const preference = await mercadoPagoService.createPreference(
      provider.id,
      credits
    );

    res.json(preference);
  } catch (error: any) {
    console.error("Error creating preference:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
