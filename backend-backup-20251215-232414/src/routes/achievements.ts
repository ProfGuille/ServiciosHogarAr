import { Router } from "express";
import { db } from "../db.js";
import { achievements } from "../shared/schema/achievements.js";
import { eq } from "drizzle-orm";

const router = Router();

// Obtener todos los achievements
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(achievements);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving achievements" });
  }
});

// Obtener un achievement por id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid achievement id" });
  }

  try {
    const result = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    const achievement = result[0] || null;
    res.json(achievement);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving achievement" });
  }
});

// Crear un nuevo achievement
router.post("/", async (req, res) => {
  try {
    const [newAchievement] = await db
      .insert(achievements)
      .values(req.body)
      .returning();
    res.status(201).json(newAchievement);
  } catch (error) {
    res.status(500).json({ error: "Error creating achievement" });
  }
});

export default router;