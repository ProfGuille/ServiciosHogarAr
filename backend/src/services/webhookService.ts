import { db } from "../db.js";

export interface WebhookRegistrationResult {
  id: number;
  eventType: string;
  createdAt: Date;
}

/**
 * Servicio de webhooks - TEMPORALMENTE SIN PERSISTENCIA
 * TODO: Crear tabla webhooks en producción para auditoría
 */
export const webhookService = {
  /**
   * Registra un webhook (temporalmente solo en logs)
   */
  async registerWebhook(
    eventType: string,
    payload: any
  ): Promise<WebhookRegistrationResult> {
    // TODO: Persistir cuando exista tabla webhooks
    console.log(`📝 Webhook registrado (solo log): ${eventType}`, {
      paymentId: payload?.data?.id,
      timestamp: new Date().toISOString()
    });

    return {
      id: Date.now(), // ID temporal
      eventType: eventType,
      createdAt: new Date(),
    };
  },

  async findWebhooksByPaymentId(paymentId: string) {
    // Sin persistencia, retorna vacío
    return [];
  },

  async getWebhookStats(lastHours: number = 24) {
    // Sin persistencia, retorna vacío
    return [];
  },
};
