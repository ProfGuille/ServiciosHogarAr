import { db } from "../db.js";
import { paymentsService } from "./paymentsService.js";
import { sql } from "drizzle-orm";

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

  /**
   * Procesa un webhook de Mercado Pago de forma segura
   * usando la función PL/pgSQL atómica
   * 
   * @param body - Body del webhook
   * @param paymentId - ID del pago (viene del header x-request-id o se extrae del body)
   * @returns Resultado del procesamiento
   */
  async processWebhook(body: any, paymentId?: string) {
    // Solo procesar notificaciones de pago
    if (body.type !== "payment") {
      console.log("ℹ️ Webhook no es de tipo payment, ignorando:", body.type);
      return { processed: false, reason: "not_payment_type" };
    }

    const mpPaymentId = paymentId || body.data?.id;

    if (!mpPaymentId) {
      console.error("❌ Webhook sin payment_id:", body);
      return { processed: false, reason: "missing_payment_id" };
    }

    // Consultar estado del pago en Mercado Pago
    console.log(`🔍 Consultando pago ${mpPaymentId} en Mercado Pago...`);
    
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Error consultando pago ${mpPaymentId}:`, response.status);
      return { processed: false, reason: "mp_api_error" };
    }

    const payment: any = await response.json();
    const purchaseId = Number(payment.additional_info?.items?.[0]?.id);

    if (!purchaseId) {
      console.error("❌ No se pudo extraer purchase_id del pago:", payment);
      return { processed: false, reason: "missing_purchase_id" };
    }

    console.log(`📦 Payment ${mpPaymentId} → Purchase ${purchaseId} → Status: ${payment.status}`);

    // Procesar según el status
    if (payment.status === "approved") {
      // Usar la función atómica de PostgreSQL
      const result = await this.acreditarCreditosSeguro(
        purchaseId,
        mpPaymentId
      );

      if (result.success) {
        console.log(`✅ Créditos acreditados: ${result.message}`);
        console.log(`💰 Nuevo balance: ${result.new_balance} créditos`);
      } else if (result.was_duplicate) {
        console.log(`⚠️ Webhook duplicado detectado: ${result.message}`);
      } else {
        console.error(`❌ Error acreditando: ${result.message}`);
      }

      return {
        processed: result.success,
        duplicate: result.was_duplicate,
        newBalance: result.new_balance,
        message: result.message,
      };

    } else if (payment.status === "rejected") {
      await paymentsService.failPurchase(purchaseId);
      console.log(`❌ Pago rechazado: ${mpPaymentId}`);
      return { processed: true, status: "rejected" };

    } else {
      console.log(`ℹ️ Pago en estado ${payment.status}, no se procesa aún`);
      return { processed: false, reason: "pending_status", status: payment.status };
    }
  },

  /**
   * Acredita créditos usando la función PL/pgSQL atómica
   * Garantiza idempotencia y previene race conditions
   */
  async acreditarCreditosSeguro(
    purchaseId: number,
    mpPaymentId: string
  ): Promise<{
    success: boolean;
    new_balance: number;
    was_duplicate: boolean;
    message: string;
  }> {
    // 1. Obtener datos de la compra
    const purchase = await paymentsService.getPurchaseById(purchaseId);
    
    if (!purchase) {
      return {
        success: false,
        new_balance: 0,
        was_duplicate: false,
        message: "Compra no encontrada"
      };
    }

    // 2. Llamar a la función PL/pgSQL atómica
    const result = await db.execute(sql`
      SELECT * FROM acreditar_creditos_atomico(
        ${purchase.providerId}::integer,
        ${purchaseId}::integer,
        ${purchase.credits}::integer,
        ${mpPaymentId}::varchar
      )
    `);

    // 3. Parsear resultado
    const row: any = result.rows[0];
    
    return {
      success: row.success,
      new_balance: row.new_balance,
      was_duplicate: row.was_duplicate,
      message: row.message
    };
  },
};
