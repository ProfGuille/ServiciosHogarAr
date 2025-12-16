import { relations } from "drizzle-orm";
import { providerServices } from "../providerServices.js";
import { serviceProviders } from "../serviceProviders.js";

export const providerServicesRelations = relations(providerServices, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerServices.providerId],
    references: [serviceProviders.id],
  }),
}));