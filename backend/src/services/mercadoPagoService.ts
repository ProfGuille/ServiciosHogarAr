import { paymentsService } from "./paymentsService.js";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.error("❌ MP_ACCESS_TOKEN no está definido en el entorno");
}

// Mapeo de créditos a precios
const CREDIT_PACKAGES: any = {
  10: { price: 5000, name: "Básico" },
  50: { price: 20000, name: "Popular" },
  100: { price: 35000, name: "Premium" }
};

export const mercadoPagoService = {
  async createPreference(providerId: number, credits: number) {
    const packageInfo = CREDIT_PACKAGES[credits];
    
    if (!packageInfo) {
      throw new Error("Paquete de créditos inválido");
    }

    // Registrar compra pendiente
    const purchase = await paymentsService.registerPurchase(
      providerId,
      credits,
      packageInfo.price,
      "mercadopago"
    );

    const body = {
      items: [
        {
          id: String(purchase.id),
          title: `Créditos ServiciosHogar - ${packageInfo.name}`,
          description: `${credits} créditos para ver contactos de clientes`,
          quantity: 1,
          unit_price: packageInfo.price,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://servicioshogar.com.ar/compra-exitosa",
        failure: "https://servicioshogar.com.ar/compra-fallida",
        pending: "https://servicioshogar.com.ar/compra-pendiente"
      },
      notification_url: "https://api.servicioshogar.com.ar/api/payments/mp/webhook",
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

    const data: any = await response.json();

    if (!data.init_point) {
      console.error("❌ Error creando preferencia MP:", data);
      throw new Error("No se pudo crear la preferencia de pago");
    }

    return {
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      purchaseId: purchase.id,
    };
  },

  async processWebhook(body: any) {
    if (body.type !== "payment") return;

    const paymentId = body.data.id;

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    const payment: any = await response.json();
    const purchaseId = Number(payment.additional_info?.items?.[0]?.id);

    if (!purchaseId) return;

    if (payment.status === "approved") {
      await paymentsService.confirmPurchase(purchaseId);
    } else if (payment.status === "rejected") {
      await paymentsService.failPurchase(purchaseId);
    }
  },
};
