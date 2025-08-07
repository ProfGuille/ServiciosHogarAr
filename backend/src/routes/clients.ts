import { Router } from "express";
import { db } from "../db"; // Importa el archivo db.ts
import { clients } from "../shared/schema/clients"; // Ajusta el path según tu estructura
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid client id" });
  }

  try {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
    const client = result[0] || null;
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving client" });
  }
});

export default router;