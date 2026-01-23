import { Router } from "express";
import { mercadoPagoService } from "../services/mercadoPagoService.js";
import { paymentsService } from "../services/paymentsService.js";

const router = Router();

/**
 * Webhook de Mercado Pago
 * CRÍTICO: Validación HMAC + Idempotencia implementadas
 */
router.post("/webhook", async (req, res) => {
  try {
    console.log('🔔 Webhook MP recibido');
    
    const result = await mercadoPagoService.processWebhook(req.body, req.headers);
    
    if (!result.success) {
      console.error('❌ Webhook falló:', result.message);
      return res.status(400).json({ error: result.message });
    }

    console.log('✅ Webhook procesado:', result.message);
    res.sendStatus(200);
  } catch (error: any) {
    console.error('❌ Error crítico en webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Crear preferencia de pago MP
 */
router.post("/create", async (req, res) => {
  try {
    const { providerId, credits, amount } = req.body;

    if (!providerId || !credits || !amount) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos: providerId, credits, amount" 
      });
    }

    // Registrar compra pendiente
    const purchase = await paymentsService.registerPurchase({
      providerId,
      credits,
      amount,
    });

    // Crear preferencia en MP
    const preference = await mercadoPagoService.createPreference({
      title: `${credits} créditos`,
      quantity: 1,
      unit_price: Number(amount),
      providerId,
      purchaseId: purchase.id,
    });

    // Actualizar purchase con payment_id
    await paymentsService.updatePurchasePaymentId(
      purchase.id,
      preference.id
    );

    res.json({ 
      preferenceId: preference.id,
      initPoint: preference.init_point,
      purchaseId: purchase.id
    });
  } catch (error: any) {
    console.error('❌ Error creando preferencia MP:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
