import { pgTable, serial, integer, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 64 }).notNull(),
  userId: varchar('user_id'),
  providerId: integer('provider_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type AnalyticsEvent = InferSelectModel<typeof analyticsEvents>;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
