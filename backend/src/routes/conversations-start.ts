import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { providerCreditsService } from "../services/providerCreditsService.js";
import { conversationsService } from "../services/conversationsService.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ error: "Solo proveedores pueden iniciar conversaciones" });
    }

    const providerId = req.user.providerId;
    const { customerId, serviceRequestId } = req.body;

    if (!customerId || !serviceRequestId) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    // Consumir crédito
    await providerCreditsService.consumeCredit(providerId, 1);

    // Crear conversación
    const conversation = await conversationsService.startConversation({
      providerId,
      customerId,
      serviceRequestId,
    });

    res.json(conversation);
  } catch (err) {
    console.error("Error al iniciar conversación:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;

