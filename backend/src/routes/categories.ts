import { Router } from "express";
import { categoriesService } from "../services/categoriesService.js";

const router = Router();

// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const result = await categoriesService.getAll();
    res.json(result);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

