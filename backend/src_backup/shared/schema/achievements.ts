import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { services } from './services';

export const serviceRequests = pgTable('service_requests', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  serviceId: integer('service_id').notNull().references(() => services.id),
  description: text('description'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow(),
});

