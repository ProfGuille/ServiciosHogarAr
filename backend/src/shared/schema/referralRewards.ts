import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const referralRewards = pgTable('referral_rewards', {
  id: serial('id').primaryKey(),
  referrerUserId: integer('referrer_user_id').notNull(),
  referredUserId: integer('referred_user_id').notNull(),
  rewardType: text('reward_type').notNull(),
  rewardAmount: integer('reward_amount').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  referrerUser: one(users, {
    fields: [referralRewards.referrerUserId],
    references: [users.id],
  }),
  referredUser: one(users, {
    fields: [referralRewards.referredUserId],
    references: [users.id],
  }),
}));

