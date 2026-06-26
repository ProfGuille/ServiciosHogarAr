import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  achievementId: integer('achievement_id').notNull(),
  earnedAt: timestamp('earned_at').defaultNow(),
  progress: integer('progress').notNull().default(0),
  progressMax: integer('progress_max').notNull().default(1),
});

export type UserAchievement = InferSelectModel<typeof userAchievements>;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
