import { pgTable, serial, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  isoCode: varchar('iso_code', { length: 8 }).notNull(),
  code: varchar('code', { length: 8 }),        // <-- Campo agregado
  isActive: boolean('is_active').notNull().default(true), // <-- Campo agregado
  sortOrder: integer('sort_order').default(0), // <-- Campo agregado
  // ...otros campos que tengas...
});

export type Language = InferSelectModel<typeof languages>;