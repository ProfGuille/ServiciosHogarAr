import { relations } from "drizzle-orm";
import { conversations } from "../conversations.js";
import { users } from "../users.js";

export const conversationsRelations = relations(conversations, ({ one }) => ({
  client: one(users, {
    fields: [conversations.clientId],
    references: [users.id],
  }),
  provider: one(users, {
    fields: [conversations.providerId],
    references: [users.id],
  }),
}));