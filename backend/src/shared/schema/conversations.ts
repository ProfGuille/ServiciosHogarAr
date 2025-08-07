import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull(),
  providerId: integer('provider_id').notNull(),
  customerId: integer('customer_id').notNull(),               // <-- Campo agregado
  serviceRequestId: integer('service_request_id'),            // <-- Campo agregado
  lastMessageAt: timestamp('last_message_at'),                // <-- Campo agregado
  customerUnreadCount: integer('customer_unread_count'),      // <-- Campo agregado
  providerUnreadCount: integer('provider_unread_count'),      // <-- Campo agregado
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // ...otros campos que tengas...
});

export type Conversation = InferSelectModel<typeof conversations>;