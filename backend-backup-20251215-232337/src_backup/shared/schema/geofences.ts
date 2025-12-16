import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { serviceProviders } from './serviceProviders';

export const geofences = pgTable('geofences', {
  id: serial('id').primaryKey(),
  serviceProviderId: integer('service_provider_id').notNull().references(() => serviceProviders.id),
  name: text('name').notNull(),
  coordinates: text('coordinates').notNull(), // GeoJSON string
});

export const geofencesRelations = relations(geofences, ({ one }) => ({
  serviceProvider: one(serviceProviders, {
    fields: [geofences.serviceProviderId],
    references: [serviceProviders.id],
  }),
}));
