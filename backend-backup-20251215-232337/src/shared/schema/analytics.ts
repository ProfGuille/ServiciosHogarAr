import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

// Tabla de analytics events
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  event: varchar('event', { length: 64 }).notNull(),
  metadata: varchar('metadata', { length: 256 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Analytics = InferSelectModel<typeof analytics>;
export type InsertAnalytics = typeof analytics.$inferInsert;