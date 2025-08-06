import { db } from "../db.js";
import { 
  achievements, 
  userAchievements, 
  achievementProgress,
  serviceRequests,
  reviews,
  serviceProviders,
  users,
  type Achievement,
  type UserAchievement,
  type InsertUserAchievement
} from "@shared/schema";

import { and, eq, gte, sql, lt, count } from "drizzle-orm";

interface AchievementCriteria {
  metric: string;
  value: number;
  operator?: 'gte' | 'eq' | 'lte';
}

export class AchievementService {
  // ...

  async checkAndAwardAchievements(userId: string) {
    try {
      // ...
      const earnedAchievementIds = new Set(userAchievementList.map((ua: UserAchievement) => ua.achievementId));
      // ...
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // ...

  async getUserAchievements(userId: string) {
    const userAchievementList = await db
      .select({
        achievement: achievements,
        userAchievement: userAchievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(userAchievements.earnedAt);

    return userAchievementList.map((row: {achievement: Achievement; userAchievement: UserAchievement}) => ({
      ...row.achievement,
      earnedAt: row.userAchievement.earnedAt,
      progress: row.userAchievement.progress,
      progressMax: row.userAchievement.progressMax,
    }));
  }

  async getUserAchievementProgress(userId: string) {
    const earnedAchievements = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const earnedIds = earnedAchievements.map((a: { achievementId: number }) => a.achievementId);

    const unearnedAchievements = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.isActive, true),
          earnedIds.length > 0 ? sql`${achievements.id} NOT IN (${sql.join(earnedIds, sql`, `)})` : sql`true`
        )
      );

    const progressData = await db
      .select()
      .from(achievementProgress)
      .where(eq(achievementProgress.userId, userId));

    const progressMap = new Map(
      progressData.map((p: { achievementId: number; metric: string; value: number }) => [`${p.achievementId}-${p.metric}`, p.value])
    );

    return unearnedAchievements.map((achievement: Achievement) => {
      const criteria = achievement.criteria as AchievementCriteria;
      const currentValue = progressMap.get(`${achievement.id}-${criteria.metric}`) || 0;
      
      return {
        ...achievement,
        currentProgress: currentValue,
        targetProgress: criteria.value,
        percentComplete: Math.min(100, Math.round((currentValue / criteria.value) * 100))
      };
    });
  }

  // Nuevo método para marcar logros como notificados
  async markAchievementsNotified(userId: string, achievementIds: number[]): Promise<void> {
    if (achievementIds.length === 0) return;

    await db
      .update(userAchievements)
      .set({ notified: true })
      .where(
        and(
          eq(userAchievements.userId, userId),
          userAchievements.achievementId.in(achievementIds)
        )
      );
  }

  async getUnnotifiedAchievements(userId: string) {
    const unnotified = await db
      .select({
        achievement: achievements,
        userAchievement: userAchievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.notified, false)
        )
      );

    return unnotified.map((row: { achievement: Achievement; userAchievement: { earnedAt: Date } }) => ({
      ...row.achievement,
      earnedAt: row.userAchievement.earnedAt,
    }));
  }

  async getAchievementStats() {
    const [stats] = await db
      .select({
        totalAchievements: count(achievements.id),
        totalAwarded: count(userAchievements.id),
        uniqueUsers: sql`COUNT(DISTINCT ${userAchievements.userId})`.as('uniqueUsers'),
      })
      .from(achievements)
      .leftJoin(userAchievements, eq(achievements.id, userAchievements.achievementId));

    const topAchievements = await db
      .select({
        achievement: achievements,
        awardCount: count(userAchievements.id).as('awardCount'),
      })
      .from(achievements)
      .leftJoin(userAchievements, eq(achievements.id, userAchievements.achievementId))
      .groupBy(achievements.id)
      .orderBy(sql`${count(userAchievements.id)} DESC`)
      .limit(5);

    return {
      totalAchievements: stats.totalAchievements || 0,
      totalAwarded: stats.totalAwarded || 0,
      uniqueUsers: Number(stats.uniqueUsers) || 0,
      topAchievements: topAchievements.map((row: {achievement: Achievement; awardCount: number}) => ({
        ...row.achievement,
        awardCount: row.awardCount || 0,
      })),
    };
  }
}

export const achievementService = new AchievementService();

