import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { providerCredits } from "../shared/schema/providerCredits.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { users } from "../shared/schema/users.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/balance", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId))
      .limit(1);
    
    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    
    const [credits] = await db
      .select()
      .from(providerCredits)
      .where(eq(providerCredits.providerId, provider.id))
      .limit(1);
    
    if (!credits) {
      return res.status(404).json({ error: "Registro de créditos no encontrado" });
    }
    
    res.json({
      currentCredits: credits.currentCredits,
      totalPurchased: credits.totalPurchased,
      totalUsed: credits.totalUsed,
      lastPurchase: credits.lastPurchaseAt
    });
    
  } catch (error: any) {
    console.error("Error getting balance:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/packages", async (req: Request, res: Response) => {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    const packages = await sql`SELECT id, nombre, creditos, precio, destacado, activo, orden FROM credit_packages WHERE activo = TRUE ORDER BY orden`;
    res.json(packages);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
