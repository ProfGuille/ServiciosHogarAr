import { pgTable, serial, integer, varchar, boolean } from "drizzle-orm/pg-core";

// Tabla de rewards por referral
export const referralRewards = pgTable('referral_rewards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  rewardAmount: integer('reward_amount').notNull(),
  rewardType: varchar('reward_type', { length: 32 }),
  creditAmount: integer('credit_amount').default(0),
  isActive: boolean('is_active').notNull().default(true)
});

// Tipos para selección e inserción
export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;