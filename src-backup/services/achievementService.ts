import { db } from "../db";
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
} from "./shared/schema";
import { and, eq, gte, sql, lt, count } from "drizzle-orm";

interface AchievementCriteria {
  metric: string;
  value: number;
  operator?: 'gte' | 'eq' | 'lte';
}

export class AchievementService {
  // Check and award achievements for a user
  async checkAndAwardAchievements(userId: string) {
    try {
      // Get all active achievements
      const activeAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.isActive, true));

      // Get user's current achievements
      const userAchievementList = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const earnedAchievementIds = new Set(userAchievementList.map(ua => ua.achievementId));

      // Get user metrics
      const metrics = await this.getUserMetrics(userId);

      // Check each achievement
      const newAchievements: Achievement[] = [];
      
      for (const achievement of activeAchievements) {
        if (earnedAchievementIds.has(achievement.id)) {
          continue; // Already earned
        }

        const criteria = achievement.criteria as AchievementCriteria;
        const metricValue = metrics[criteria.metric] || 0;
        
        // Check if achievement criteria is met
        let criteriaMetOperator = criteria.operator || 'gte';
        let criteriaMet = false;
        
        switch (criteriaMetOperator) {
          case 'gte':
            criteriaMet = metricValue >= criteria.value;
            break;
          case 'eq':
            criteriaMet = metricValue === criteria.value;
            break;
          case 'lte':
            criteriaMet = metricValue <= criteria.value;
            break;
        }

        if (criteriaMet) {
          // Award achievement
          await db.insert(userAchievements).values({
            userId,
            achievementId: achievement.id,
            progress: criteria.value,
            progressMax: criteria.value,
            notified: false
          });
          
          newAchievements.push(achievement);
        } else {
          // Update progress for progressive achievements
          await this.updateAchievementProgress(userId, achievement.id, criteria.metric, metricValue);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Get all metrics for a user
  async getUserMetrics(userId: string) {
    const metrics: Record<string, number> = {};

    // Check if user is a provider
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId))
      .limit(1);

    if (provider) {
      // Provider metrics
      const [providerMetrics] = await db
        .select({
          completedJobs: count(serviceRequests.id),
        })
        .from(serviceRequests)
        .where(
          and(
            eq(serviceRequests.providerId, provider.id),
            eq(serviceRequests.status, 'completed')
          )
        );
      
      metrics.jobs_completed = providerMetrics.completedJobs || 0;

      // Average rating
      const [ratingMetrics] = await db
        .select({
          avgRating: sql`AVG(${reviews.rating})`.as('avgRating'),
          reviewCount: count(reviews.id),
        })
        .from(reviews)
        .where(eq(reviews.revieweeId, userId));

      metrics.average_rating = Number(ratingMetrics.avgRating) || 0;
      metrics.reviews_received = ratingMetrics.reviewCount || 0;

      // Response time
      const [responseMetrics] = await db
        .select({
          avgResponseTime: sql`AVG(EXTRACT(EPOCH FROM (${serviceRequests.updatedAt} - ${serviceRequests.createdAt})) / 3600)`.as('avgResponseTime'),
        })
        .from(serviceRequests)
        .where(
          and(
            eq(serviceRequests.providerId, provider.id),
            eq(serviceRequests.status, 'quoted')
          )
        );

      metrics.avg_response_hours = Number(responseMetrics.avgResponseTime) || 0;
    }

    // Customer metrics
    const [customerMetrics] = await db
      .select({
        bookingsMade: count(serviceRequests.id),
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.customerId, userId));

    metrics.bookings_made = customerMetrics.bookingsMade || 0;

    // Reviews given
    const [reviewMetrics] = await db
      .select({
        reviewsGiven: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.reviewerId, userId));

    metrics.reviews_given = reviewMetrics.reviewsGiven || 0;

    // Account age in days
    const [userInfo] = await db
      .select({
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (userInfo?.createdAt) {
      const daysSinceJoined = Math.floor(
        (Date.now() - new Date(userInfo.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      metrics.days_since_joined = daysSinceJoined;
    }

    return metrics;
  }

  // Update achievement progress
  async updateAchievementProgress(userId: string, achievementId: number, metric: string, value: number) {
    await db
      .insert(achievementProgress)
      .values({
        userId,
        achievementId,
        metric,
        value,
        lastUpdated: new Date()
      })
      .onConflictDoUpdate({
        target: [achievementProgress.userId, achievementProgress.achievementId, achievementProgress.metric],
        set: {
          value,
          lastUpdated: new Date()
        }
      });
  }

  // Get user achievements with details
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

    return userAchievementList.map(row => ({
      ...row.achievement,
      earnedAt: row.userAchievement.earnedAt,
      progress: row.userAchievement.progress,
      progressMax: row.userAchievement.progressMax,
    }));
  }

  // Get achievement progress for a user
  async getUserAchievementProgress(userId: string) {
    // Get all achievements not yet earned
    const earnedAchievements = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const earnedIds = earnedAchievements.map(a => a.achievementId);

    const unearnedAchievements = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.isActive, true),
          earnedIds.length > 0 ? sql`${achievements.id} NOT IN (${sql.join(earnedIds, sql`, `)})` : sql`true`
        )
      );

    // Get progress for unearned achievements
    const progressData = await db
      .select()
      .from(achievementProgress)
      .where(eq(achievementProgress.userId, userId));

    const progressMap = new Map(
      progressData.map(p => [`${p.achievementId}-${p.metric}`, p.value])
    );

    return unearnedAchievements.map(achievement => {
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

  // Mark achievements as notified
  async markAchievementsNotified(userId: string, achievementIds: number[]) {
    if (achievementIds.length === 0) return;

    await db
      .update(userAchievements)
      .set({ notified: true })
      .where(
        and(
          eq(userAchievements.userId, userId),
          sql`${userAchievements.achievementId} IN (${sql.join(achievementIds, sql`, `)})`
        )
      );
  }

  // Get unnotified achievements
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

    return unnotified.map(row => ({
      ...row.achievement,
      earnedAt: row.userAchievement.earnedAt,
    }));
  }

  // Get achievement statistics
  async getAchievementStats() {
    const [stats] = await db
      .select({
        totalAchievements: count(achievements.id),
        totalAwarded: count(userAchievements.id),
        uniqueUsers: sql`COUNT(DISTINCT ${userAchievements.userId})`.as('uniqueUsers'),
      })
      .from(achievements)
      .leftJoin(userAchievements, eq(achievements.id, userAchievements.achievementId));

    // Get top achievements
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
      topAchievements: topAchievements.map(row => ({
        ...row.achievement,
        awardCount: row.awardCount || 0,
      })),
    };
  }
}

export const achievementService = new AchievementService();