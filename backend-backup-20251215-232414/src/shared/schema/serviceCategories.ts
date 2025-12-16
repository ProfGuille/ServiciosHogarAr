import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
});

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = typeof serviceCategories.$inferInsert;