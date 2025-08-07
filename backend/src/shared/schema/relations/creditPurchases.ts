import { relations } from "drizzle-orm";
import { creditPurchases } from "../creditPurchases";
import { serviceProviders } from "../serviceProviders";

export const creditPurchasesRelations = relations(creditPurchases, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [creditPurchases.providerId],
    references: [serviceProviders.id],
  }),
}));

