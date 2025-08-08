import { relations } from "drizzle-orm";
import { serviceRequests } from "../serviceRequests.js";
import { clients } from "../clients.js";
import { serviceProviders } from "../serviceProviders.js";

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  client: one(clients, {
    fields: [serviceRequests.clientId],
    references: [clients.id],
  }),
  provider: one(serviceProviders, {
    fields: [serviceRequests.providerId],
    references: [serviceProviders.id],
  }),
}));

