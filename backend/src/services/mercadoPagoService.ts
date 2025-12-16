import { db } from "../db.js";
import { creditPurchases } from "../shared/schema/creditPurchases.js";
import { paymentsService } from "./paymentsService.js";
import { eq } from "drizzle-orm";
import fetch from "node-fetch";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.error("❌ MP_ACCESS_TOKEN no está definido en el entorno");
}

export const mercadoPagoService = {
  // -----------------------------
  // Crear preferencia de pago
  // -----------------------------
  async createPreference(providerId: number, amount: number) {
    // Registrar compra pendiente
    const purchase = await paymentsService.registerPurchase(
      providerId,
      amount,
      "mercadopago"
    );

    const body = {
      items: [
        {
          id: String(purchase.id),
          title: `Compra de ${amount} créditos`,
          quantity: 1,
          unit_price: amount,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: process.env.MP_SUCCESS_URL,
        failure: process.env.MP_FAILURE_URL,
        pending: process.env.MP_PENDING_URL,
      },
      notification_url: process.env.MP_WEBHOOK_URL,
      auto_return: "approved",
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.init_point) {
      console.error("❌ Error creando preferencia MP:", data);
      throw new Error("No se pudo crear la preferencia de pago");
    }

    return {
      init_point: data.init_point,
      purchaseId: purchase.id,
    };
  },

  // -----------------------------
  // Procesar webhook
  // -----------------------------
  async processWebhook(body) {
    if (body.type !== "payment") return;

    const paymentId = body.data.id;

    // Obtener info del pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    const payment = await response.json();

    const purchaseId = Number(payment.additional_info?.items?.[0]?.id);
    if (!purchaseId) return;

    if (payment.status === "approved") {
      await paymentsService.confirmPurchase(purchaseId);
    } else if (payment.status === "rejected") {
      await paymentsService.failPurchase(purchaseId);
    }
  },
};

