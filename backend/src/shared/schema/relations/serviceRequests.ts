import { relations } from "drizzle-orm";
import { serviceRequests } from "../serviceRequests.js";
import { users } from "../users.js";
import { serviceProviders } from "../serviceProviders.js";

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  customer: one(users, {
    fields: [serviceRequests.customerId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [serviceRequests.providerId],
    references: [serviceProviders.id],
  }),
}));

