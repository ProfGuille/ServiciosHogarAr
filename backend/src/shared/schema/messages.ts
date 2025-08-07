import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull(),
  senderId: integer('sender_id').notNull(),
  content: varchar('content', { length: 1024 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;