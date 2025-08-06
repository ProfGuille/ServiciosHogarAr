import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const webhooks = pgTable('webhooks', {
  id: serial('id').primaryKey(),
  event: text('event').notNull(),
  payload: text('payload').notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow(),
});
