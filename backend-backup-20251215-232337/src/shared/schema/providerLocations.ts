import { pgTable, serial, integer, doublePrecision, varchar } from "drizzle-orm/pg-core";

export const providerLocations = pgTable('provider_locations', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  address: varchar('address', { length: 128 }),
});

export type ProviderLocation = typeof providerLocations.$inferSelect;
export type InsertProviderLocation = typeof providerLocations.$inferInsert;