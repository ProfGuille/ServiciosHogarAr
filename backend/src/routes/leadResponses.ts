import { Router, Request, Response } from "express";
import { db } from "../db"; // tu instancia de conexión a base de datos
import { leadResponses } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/leadResponses - lista todas las respuestas
router.get("/", async (req: Request, res: Response) => {
  try {
    const results = await db.select().from(leadResponses);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching leadResponses:", error);
    res.status(500).json({ success: false, error: "Error fetching lead responses" });
  }
});

// POST /api/leadResponses - crear una nueva respuesta
router.post("/", async (req: Request, res: Response) => {
  try {
    const { providerId, serviceId, message, status } = req.body;

    // Validación simple de campos requeridos
    if (
      typeof providerId !== "number" ||
      typeof serviceId !== "number" ||
      typeof message !== "string" ||
      (status && typeof status !== "string")
    ) {
      return res.status(400).json({ success: false, error: "Invalid or missing fields" });
    }

    const [newResponse] = await db
      .insert(leadResponses)
      .values({
        providerId,
        serviceId,
        message,
        status: status || "pending",
      })
      .returning();

    res.status(201).json({ success: true, data: newResponse });
  } catch (error) {
    console.error("Error creating leadResponse:", error);
    res.status(500).json({ success: false, error: "Error creating lead response" });
  }
});

export default router;

