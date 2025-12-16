import { relations } from "drizzle-orm";
import { conversations } from "../conversations.js";
import { messages } from "../messages.js";

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));

