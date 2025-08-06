import { relations } from "drizzle-orm";
import { serviceRequests } from "../serviceRequests";
import { clients } from "../clients";
import { services } from "../services";

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  client: one(clients, {
    fields: [serviceRequests.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [serviceRequests.serviceId],
    references: [services.id],
  }),
}));

