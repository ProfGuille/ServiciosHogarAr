import { relations } from 'drizzle-orm';
import { messages } from "../messages.js";
import { conversations } from "../conversations.js";
import { users } from "../users.js";

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
