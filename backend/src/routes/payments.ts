import { Router } from "express";
import { db } from "../db.js";
import { payments } from "../shared/schema/payments.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const pagos = await db.select().from(payments);
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pagos" });
  }
});

export default router;