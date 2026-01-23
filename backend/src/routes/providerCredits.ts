import { Router } from "express";
import { db } from "../db.js";
import { providerCredits } from "../shared/schema/index.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:providerId", async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId);

    if (!providerId || isNaN(providerId)) {
      return res.status(400).json({ 
        error: "providerId debe ser un número válido" 
      });
    }

    const [credits] = await db
      .select({
        currentCredits: providerCredits.currentCredits,
        totalPurchased: providerCredits.totalPurchased,
        providerId: providerCredits.providerId
      })
      .from(providerCredits)
      .where(eq(providerCredits.providerId, providerId));

    if (!credits) {
      return res.status(404).json({ 
        error: "No se encontró el registro de créditos para este proveedor" 
      });
    }

    res.json({
      providerId: credits.providerId,
      currentCredits: credits.currentCredits,
      totalPurchased: credits.totalPurchased,
      totalSpent: credits.totalPurchased - credits.currentCredits
    });

  } catch (error) {
    console.error("❌ Error en GET /api/provider-credits/:providerId:", error);
    res.status(500).json({ error: "Error al obtener balance de créditos" });
  }
});

export default router;
