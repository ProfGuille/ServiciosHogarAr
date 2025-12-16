import { Router } from "express";
import { db } from "../db.js";
import { services } from "../shared/schema/services.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(services);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener servicios" });
  }
});

export default router;