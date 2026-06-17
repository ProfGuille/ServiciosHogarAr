import { Router } from "express";
import { mercadoPagoService } from "../services/mercadoPagoService.js";
import { paymentsService } from "../services/paymentsService.js";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

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
router.post("/create", requireAuth, async (req: any, res) => {
  try {
    const { packageId } = req.body;
    if (!packageId) {
      return res.status(400).json({ error: "Falta packageId" });
    }

    // Obtener providerId desde el token
    const userId = req.user.id;
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId))
      .limit(1);
    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    const providerId = provider.id;

    // Resolver credits y amount desde credit_packages
    const sql = neon(process.env.DATABASE_URL!);
    const pkgRows = (await sql`SELECT id, nombre, creditos, precio FROM credit_packages WHERE id = ${packageId} AND activo = TRUE LIMIT 1`) as any[];
    if (!pkgRows.length) {
      return res.status(404).json({ error: "Paquete no encontrado" });
    }
    const pkg = pkgRows[0];
    const credits = pkg.creditos;
    const amount = pkg.precio;

    // Registrar compra pendiente
    const purchase = await paymentsService.registerPurchase(
      providerId,
      credits,
      Number(amount),
      "mercadopago"
    );

    // Crear preferencia en MP
    const preference = await mercadoPagoService.createPreference({
      title: `${pkg.nombre} - ${credits} créditos`,
      quantity: 1,
      unit_price: Number(amount),
      providerId,
      purchaseId: purchase.id,
    });

    res.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      init_point: preference.init_point,
      purchaseId: purchase.id
    });
  } catch (error: any) {
    console.error('❌ Error creando preferencia MP:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
