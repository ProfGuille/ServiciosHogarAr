import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { mercadoPagoService } from "../services/mercadoPagoService.js";
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { eq } from "drizzle-orm";

const router = Router();

// Crear preferencia de pago
router.post("/create", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Falta amount" });
    }

    // Obtener provider_id del usuario
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId))
      .limit(1);

    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const pref = await mercadoPagoService.createPreference(provider.id, amount);
    res.json(pref);
  } catch (err: any) {
    console.error("Error en /payments/mp/create:", err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook de MercadoPago - GET (validación de URL)
router.get("/webhook", (req, res) => {
  res.sendStatus(200);
});

// Webhook de MercadoPago - POST (evento real)
router.post("/webhook", async (req, res) => {
  try {
    await mercadoPagoService.processWebhook(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error en webhook MP:", err);
    res.sendStatus(500);
  }
});

export default router;
