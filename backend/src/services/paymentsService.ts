import { db } from "../db.js";
import { creditPurchases } from "../shared/schema/creditPurchases.js";
import { providerCreditsService } from "./providerCreditsService.js";
import { eq } from "drizzle-orm";

export const paymentsService = {
  async registerPurchase(providerId: number, credits: number, amount: number, method: string) {
    const [purchase] = await db
      .insert(creditPurchases)
      .values({
        providerId,
        credits,
        amount: amount.toString(),
        paymentMethod: method,
        status: "pending"
      })
      .returning();
    return purchase;
  },

  /**
   * Obtiene una compra por ID
   * NUEVO: Necesario para el flujo atómico
   */
  async getPurchaseById(purchaseId: number) {
    const [purchase] = await db
      .select()
      .from(creditPurchases)
      .where(eq(creditPurchases.id, purchaseId))
      .limit(1);
    
    return purchase || null;
  },

  /**
   * LEGACY: Mantener para compatibilidad pero ya NO se usa
   * El nuevo flujo usa acreditar_creditos_atomico() directamente
   */
  async confirmPurchase(purchaseId: number) {
    const [purchase] = await db
      .select()
      .from(creditPurchases)
      .where(eq(creditPurchases.id, purchaseId));

    if (!purchase) throw new Error("Compra no encontrada");

    await providerCreditsService.addCredits(
      purchase.providerId,
      purchase.credits,
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
