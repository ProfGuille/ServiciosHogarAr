import { relations } from 'drizzle-orm';
import { messages } from '../messages';
import { conversations } from '../conversations';
import { users } from '../users';

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
