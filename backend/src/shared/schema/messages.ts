import { pgTable, serial, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull(),
  senderId: integer('sender_id').notNull(),
  content: varchar('content', { length: 1024 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  // MVP 3: Enhanced messaging features
  messageType: varchar('message_type', { length: 50 }).default('text'), // text, image, file
  attachmentUrl: varchar('attachment_url', { length: 512 }),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at'),
  replyToMessageId: integer('reply_to_message_id'), // For message replies
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;