import { relations } from "drizzle-orm";
import { serviceRequests } from "../serviceRequests";
import { clients } from "../clients";
import { serviceProviders } from "../serviceProviders";

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

