import { Router } from "express";
import { db } from "../db.js";
import { leadResponses } from "../shared/schema/leadResponses.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const responses = await db.select().from(leadResponses);
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener respuestas de leads" });
  }
});

export default router;