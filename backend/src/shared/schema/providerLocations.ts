import { pgTable, serial, integer, doublePrecision, varchar, timestamp } from "drizzle-orm/pg-core";

export const providerLocations = pgTable('provider_locations', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  address: varchar('address', { length: 128 }),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 100 }),
  neighborhood: varchar('neighborhood', { length: 100 }),
  coverageRadiusKm: integer('coverage_radius_km'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ProviderLocation = typeof providerLocations.$inferSelect;
export type InsertProviderLocation = typeof providerLocations.$inferInsert;