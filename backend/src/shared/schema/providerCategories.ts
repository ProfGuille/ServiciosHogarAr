import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const providerCategories = pgTable('provider_categories', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  categoryId: integer('category_id').notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  uniqueProviderCategory: unique().on(table.providerId, table.categoryId)
}));

export type ProviderCategory = InferSelectModel<typeof providerCategories>;
