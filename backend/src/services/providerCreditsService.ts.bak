import { db } from "../db.js";
import { providerCredits } from "../shared/schema/providerCredits.js";
import { creditPurchases } from "../shared/schema/creditPurchases.js";
import { eq } from "drizzle-orm";

export const providerCreditsService = {
  async getCredits(providerId: number) {
    const [row] = await db
      .select()
      .from(providerCredits)
      .where(eq(providerCredits.providerId, providerId));
    return row?.currentCredits ?? 0;
  },

  async addCredits(providerId: number, amount: number, purchaseId?: number) {
    const [existing] = await db
      .select()
      .from(providerCredits)
      .where(eq(providerCredits.providerId, providerId));

    if (existing) {
      const newAmount = existing.currentCredits + amount;
      const newTotal = existing.totalPurchased + amount;
      
      await db
        .update(providerCredits)
        .set({ 
          currentCredits: newAmount,
          totalPurchased: newTotal,
          lastPurchaseAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(providerCredits.providerId, providerId));
    } else {
      await db.insert(providerCredits).values({
        providerId,
        currentCredits: amount,
        totalPurchased: amount,
        totalUsed: 0
      });
    }

    if (purchaseId) {
      await db
        .update(creditPurchases)
        .set({ status: "completed" })
        .where(eq(creditPurchases.id, purchaseId));
    }

    return existing ? existing.currentCredits + amount : amount;
  },

  async consumeCredit(providerId: number, amount = 1) {
    const [existing] = await db
      .select()
      .from(providerCredits)
      .where(eq(providerCredits.providerId, providerId));

    if (!existing || existing.currentCredits < amount) {
      throw new Error("Créditos insuficientes");
    }

    const newAmount = existing.currentCredits - amount;
    const newUsed = existing.totalUsed + amount;

    await db
      .update(providerCredits)
      .set({ 
        currentCredits: newAmount,
        totalUsed: newUsed,
        updatedAt: new Date()
      })
      .where(eq(providerCredits.providerId, providerId));

    return newAmount;
  },
};
