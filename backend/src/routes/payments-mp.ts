import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { mercadoPagoService } from "../services/mercadoPagoService.js";

const router = Router();

// -----------------------------
// Crear preferencia de pago
// -----------------------------
router.post("/create", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ error: "Solo proveedores pueden comprar créditos" });
    }

    const providerId = req.user.providerId;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Falta amount" });
    }

    const pref = await mercadoPagoService.createPreference(providerId, amount);

    res.json(pref);
  } catch (err) {
    console.error("Error en /payments/mp/create:", err);
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Webhook de MercadoPago
// -----------------------------
router.get("/webhook", (req, res) => {
  res.sendStatus(200);
});

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

