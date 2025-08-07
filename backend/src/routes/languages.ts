import { Router } from "express";
import { db } from "../db";
import { languages, translations, userLanguagePreferences } from "../shared/schema";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const activeLanguages = await db
      .select()
      .from(languages)
      .where({ isActive: true });
    res.json(activeLanguages);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener idiomas" });
  }
});

router.get("/translations/:languageCode", async (req, res) => {
  const { languageCode } = req.params;
  try {
    const translation = await db
      .select()
      .from(translations)
      .where({ languageCode });
    res.json(translation);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener traducciones" });
  }
});

router.get("/:languageCode", async (req, res) => {
  const { languageCode } = req.params;
  try {
    const language = await db
      .select()
      .from(languages)
      .where({ code: languageCode });
    res.json(language);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener idioma" });
  }
});

router.get("/user/preference", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "No autenticado" });

  const preference = await db.select().from(userLanguagePreferences).where({ userId });
  res.json(preference);
});

export default router;