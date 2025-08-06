import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  customerId: varchar('customer_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  serviceRequestId: integer('service_request_id'),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  customerUnreadCount: integer('customer_unread_count').default(0),
  providerUnreadCount: integer('provider_unread_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

