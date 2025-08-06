import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clients } from './clients';

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventData: text('event_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relación con clients
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  client: one(clients, {
    fields: [analyticsEvents.clientId],
    references: [clients.id],
  }),
}));

