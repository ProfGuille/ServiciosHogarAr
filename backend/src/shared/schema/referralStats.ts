import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const referralStats = pgTable('referral_stats', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  totalReferrals: integer('total_referrals').notNull().default(0),
  successfulReferrals: integer('successful_referrals').notNull().default(0),
  totalCreditsEarned: integer('total_credits_earned').notNull().default(0),
  lastReferralAt: timestamp('last_referral_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ReferralStats = InferSelectModel<typeof referralStats>;
export type InsertReferralStats = typeof referralStats.$inferInsert;
