import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { paymentsService } from "../services/paymentsService.js";

const router = Router();

// Registrar compra (pendiente)
router.post("/purchase", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ error: "Solo proveedores pueden comprar créditos" });
    }

    const providerId = req.user.providerId;
    const { amount, method } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    const purchase = await paymentsService.registerPurchase(
      providerId,
      amount,
      method
    );

    res.json(purchase);
  } catch (err) {
    console.error("Error en /payments/purchase:", err);
    res.status(400).json({ error: err.message });
  }
});

// Confirmar compra (sumar créditos)
router.post("/confirm", requireAuth, async (req, res) => {
  try {
    const { purchaseId } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ error: "Falta purchaseId" });
    }

    await paymentsService.confirmPurchase(purchaseId);

    res.json({ success: true });
  } catch (err) {
    console.error("Error en /payments/confirm:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;

