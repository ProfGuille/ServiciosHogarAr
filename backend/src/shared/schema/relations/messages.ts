import { relations } from "drizzle-orm";
import { messages } from "../messages";
import { conversations } from "../conversations";

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

