import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { paymentsService } from "../services/paymentsService.js";

const router = Router();

// Obtener pagos del usuario autenticado
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; // "customer" o "provider"

    const result = await paymentsService.listForUser(userId, role);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener pago por serviceRequestId
router.get("/request/:serviceRequestId", requireAuth, async (req, res) => {
  const serviceRequestId = Number(req.params.serviceRequestId);
  if (isNaN(serviceRequestId)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const result = await paymentsService.getByServiceRequest(
      serviceRequestId,
      req.user.id
    );

    if (result === null) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    if (result === "forbidden") {
      return res.status(403).json({ error: "No tienes acceso a este pago" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error al obtener pago:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

