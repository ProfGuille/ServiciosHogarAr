import { Router } from "express";
import { db } from "../db";
import { serviceProviders } from "../shared/schema/serviceProviders";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // Verifica que los campos existan en tu schema
    const providers = await db
      .select({
        id: serviceProviders.id,
        name: serviceProviders.name,
        createdAt: serviceProviders.createdAt,
      })
      .from(serviceProviders);

    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
});

export default router;