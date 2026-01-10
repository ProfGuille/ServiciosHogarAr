import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { mercadoPagoService } from "../services/mercadoPagoService.js";
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { eq } from "drizzle-orm";

const router = Router();

// Definir paquetes disponibles (debe coincidir con /credits/packages)
const PACKAGES = {
  "basico": { credits: 10, price: 5000 },
  "popular": { credits: 50, price: 20000 },
  "premium": { credits: 100, price: 35000 },
  // También soportar IDs numéricos para compatibilidad
  "1": { credits: 10, price: 5000 },
  "2": { credits: 50, price: 20000 },
  "3": { credits: 100, price: 35000 }
};

// Crear preferencia de pago
router.post("/create", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: "Falta packageId" });
    }

    // Buscar el paquete
    const packageInfo = PACKAGES[packageId as keyof typeof PACKAGES];
    
    if (!packageInfo) {
      return res.status(400).json({ error: "Paquete no válido" });
    }

    const amount = packageInfo.price;
    const credits = packageInfo.credits;

    // Obtener provider_id del usuario
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId))
      .limit(1);

    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const pref = await mercadoPagoService.createPreference(
      provider.id, 
      amount, 
      credits
    );
    
    res.json(pref);
  } catch (err: any) {
    console.error("Error en /payments/mp/create:", err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook de MercadoPago - GET (validación de URL)
router.get("/webhook", (req, res) => {
  res.sendStatus(200);
});

// Webhook de MercadoPago - POST (evento real)
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
