import { pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const providerProfileChanges = pgTable('provider_profile_changes', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  changedBy: varchar('changed_by'),
  fieldName: varchar('field_name', { length: 100 }),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type ProviderProfileChange = InferSelectModel<typeof providerProfileChanges>;
export type InsertProviderProfileChange = typeof providerProfileChanges.$inferInsert;
