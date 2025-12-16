import { pgTable, serial, integer, boolean, varchar } from "drizzle-orm/pg-core";

export const geofences = pgTable('geofences', {
  id: serial('id').primaryKey(),
  serviceProviderId: integer('service_provider_id').notNull(),
  name: varchar('name', { length: 128 }),
  isActive: boolean('is_active').notNull().default(true),
});