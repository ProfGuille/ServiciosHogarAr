import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { serviceProviders } from './serviceProviders';
import { services } from './services';

export const leadResponses = pgTable('lead_responses', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull().references(() => serviceProviders.id),
  serviceId: integer('service_id').notNull().references(() => services.id),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const leadResponsesRelations = relations(leadResponses, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [leadResponses.providerId],
    references: [serviceProviders.id],
  }),
  service: one(services, {
    fields: [leadResponses.serviceId],
    references: [services.id],
  }),
}));

