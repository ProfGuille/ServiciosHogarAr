import { Router } from "express";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { db } from "../db.js";
import { payments, serviceProviders, users } from "../shared/schema.js";
import { eq, and, desc } from "drizzle-orm";
// import { isAuthenticated } from "../replitAuth.js";
import { z } from "zod";
import { notifyProviderCreditsPurchased } from "../services/email.js";

const router = Router();

// Initialize MercadoPago client
let mercadopagoClient: MercadoPagoConfig | null = null;
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  mercadopagoClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: { timeout: 5000 },
  });
}

// Credit packages configuration
const CREDIT_PACKAGES = [
  { id: "pack_100", credits: 100, price: 2000, name: "100 Créditos", description: "Ideal para comenzar" },
  { id: "pack_250", credits: 250, price: 4500, name: "250 Créditos", description: "Ahorra 10%" },
  { id: "pack_500", credits: 500, price: 8000, name: "500 Créditos", description: "Ahorra 20%" },
  { id: "pack_1000", credits: 1000, price: 15000, name: "1000 Créditos", description: "Mejor valor - Ahorra 25%" },
];

// Membership plans
const MEMBERSHIP_PLANS = [
  {
    id: "basic_monthly",
    name: "Plan Básico Mensual",
    price: 5000,
    credits: 50,
    period: "monthly",
    description: "50 créditos por mes",
  },
  {
    id: "pro_monthly",
    name: "Plan Profesional Mensual",
    price: 12000,
    credits: 150,
    period: "monthly",
    description: "150 créditos por mes + soporte prioritario",
  },
  {
    id: "premium_monthly",
    name: "Plan Premium Mensual",
    price: 25000,
    credits: 500,
    period: "monthly",
    description: "500 créditos por mes + beneficios exclusivos",
  },
];

const createCreditPurchaseSchema = z.object({
  packageId: z.string(),
  returnUrl: z.string().url().optional(),
});

const createMembershipSchema = z.object({
  planId: z.string(),
  returnUrl: z.string().url().optional(),
});

// Rutas:

router.get("/credit-packages", isAuthenticated, (req, res) => {
  res.json({
    packages: CREDIT_PACKAGES,
    membershipPlans: MEMBERSHIP_PLANS,
  });
});

router.post("/create-credit-preference", isAuthenticated, async (req: any, res) => {
  try {
    if (!mercadopagoClient) {
      return res.status(503).json({ error: "MercadoPago no está configurado" });
    }

    const { packageId, returnUrl } = createCreditPurchaseSchema.parse(req.body);
    const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId);

    if (!creditPackage) {
      return res.status(400).json({ error: "Paquete de créditos no válido" });
    }

    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Get provider info
    const provider = await db.select().from(serviceProviders).where(eq(serviceProviders.userId, userId)).limit(1);

    const preference = new Preference(mercadopagoClient);

    const preferenceData = {
      items: [
        {
          id: creditPackage.id,
          title: creditPackage.name,
          description: creditPackage.description,
          quantity: 1,
          currency_id: "ARS",
          unit_price: creditPackage.price,
        },
      ],
      payer: {
        name: user[0].firstName || "",
        surname: user[0].lastName || "",
        email: user[0].email || "",
      },
      back_urls: {
        success: returnUrl || `${req.protocol}://${req.get("host")}/payment-success`,
        failure: returnUrl || `${req.protocol}://${req.get("host")}/comprar-creditos`,
        pending: returnUrl || `${req.protocol}://${req.get("host")}/comprar-creditos`,
      },
      auto_return: "approved" as const,
      statement_descriptor: "ServiciosHogar",
      external_reference: JSON.stringify({
        userId,
        packageId: creditPackage.id,
        credits: creditPackage.credits,
        type: "credit_purchase",
      }),
    };

    const response = await preference.create({ body: preferenceData });

    // Create pending payment record
    await db.insert(payments).values({
      amount: creditPackage.price.toString(),
      currency: "ars",
      paymentMethod: "mercadopago",
      customerId: userId,
      providerId: provider[0]?.id,
      description: `Compra de ${creditPackage.credits} créditos`,
      mercadopagoPreferenceId: response.id,
      status: "pending",
      metadata: {
        credits: creditPackage.credits,
        packageId: creditPackage.id,
        type: "credit_purchase",
      },
    });

    res.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("Error creating MercadoPago preference:", error);
    res.status(500).json({ error: "Error al crear la preferencia de pago" });
  }
});

router.post("/create-membership-preference", isAuthenticated, async (req: any, res) => {
  try {
    if (!mercadopagoClient) {
      return res.status(503).json({ error: "MercadoPago no está configurado" });
    }

    const { planId, returnUrl } = createMembershipSchema.parse(req.body);
    const membershipPlan = MEMBERSHIP_PLANS.find((p) => p.id === planId);

    if (!membershipPlan) {
      return res.status(400).json({ error: "Plan de membresía no válido" });
    }

    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const preference = new Preference(mercadopagoClient);

    const preferenceData = {
      items: [
        {
          id: membershipPlan.id,
          title: membershipPlan.name,
          description: membershipPlan.description,
          quantity: 1,
          currency_id: "ARS",
          unit_price: membershipPlan.price,
        },
      ],
      payer: {
        name: user[0].firstName || "",
        surname: user[0].lastName || "",
        email: user[0].email || "",
      },
      back_urls: {
        success: returnUrl || `${req.protocol}://${req.get("host")}/payment-success`,
        failure: returnUrl || `${req.protocol}://${req.get("host")}/comprar-creditos`,
        pending: returnUrl || `${req.protocol}://${req.get("host")}/comprar-creditos`,
      },
      auto_return: "approved" as const,
      statement_descriptor: "ServiciosHogar",
      external_reference: JSON.stringify({
        userId,
        planId: membershipPlan.id,
        credits: membershipPlan.credits,
        type: "membership",
        period: membershipPlan.period,
      }),
    };

    const response = await preference.create({ body: preferenceData });

    // Create pending payment record
    await db.insert(payments).values({
      amount: membershipPlan.price.toString(),
      currency: "ars",
      paymentMethod: "mercadopago",
      customerId: userId,
      description: `Suscripción ${membershipPlan.name}`,
      mercadopagoPreferenceId: response.id,
      status: "pending",
      metadata: {
        credits: membershipPlan.credits,
        planId: membershipPlan.id,
        type: "membership",
        period: membershipPlan.period,
      },
    });

    res.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("Error creating membership preference:", error);
    res.status(500).json({ error: "Error al crear la suscripción" });
  }
});

// MercadoPago webhook para procesar pagos
router.post("/mercadopago-webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment") {
      if (!mercadopagoClient) {
        return res.status(503).json({ error: "MercadoPago no está configurado" });
      }

      const paymentClient = new Payment(mercadopagoClient);
      const paymentData = await paymentClient.get({ id: data.id });

      // Parse external reference
      const externalRef = JSON.parse(paymentData.external_reference || "{}");

      // Buscar registro de pago
      const [paymentRecord] = await db
        .select()
        .from(payments)
        .where(eq(payments.mercadopagoPreferenceId, paymentData.preference_id))
        .limit(1);

      if (paymentRecord) {
        await db
          .update(payments)
          .set({
            status:
              paymentData.status === "approved"
                ? "succeeded"
                : paymentData.status === "rejected"
                ? "failed"
                : "pending",
            mercadopagoPaymentId: paymentData.id?.toString(),
            paidAt: paymentData.status === "approved" ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, paymentRecord.id));

        // Si está aprobado, sumar créditos al proveedor
        if (paymentData.status === "approved" && externalRef.credits) {
          const [provider] = await db
            .select()
            .from(serviceProviders)
            .where(eq(serviceProviders.userId, externalRef.userId))
            .limit(1);

          if (provider) {
            await db
              .update(serviceProviders)
              .set({
                credits: provider.credits + externalRef.credits,
                updatedAt: new Date(),
              })
              .where(eq(serviceProviders.id, provider.id));

            // Enviar email de notificación
            const user = await db
              .select()
              .from(users)
              .where(eq(users.id, externalRef.userId))
              .limit(1);

            if (user[0]?.email && externalRef.type === "credits") {
              const amount = paymentRecord.amount ? parseFloat(paymentRecord.amount) : 0;
              notifyProviderCreditsPurchased(user[0].email, provider.businessName, externalRef.credits, amount).catch(console.error);
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

// Historial de pagos
router.get("/history", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const paymentHistory = await db
      .select()
      .from(payments)
      .where(eq(payments.customerId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(50);

    res.json(paymentHistory);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: "Error al obtener el historial de pagos" });
  }
});

// Obtener créditos actuales del proveedor
router.get("/credits", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.userId, userId)).limit(1);

    if (!provider) {
      return res.json({ credits: 0, isProvider: false });
    }

    res.json({
      credits: provider.credits,
      isProvider: true,
      membershipStatus: provider.membershipStatus,
      membershipExpiresAt: provider.membershipExpiresAt,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    res.status(500).json({ error: "Error al obtener los créditos" });
  }
});

// Usar crédito cuando el proveedor responde un lead
router.post("/use-credit", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { requestId } = req.body;

    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.userId, userId)).limit(1);

    if (!provider) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    if (provider.credits < 1) {
      return res.status(400).json({ error: "Créditos insuficientes" });
    }

    // Descontar 1 crédito
    await db.update(serviceProviders).set({ credits: provider.credits - 1, updatedAt: new Date() }).where(eq(serviceProviders.id, provider.id));

    res.json({ success: true, remainingCredits: provider.credits - 1 });
  } catch (error) {
    console.error("Error using credit:", error);
    res.status(500).json({ error: "Error al usar el crédito" });
  }
});

export default router;

