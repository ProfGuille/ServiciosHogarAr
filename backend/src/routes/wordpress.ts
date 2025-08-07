import { Router } from "express";
import { db } from "../db";
// import { wordpressPosts } from "../shared/schema/wordpressPosts"; // <-- Elimina esta línea

const router = Router();

router.get("/", async (req, res) => {
  // Cuando tengas el modelo, aquí puedes poner la lógica
  res.json([]); // Por ahora devuelve vacío
});

export default router;