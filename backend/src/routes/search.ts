import { Router } from "express";
import { searchService } from "../services/searchService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const results = await searchService.searchProviders(req.query);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

router.get("/providers", async (req, res) => {
  try {
    const results = await searchService.searchProviders(req.query);
    res.json(results);
  } catch (err) {
    console.error("Provider search error:", err);
    res.status(500).json({ error: "Error en búsqueda de proveedores" });
  }
});

export default router;

