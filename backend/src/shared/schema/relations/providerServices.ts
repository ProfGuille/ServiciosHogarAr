import { relations } from "drizzle-orm";
import { providerServices } from "../providerServices";
import { serviceProviders } from "../serviceProviders";

export const providerServicesRelations = relations(providerServices, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerServices.providerId],
    references: [serviceProviders.id],
  }),
}));