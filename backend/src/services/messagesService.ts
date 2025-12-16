import { db } from "../db.js";
import { messages } from "../shared/schema/messages.js";
import { conversations } from "../shared/schema/conversations.js";
import { eq, and, asc, desc } from "drizzle-orm";

export const messagesService = {
  async getMessages(conversationId: number, userId: number, limit = 50, offset = 0) {
    // Verificar que la conversación pertenece al usuario
    const convo = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .then(rows => rows[0]);

    if (!convo) return null;

    if (convo.customerId !== userId && convo.providerId !== userId) {
      return "forbidden";
    }

    // Obtener mensajes
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return msgs;
  }
};

