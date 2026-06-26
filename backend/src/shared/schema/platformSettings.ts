import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const platformSettings = pgTable('platform_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type PlatformSetting = InferSelectModel<typeof platformSettings>;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;
