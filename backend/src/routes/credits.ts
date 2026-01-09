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
  const packages = [
    {
      id: "basico",
      name: "Básico",
      credits: 10,
      price: 5000,
      pricePerCredit: 500,
      popular: false
    },
    {
      id: "popular",
      name: "Popular",
      credits: 50,
      price: 20000,
      pricePerCredit: 400,
      popular: true,
      savings: "20% de descuento"
    },
    {
      id: "premium",
      name: "Premium",
      credits: 100,
      price: 35000,
      pricePerCredit: 350,
      popular: false,
      savings: "30% de descuento"
    }
  ];
  
  res.json(packages);
});

export default router;
