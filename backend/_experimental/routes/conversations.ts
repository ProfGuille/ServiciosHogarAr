import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { conversationsService } from "../services/conversationsService.js";

const router = Router();

// Obtener todas las conversaciones del usuario autenticado
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; // "customer" o "provider"

    const result = await conversationsService.listForUser(userId, role);
    res.json(result);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener conversación por ID
router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await conversationsService.getById(id, req.user.id);

    if (result === null) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    if (result === "forbidden") {
      return res.status(403).json({ error: "No tienes acceso a esta conversación" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching conversation by ID:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener conversación por serviceRequestId
router.get("/request/:serviceRequestId", requireAuth, async (req, res) => {
  const serviceRequestId = Number(req.params.serviceRequestId);
  if (isNaN(serviceRequestId)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const result = await conversationsService.getByServiceRequest(
      serviceRequestId,
      req.user.id
    );

    if (result === null) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    if (result === "forbidden") {
      return res.status(403).json({ error: "No tienes acceso a esta conversación" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching conversation by request:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

