import { db } from "./db";
import { referralRewards } from "@shared/schema";

async function seedReferralRewards() {
  console.log("💰 Seeding referral rewards...");

  try {
    // Clear existing rewards
    await db.delete(referralRewards);

    // Default referral reward configurations
    const defaultRewards = [
      {
        name: "Bono de Registro para Referido",
        description: "Créditos gratis cuando te registras con un código de referido",
        rewardType: "referred_signup",
        creditAmount: 50, // 50 credits for new user
        minimumPurchase: null,
        isActive: true,
      },
      {
        name: "Bono de Primera Compra para Referidor",
        description: "Créditos cuando tu referido hace su primera compra",
        rewardType: "referrer_purchase",
        creditAmount: 100, // 100 credits for referrer
        minimumPurchase: null,
        isActive: true,
      },
      {
        name: "Bono Especial por 5 Referidos",
        description: "Bonus adicional al alcanzar 5 referidos exitosos",
        rewardType: "milestone_5",
        creditAmount: 250,
        minimumPurchase: null,
        isActive: true,
      },
      {
        name: "Bono Especial por 10 Referidos",
        description: "Bonus adicional al alcanzar 10 referidos exitosos",
        rewardType: "milestone_10",
        creditAmount: 500,
        minimumPurchase: null,
        isActive: true,
      },
    ];

    await db.insert(referralRewards).values(defaultRewards);

    console.log(`✅ Successfully seeded ${defaultRewards.length} referral rewards`);
  } catch (error) {
    console.error("❌ Error seeding referral rewards:", error);
    throw error;
  }
}

// Run if called directly
seedReferralRewards()
  .then(() => {
    console.log("✅ Referral rewards seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Referral rewards seeding failed:", error);
    process.exit(1);
  });

export { seedReferralRewards };