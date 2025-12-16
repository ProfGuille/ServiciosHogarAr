import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";

export const routeOptimizations = pgTable('route_optimizations', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  routeData: varchar('route_data', { length: 1024 }),
});