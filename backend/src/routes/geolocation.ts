import { Router } from "express";
import { providerLocations } from "../shared/schema/providerLocations";
import { db } from "../db"; // Asumiendo que tienes un archivo db.ts con la instancia de Drizzle o similar

const router = Router();

// Obtener todas las ubicaciones de proveedores
router.get("/", async (req, res) => {
  try {
    const locations = await db.select().from(providerLocations);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ubicaciones" });
  }
});

export default router;