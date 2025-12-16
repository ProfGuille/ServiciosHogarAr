import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  event: varchar('event', { length: 128 }),
  eventType: varchar('event_type', { length: 64 }), // Campo agregado
  createdAt: timestamp('created_at').defaultNow(),
  // ...otros campos que tengas...
});

export type AnalyticsEvent = InferSelectModel<typeof analyticsEvents>;