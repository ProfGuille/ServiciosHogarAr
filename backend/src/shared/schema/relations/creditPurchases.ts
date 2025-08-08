import { relations } from "drizzle-orm";
import { creditPurchases } from "../creditPurchases.js";
import { serviceProviders } from "../serviceProviders.js";

export const creditPurchasesRelations = relations(creditPurchases, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [creditPurchases.providerId],
    references: [serviceProviders.id],
  }),
}));

