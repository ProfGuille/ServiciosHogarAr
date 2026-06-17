import crypto from 'crypto';
import { db, sql } from "../db.js";
import { mercadopagoWebhooks } from "../shared/schema/index.js";
import { eq } from 'drizzle-orm';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET!;

interface WebhookResult {
  success: boolean;
  message: string;
}

class MercadoPagoService {
  /**
   * Valida la firma HMAC del webhook de Mercado Pago
   * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
   */
  private validateWebhookSignature(
    xSignature: string, 
    xRequestId: string, 
    dataId: string
  ): boolean {
    try {
      if (!MP_WEBHOOK_SECRET) {
        console.error('❌ MP_WEBHOOK_SECRET no configurado');
        return false;
      }

      // x-signature viene como: "ts=1234567890,v1=abc123def456..."
      const parts = xSignature.split(',');
      const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
      const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

      if (!ts || !hash) {
        console.error('❌ Firma inválida: falta ts o v1');
        return false;
      }

      // Template según documentación de MP
      const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
      
      // Generar HMAC con SHA-256
      const hmac = crypto
        .createHmac('sha256', MP_WEBHOOK_SECRET)
        .update(template)
        .digest('hex');

      const isValid = hmac === hash;
      
      if (!isValid) {
        console.error('❌ HMAC no coincide');
        console.error('  Template:', template);
        console.error('  Expected:', hash);
        console.error('  Computed:', hmac);
      } else {
        console.log('✅ HMAC válido');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Error validando firma HMAC:', error);
      return false;
    }
  }

  /**
   * Procesa webhook de Mercado Pago con validaciones completas
   */
  async processWebhook(body: any, headers: any): Promise<WebhookResult> {
    try {
      const { type, data, id: eventId, action } = body;
      const xSignature = headers['x-signature'];
      const xRequestId = headers['x-request-id'];

      console.log('📨 Webhook recibido:', { eventId, type, action, paymentId: data?.id });

      // 1. Validar tipo de evento
      if (type !== 'payment') {
        console.log('ℹ️  Evento ignorado (no es payment)');
        return { success: true, message: 'Evento ignorado (no es payment)' };
      }

      const paymentId = data?.id;
      if (!paymentId) {
        console.error('❌ paymentId faltante en webhook');
        return { success: false, message: 'paymentId faltante' };
      }

      // 2. VALIDACIÓN HMAC (CRÍTICO)
      if (!this.validateWebhookSignature(xSignature, xRequestId, String(paymentId))) {
        console.error('⛔ Webhook RECHAZADO: firma HMAC inválida');
        return { success: false, message: 'Firma inválida' };
      }

      // 3. IDEMPOTENCIA: Verificar si ya procesamos este event_id
      const existing = await db
        .select()
        .from(mercadopagoWebhooks)
        .where(eq(mercadopagoWebhooks.eventId, String(eventId)))
        .limit(1);

      if (existing.length > 0) {
        console.log(`✅ Webhook ${eventId} ya procesado previamente. Ignorando.`);
        return { success: true, message: 'Webhook duplicado (ya procesado)' };
      }

      // 4. Registrar webhook ANTES de procesar (idempotencia)
      await db.insert(mercadopagoWebhooks).values({
        eventId: String(eventId),
        paymentId: String(paymentId),
        action: action || null,
        type: type || null,
        data: body,
        signature: xSignature,
        requestId: xRequestId,
        processed: false
      });

      console.log(`✅ Webhook ${eventId} registrado`);

      // 5. Consultar estado del pago en MP API
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`MP API error: ${response.status}`);
      }

      const payment: any = await response.json();
      const purchaseId = Number(payment.additional_info?.items?.[0]?.id);

      if (!purchaseId) {
        console.error('❌ purchaseId no encontrado en payment.additional_info');
        return { success: false, message: 'purchaseId faltante en payment' };
      }

      console.log(`💳 Pago ${paymentId} status: ${payment.status}, purchaseId: ${purchaseId}`);

      // 6. Procesar pago si está aprobado
      if (payment.status === 'approved') {
        const result = await this.confirmPurchaseAtomic(purchaseId, String(paymentId));

        // Bonus por primera compra del referido
        await this.awardFirstPurchaseBonus(result.provider_id);

        // Marcar webhook como procesado
        await db
          .update(mercadopagoWebhooks)
          .set({ processed: true, processedAt: new Date() })
          .where(eq(mercadopagoWebhooks.eventId, String(eventId)));

        console.log(`✅ Pago ${paymentId} procesado: +${result.credits} créditos para provider ${result.provider_id}`);
        return { success: true, message: 'Pago procesado exitosamente' };
      }

      console.log(`ℹ️  Pago ${paymentId} con status: ${payment.status} (no procesado)`);
      return { success: true, message: `Status: ${payment.status}` };

    } catch (error: any) {
      console.error('❌ Error procesando webhook:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Confirma compra con operación SQL atómica (igual que desbloqueo de leads)
   * Previene race conditions y doble acreditación
   */
  private async confirmPurchaseAtomic(purchaseId: number, paymentId: string) {
    console.log(`🔄 Confirmando compra ${purchaseId} con pago ${paymentId}...`);

    const result = await sql`
      WITH purchase_check AS (
        SELECT id, provider_id, credits, status
        FROM credit_purchases
        WHERE id = ${purchaseId} 
          AND mercadopago_payment_id = ${paymentId}
          AND status = 'pending'
      ),
      update_purchase AS (
        UPDATE credit_purchases
        SET status = 'completed'
        WHERE id = ${purchaseId}
          AND EXISTS (SELECT 1 FROM purchase_check)
        RETURNING id
      ),
      update_credits AS (
        UPDATE provider_credits
        SET 
          current_credits = current_credits + (SELECT credits FROM purchase_check),
          total_purchased = total_purchased + (SELECT credits FROM purchase_check),
          last_purchase_at = NOW(),
          updated_at = NOW()
        WHERE provider_id = (SELECT provider_id FROM purchase_check)
          AND EXISTS (SELECT 1 FROM update_purchase)
        RETURNING current_credits, total_purchased
      )
      SELECT 
        p.id as purchase_id,
        p.provider_id,
        p.credits,
        c.current_credits,
        c.total_purchased
      FROM purchase_check p
      CROSS JOIN update_credits c;
    `;

    if ((result as any[]).length === 0) {
      throw new Error('Compra no encontrada, ya procesada, o estado inválido');
    }

    return result[0];
  }

  /**
   * Bonus primera compra: +1 crédito al referente si aplica
   * Desacoplado de MP — se puede llamar desde cualquier flujo de pago
   */
  private async awardFirstPurchaseBonus(providerId: number): Promise<void> {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const neonSql = neon(process.env.DATABASE_URL!);

      // ¿Es la primera compra completada de este proveedor?
      const countRows = (await neonSql`
        SELECT COUNT(*) as total FROM credit_purchases
        WHERE provider_id = ${providerId} AND status = 'completed'
      `) as any[];
      if (parseInt(countRows[0].total) !== 1) return;

      // ¿Tiene referente con status completed?
      const referrers = (await neonSql`
        SELECT r.referrer_id, sp.id as referrer_provider_id
        FROM referrals r
        JOIN service_providers sp ON sp.user_id = r.referrer_id
        WHERE r.referred_id = (
          SELECT user_id FROM service_providers WHERE id = ${providerId} LIMIT 1
        )
        AND r.status = 'completed'
        LIMIT 1
      `) as any[];
      if (!referrers.length) return;

      const { providerCreditsService } = await import("./providerCreditsService.js");
      await providerCreditsService.addCredits(referrers[0].referrer_provider_id, 1);

      await neonSql`
        UPDATE referral_stats SET
          total_credits_earned = total_credits_earned + 1,
          updated_at = NOW()
        WHERE user_id = ${referrers[0].referrer_id}
      `;

      console.log("✅ Bonus primera compra: +1 crédito al proveedor " + referrers[0].referrer_provider_id);
    } catch (e) {
      console.error("Error en awardFirstPurchaseBonus:", e);
    }
  }

  /**
   * Crea preferencia de pago en Mercado Pago
   */
  async createPreference(data: {
    title: string;
    quantity: number;
    unit_price: number;
    providerId: number;
    purchaseId: number;
  }) {
    const preferenceData = {
      items: [
        {
          id: String(data.purchaseId),
          title: data.title,
          quantity: data.quantity,
          unit_price: data.unit_price,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: process.env.MP_SUCCESS_URL,
        failure: process.env.MP_FAILURE_URL,
        pending: process.env.MP_PENDING_URL,
      },
      auto_return: "approved",
      notification_url: process.env.MP_WEBHOOK_URL,
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preferenceData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error creando preferencia MP: ${response.status}`);
    }

    return response.json();
  }
}

export const mercadoPagoService = new MercadoPagoService();
