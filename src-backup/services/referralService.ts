import { db } from "../db";
import { 
  referralCodes, 
  referrals, 
  referralRewards, 
  referralStats,
  payments,
  users,
  type InsertReferral,
  type ReferralCode,
  type ReferralReward,
  type ReferralStats
} from "./shared/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

export class ReferralService {
  // Generate a unique referral code for a user
  async generateReferralCode(userId: string): Promise<ReferralCode> {
    // Check if user already has an active code
    const existingCode = await db
      .select()
      .from(referralCodes)
      .where(
        and(
          eq(referralCodes.userId, userId),
          sql`${referralCodes.expiresAt} IS NULL OR ${referralCodes.expiresAt} > NOW()`
        )
      )
      .limit(1);

    if (existingCode.length > 0) {
      return existingCode[0];
    }

    // Generate a new unique code
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      code = nanoid(8).toUpperCase(); // 8 character code
      const existing = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, code))
        .limit(1);
      
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    const [newCode] = await db
      .insert(referralCodes)
      .values({
        userId,
        code: code!,
        expiresAt: null, // Never expires
      })
      .returning();

    return newCode;
  }

  // Get or create referral stats for a user
  async getOrCreateReferralStats(userId: string): Promise<ReferralStats> {
    const [existingStats] = await db
      .select()
      .from(referralStats)
      .where(eq(referralStats.userId, userId))
      .limit(1);

    if (existingStats) {
      return existingStats;
    }

    const [newStats] = await db
      .insert(referralStats)
      .values({ userId })
      .returning();

    return newStats;
  }

  // Apply a referral code during signup
  async applyReferralCode(referredUserId: string, code: string): Promise<boolean> {
    try {
      // Find the referral code
      const [referralCode] = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, code))
        .limit(1);

      if (!referralCode) {
        return false;
      }

      // Check if code is expired
      if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
        return false;
      }

      // Check if referrer is trying to refer themselves
      if (referralCode.userId === referredUserId) {
        return false;
      }

      // Check if user was already referred
      const existingReferral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referredId, referredUserId))
        .limit(1);

      if (existingReferral.length > 0) {
        return false;
      }

      // Get active signup rewards
      const rewards = await this.getActiveRewards();
      const signupRewards = rewards.filter(r => 
        r.rewardType === "referrer_signup" || r.rewardType === "referred_signup"
      );

      // Create the referral record
      await db.insert(referrals).values({
        referrerId: referralCode.userId,
        referredId: referredUserId,
        referralCodeId: referralCode.id,
        status: "pending",
        rewardType: "signup_bonus",
        createdAt: new Date(),
      });

      // Award signup bonus to referred user
      const referredSignupReward = signupRewards.find(r => r.rewardType === "referred_signup");
      if (referredSignupReward) {
        await this.awardReferralBonus(referredUserId, referralCode.userId, referredSignupReward.creditAmount, "referred_signup");
      }

      // Update referrer stats
      await this.updateReferralStats(referralCode.userId, 1, 0);

      return true;
    } catch (error) {
      console.error("Error applying referral code:", error);
      return false;
    }
  }

  // Complete a referral when the referred user makes their first purchase
  async completeReferral(referredUserId: string): Promise<void> {
    try {
      // Find the referral
      const [referral] = await db
        .select()
        .from(referrals)
        .where(
          and(
            eq(referrals.referredId, referredUserId),
            eq(referrals.status, "pending")
          )
        )
        .limit(1);

      if (!referral) {
        return;
      }

      // Get active rewards
      const rewards = await this.getActiveRewards();
      const purchaseReward = rewards.find(r => r.rewardType === "referrer_purchase");

      if (purchaseReward) {
        // Award bonus to referrer for successful referral
        await this.awardReferralBonus(
          referral.referrerId, 
          referral.referredId, 
          purchaseReward.creditAmount, 
          "referrer_purchase"
        );

        // Update referral status
        await db
          .update(referrals)
          .set({
            status: "completed",
            completedAt: new Date(),
            rewardCredits: purchaseReward.creditAmount,
          })
          .where(eq(referrals.id, referral.id));

        // Update referrer stats
        const stats = await this.getOrCreateReferralStats(referral.referrerId);
        await db
          .update(referralStats)
          .set({
            successfulReferrals: stats.successfulReferrals + 1,
            totalCreditsEarned: stats.totalCreditsEarned + purchaseReward.creditAmount,
            lastReferralAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(referralStats.userId, referral.referrerId));
      }
    } catch (error) {
      console.error("Error completing referral:", error);
    }
  }

  // Award referral bonus credits
  private async awardReferralBonus(
    userId: string, 
    relatedUserId: string, 
    credits: number, 
    rewardType: string
  ): Promise<void> {
    // Create a payment record for the credit bonus
    await db.insert(payments).values({
      userId,
      amount: "0", // Free credits
      credits,
      status: "completed",
      paymentMethod: "referral_bonus",
      description: `Referral bonus: ${rewardType}`,
      metadata: { referralUserId: relatedUserId, rewardType },
    });

    // Update user's credit balance would be handled by payment processing
    console.log(`Awarded ${credits} credits to user ${userId} for ${rewardType}`);
  }

  // Get active referral rewards
  async getActiveRewards(): Promise<ReferralReward[]> {
    return await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.isActive, true));
  }

  // Get user's referral history
  async getUserReferrals(userId: string) {
    const sentReferrals = await db
      .select({
        id: referrals.id,
        referredUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        status: referrals.status,
        rewardCredits: referrals.rewardCredits,
        createdAt: referrals.createdAt,
        completedAt: referrals.completedAt,
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referredId, users.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(sql`${referrals.createdAt} DESC`);

    return sentReferrals;
  }

  // Update referral stats
  private async updateReferralStats(
    userId: string, 
    newReferrals: number = 0, 
    newCredits: number = 0
  ): Promise<void> {
    const stats = await this.getOrCreateReferralStats(userId);
    
    await db
      .update(referralStats)
      .set({
        totalReferrals: stats.totalReferrals + newReferrals,
        totalCreditsEarned: stats.totalCreditsEarned + newCredits,
        lastReferralAt: newReferrals > 0 ? new Date() : stats.lastReferralAt,
        updatedAt: new Date(),
      })
      .where(eq(referralStats.userId, userId));
  }
}

export const referralService = new ReferralService();