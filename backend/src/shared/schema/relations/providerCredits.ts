import { relations } from "drizzle-orm";
import { providerCredits } from "../providerCredits";
import { serviceProviders } from "../serviceProviders";

export const providerCreditsRelations = relations(providerCredits, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerCredits.providerId],
    references: [serviceProviders.id],
  }),
}));

