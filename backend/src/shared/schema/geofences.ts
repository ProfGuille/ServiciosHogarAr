import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { serviceProviders } from './serviceProviders';

/**
 * geofences: áreas geográficas definidas por prestadores para limitar su radio de servicio
 */
export const geofences = pgTable('geofences', {
  id: serial('id').primaryKey(),
  serviceProviderId: integer('service_provider_id').notNull().references(() => serviceProviders.id),
  name: text('name').notNull(),
  coordinates: text('coordinates').notNull(), // GeoJSON en formato texto
});

/**
 * Relaciones: cada geofence pertenece a un solo prestador
 */
export const geofencesRelations = relations(geofences, ({ one }) => ({
  serviceProvider: one(serviceProviders, {
    fields: [geofences.serviceProviderId],
    references: [serviceProviders.id],
  }),
}));

