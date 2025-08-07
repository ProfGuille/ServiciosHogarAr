import { Router } from "express";
import { db } from "../db";
import { analytics } from "../shared/schema/analytics";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await db.select().from(analytics);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener analíticas" });
  }
});

export default router;