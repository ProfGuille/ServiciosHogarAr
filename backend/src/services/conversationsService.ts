import { db } from "../db.js";
import { conversations } from "../shared/schema/conversations.js";
import { eq, and, desc } from "drizzle-orm";

export const conversationsService = {
  async listForUser(userId: number, role: "customer" | "provider") {
    const field =
      role === "customer"
        ? conversations.customerId
        : conversations.providerId;

    return db
      .select()
      .from(conversations)
      .where(eq(field, userId))
      .orderBy(desc(conversations.lastMessageAt));
  },

  async getById(conversationId: number, userId: number) {
    const convo = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .then((rows) => rows[0]);

    if (!convo) return null;

    if (convo.customerId !== userId && convo.providerId !== userId) {
      return "forbidden";
    }

    return convo;
  },

  async getByServiceRequest(serviceRequestId: number, userId: number) {
    const convo = await db
      .select()
      .from(conversations)
      .where(eq(conversations.serviceRequestId, serviceRequestId))
      .then((rows) => rows[0]);

    if (!convo) return null;

    if (convo.customerId !== userId && convo.providerId !== userId) {
      return "forbidden";
    }

    return convo;
  },

  // 🔵 MÉTODO NUEVO — INICIAR CONVERSACIÓN
  async startConversation({ providerId, customerId, serviceRequestId }) {
    // ¿Ya existe?
    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.providerId, providerId),
          eq(conversations.customerId, customerId),
          eq(conversations.serviceRequestId, serviceRequestId)
        )
      )
      .then((rows) => rows[0]);

    if (existing) return existing;

    // Crear nueva conversación
    const [created] = await db
      .insert(conversations)
      .values({
        providerId,
        customerId,
        serviceRequestId,
        lastMessageAt: new Date(),
      })
      .returning();

    return created;
  },
};

