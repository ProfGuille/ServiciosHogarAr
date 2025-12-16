import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";

export const achievementProgress = pgTable('achievement_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  achievementId: integer('achievement_id').notNull(),
  value: integer('value').notNull(),
  // ...otros campos
});

export type AchievementProgress = typeof achievementProgress.$inferSelect;
export type InsertAchievementProgress = typeof achievementProgress.$inferInsert;