import { pgTable, serial, integer, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const webhookEvents = pgTable('webhook_events', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 64 }),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow(),
});
export type WebhookEvent = InferSelectModel<typeof webhookEvents>;
export type InsertWebhookEvent = InferInsertModel<typeof webhookEvents>;