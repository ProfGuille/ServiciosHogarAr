import { relations } from "drizzle-orm";
import { providerCredits } from "../providerCredits.js";
import { serviceProviders } from "../serviceProviders.js";

export const providerCreditsRelations = relations(providerCredits, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerCredits.providerId],
    references: [serviceProviders.id],
  }),
}));

