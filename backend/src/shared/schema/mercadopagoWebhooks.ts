import { pgTable, serial, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const mercadopagoWebhooks = pgTable('mercadopago_webhooks', {
  id: serial('id').primaryKey(),
  paymentId: varchar('payment_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }),
  eventId: varchar('event_id', { length: 255 }).unique(),
  action: varchar('action', { length: 50 }),
  type: varchar('type', { length: 50 }),
  apiVersion: varchar('api_version', { length: 20 }),
  data: jsonb('data'),
  signature: varchar('signature', { length: 500 }),
  requestId: varchar('request_id', { length: 255 }),
  processed: boolean('processed').default(false),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow()
});
