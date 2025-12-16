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

    return row?.credits ?? 0;
  },

  async addCredits(providerId: number, amount: number, purchaseId?: number) {
    const current = await this.getCredits(providerId);

    const newAmount = current + amount;

    await db
      .insert(providerCredits)
      .values({
        providerId,
        credits: newAmount,
      })
      .onConflictDoUpdate({
        target: providerCredits.providerId,
        set: { credits: newAmount, updatedAt: new Date() },
      });

    if (purchaseId) {
      await db
        .update(creditPurchases)
        .set({ status: "completed" })
        .where(eq(creditPurchases.id, purchaseId));
    }

    return newAmount;
  },

  async consumeCredit(providerId: number, amount = 1) {
    const current = await this.getCredits(providerId);

    if (current < amount) {
      throw new Error("Créditos insuficientes");
    }

    const newAmount = current - amount;

    await db
      .update(providerCredits)
      .set({ credits: newAmount, updatedAt: new Date() })
      .where(eq(providerCredits.providerId, providerId));

    return newAmount;
  },
};

