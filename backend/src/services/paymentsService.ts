import { db } from "../db.js";
import { creditPurchases } from "../shared/schema/creditPurchases.js";
import { providerCreditsService } from "./providerCreditsService.js";
import { eq } from "drizzle-orm";

export const paymentsService = {
  async registerPurchase(providerId: number, amount: number, method: string) {
    const [purchase] = await db
      .insert(creditPurchases)
      .values({
        providerId,
        userId: providerId,
        amount,
        status: "pending",
        method,
      })
      .returning();

    return purchase;
  },

  async confirmPurchase(purchaseId: number) {
    const [purchase] = await db
      .select()
      .from(creditPurchases)
      .where(eq(creditPurchases.id, purchaseId));

    if (!purchase) throw new Error("Compra no encontrada");

    await providerCreditsService.addCredits(
      purchase.providerId,
      purchase.amount,
      purchase.id
    );

    return true;
  },

  async failPurchase(purchaseId: number) {
    await db
      .update(creditPurchases)
      .set({ status: "failed" })
      .where(eq(creditPurchases.id, purchaseId));
  },
};

