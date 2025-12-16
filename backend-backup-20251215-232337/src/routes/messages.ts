import { Router } from "express";
import { db } from "../db.js"; // Corrige el import
import { messages } from "../shared/schema/messages.js"; // Asegúrate de tener el schema

const router = Router();

// Obtener mensajes por conversationId
router.get("/:conversationId", async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  try {
    // Usa el nombre del campo tal cual está en tu schema: conversationId (camelCase)
    const msgs = await db
      .select()
      .from(messages)
      .where({ conversationId });
    res.json(msgs);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

export default router;