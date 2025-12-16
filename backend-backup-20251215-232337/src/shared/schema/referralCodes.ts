import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const referralCodes = pgTable('referral_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  code: varchar('code', { length: 64 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;