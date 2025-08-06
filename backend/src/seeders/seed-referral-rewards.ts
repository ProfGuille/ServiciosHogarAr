import { db } from "./db.js";
import { referralRewards } from "@shared/schema";


async function seedReferralRewards() {
  console.log("💰 Seeding referral rewards...");

  try {
    // Clear existing rewards
    await db.delete(referralRewards);

    // Default referral reward configurations
    const defaultRewards = [
      {
        name: "Bono para Profesional Referido",
        description: "Créditos gratis cuando un profesional se registra con un código de referido",
        rewardType: "provider_signup",
        creditAmount: 25, // 25 credits for new provider
        minimumPurchase: null,
        isActive: true,
      },
      {
        name: "Bono para Profesional Referidor",
        description: "Créditos cuando tu profesional referido hace su primera compra de créditos",
        rewardType: "provider_referrer_purchase",
        creditAmount: 100, // 100 credits for provider referrer
        minimumPurchase: null,
        isActive: true,
      },
      {
        name: "Logro Cliente Embajador",
        description: "Cuando un cliente refiere a 5 profesionales verificados",
        rewardType: "customer_ambassador",
        creditAmount: 0, // No credits for customers, just achievement
        minimumPurchase: null,
        isActive: true,
      },
      {
        name: "Bono Especial Profesional - 5 Referidos",
        description: "Bonus adicional para profesionales que refieren a 5 profesionales exitosos",
        rewardType: "provider_milestone_5",
        creditAmount: 250,
        minimumPurchase: null,
        isActive: true,
      },
      {
        name: "Bono Especial Profesional - 10 Referidos",
        description: "Bonus adicional para profesionales que refieren a 10 profesionales exitosos",
        rewardType: "provider_milestone_10",
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
