import { Router } from "express";
import { db } from "../db";
import { languages, translations } from "../shared/schema";

const router = Router();

router.get("/", async (req, res) => {
  const allLanguages = await db.select().from(languages);
  res.json(allLanguages);
});

router.get("/preferences", async (req, res) => {
  // Reemplaza esto por el campo adecuado de tu autenticación
  // console.log(req.user); // <-- Úsalo para ver qué trae
  const userId = typeof req.user === "string" ? req.user : undefined;
  if (!userId) return res.status(401).json({ error: "Usuario no autenticado" });

  res.json({ preferredLanguage: "es" });
});

export default router;