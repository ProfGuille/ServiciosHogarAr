import { pgTable, serial, integer, varchar, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

// Push notification subscriptions for web push
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  endpoint: text('endpoint').notNull(),
  p256dhKey: text('p256dh_key').notNull(),
  authKey: text('auth_key').notNull(),
  userAgent: varchar('user_agent', { length: 512 }),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at').defaultNow(),
  isActive: boolean('is_active').default(true),
});

export type PushSubscription = InferSelectModel<typeof pushSubscriptions>;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;