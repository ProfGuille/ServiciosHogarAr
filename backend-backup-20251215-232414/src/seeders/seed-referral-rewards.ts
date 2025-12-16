import { referralRewards, InsertReferralReward } from "@shared/schema/referralRewards";
import { db } from "../db.js";

export async function seedReferralRewards() {
  const data: InsertReferralReward[] = [
    // Ejemplo: { userId: 1, rewardAmount: 10 }
  ];
  await db.insert(referralRewards).values(data);
}