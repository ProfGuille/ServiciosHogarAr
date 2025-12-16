import { Router } from "express";
import { db } from "../db.js";
import { referrals } from "../shared/schema/referrals.js";
import { eq } from "drizzle-orm";

const router = Router();

// Obtener todos los referrals
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(referrals);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving referrals" });
  }
});

// Obtener un referral por id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid referral id" });
  }

  try {
    const result = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, id));
    const referral = result[0] || null;
    res.json(referral);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving referral" });
  }
});

// Crear un nuevo referral
router.post("/", async (req, res) => {
  try {
    const [newReferral] = await db
      .insert(referrals)
      .values(req.body)
      .returning();
    res.status(201).json(newReferral);
  } catch (error) {
    res.status(500).json({ error: "Error creating referral" });
  }
});

export default router;