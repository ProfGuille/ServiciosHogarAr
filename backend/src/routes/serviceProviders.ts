import { Router } from "express";
import users from "./users"; // Usa el import por defecto si tu archivo exporta default
import { serviceCategories } from "../shared/schema/serviceCategories"; // Corrige la ruta (asumiendo que es un schema compartido)
import { db } from "../db";
import { serviceProviders } from "../shared/schema/serviceProviders";

const router = Router();

// Ejemplo de endpoint para obtener proveedores de servicios con categorías y usuario relacionado
router.get("/", async (req, res) => {
  try {
    // Aquí podrías hacer joins si tu ORM lo soporta, o varias consultas si no
    const providers = await db.select().from(serviceProviders);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proveedores de servicios" });
  }
});

export default router;