import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";

export const serviceAreas = pgTable('service_areas', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  areaName: varchar('area_name', { length: 128 }),
});