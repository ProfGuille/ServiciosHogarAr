import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { messagesService } from "../services/messagesService.js";

const router = Router();

// Obtener mensajes de una conversación
router.get("/:conversationId", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  if (isNaN(conversationId)) {
    return res.status(400).json({ error: "ID de conversación inválido" });
  }

  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;

  try {
    const result = await messagesService.getMessages(
      conversationId,
      req.user.id,
      limit,
      offset
    );

    if (result === null) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    if (result === "forbidden") {
      return res.status(403).json({ error: "No tienes acceso a esta conversación" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

