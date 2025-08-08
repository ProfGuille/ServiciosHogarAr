import { referrals } from "@shared/schema/referrals";
import { referralRewards } from "@shared/schema/referralRewards";
import { db } from "../db.js";
import { eq } from "drizzle-orm";

/**
 * Obtiene las recompensas activas para referrals.
 */
export async function getActiveReferralRewards() {
  const activeRewards = await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.isActive, true));
  return activeRewards;
}

/**
 * Inserta una recompensa de referral.
 */
export async function insertReferralReward(params: {
  userId: number;
  amount: number;
  creditAmount: number;
}) {
  const { userId, amount, creditAmount } = params;
  return await db.insert(referralRewards).values({
    userId,
    rewardAmount: amount,
    creditAmount,
  });
}