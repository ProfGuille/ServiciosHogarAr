import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { mercadoPagoService } from "../services/mercadoPagoService.js";
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { eq } from "drizzle-orm";

const router = Router();

// Mapeo de packageId a créditos
const PACKAGE_TO_CREDITS: any = {
  "basico": 10,
  "popular": 50,
  "premium": 100,
  "1": 10,
  "2": 50,
  "3": 100
};

router.post("/create", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: "Falta packageId" });
    }

    const credits = PACKAGE_TO_CREDITS[packageId];
    
    if (!credits) {
      return res.status(400).json({ error: "Paquete no válido" });
    }

    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId))
      .limit(1);

    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const pref = await mercadoPagoService.createPreference(provider.id, credits);
    
    res.json(pref);
  } catch (err: any) {
    console.error("Error en /payments/mp/create:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/webhook", (req, res) => {
  res.sendStatus(200);
});

router.post("/webhook", async (req, res) => {
  try {
    await mercadoPagoService.processWebhook(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error en webhook MP:", err);
    res.sendStatus(500);
  }
});

export default router;
