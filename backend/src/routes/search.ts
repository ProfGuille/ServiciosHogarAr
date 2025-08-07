import { Router } from "express";
import { searchService } from "../services/searchService.js"; // Corrige el import: usa el export default o el nombre correcto
// Si tienes tipos necesarios, impórtalos según tu export en searchService.js

const router = Router();

// Endpoint de búsqueda
router.get("/", async (req, res) => {
  try {
    // Supón que searchService tiene un método search que recibe filtros desde req.query
    const results = await searchService.search(req.query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

export default router;