import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: varchar('referrer_id').notNull(),
  referredId: varchar('referred_id'),
  referralCodeId: integer('referral_code_id'),
  status: varchar('status', { length: 32 }).default('pending'),
  rewardCredits: integer('reward_credits').default(0),
  rewardType: varchar('reward_type', { length: 64 }),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Referral = InferSelectModel<typeof referrals>;
export type InsertReferral = typeof referrals.$inferInsert;
