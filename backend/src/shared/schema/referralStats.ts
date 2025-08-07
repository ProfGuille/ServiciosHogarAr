import { pgTable, serial, integer } from "drizzle-orm/pg-core";

export const referralStats = pgTable('referral_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  totalCreditsEarned: integer('total_credits_earned').default(0)
});

export type ReferralStats = typeof referralStats.$inferSelect;
export type InsertReferralStats = typeof referralStats.$inferInsert;